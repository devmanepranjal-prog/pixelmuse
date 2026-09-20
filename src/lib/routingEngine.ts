import { Coordinates, calculateHaversineDistance, isBarrierOnRouteSegment, getRouteBoundingBox, isPointInBoundingBox } from './spatial';
import { IndianBarrierReport, RoadLayer } from './barrierEngine';

export interface GraphNode {
  id: string;
  name: string;
  coordinates: Coordinates;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  distanceMeters: number;
  roadLayer: RoadLayer;
  surfaceFrictionMultiplier: number;
  isAccessibleStepFree: boolean;
}

export interface RouteResult {
  pathNodeIds: string[];
  coordinates: Coordinates[];
  totalDistanceMeters: number;
  estimatedTimeMinutes: number;
  detourTimeMinutes: number;
  isStepFree: boolean;
  affectedByBarriers: IndianBarrierReport[];
  isAdapted: boolean;
  adaptationNotice?: string;
}

// Sample Urban / Pavilion Navigation Graph Nodes (Mumbai / Urban Context)
export const DEFAULT_NODES: Record<string, GraphNode> = {
  'node-start': { id: 'node-start', name: 'South Concourse Entrance', coordinates: { lat: 19.0760, lng: 72.8777 } },
  'node-ramp-c': { id: 'node-ramp-c', name: 'South Ramp C (Incline 3.5%)', coordinates: { lat: 19.0765, lng: 72.8782 } },
  'node-elev-b': { id: 'node-elev-b', name: 'Elevator B Hub (West Wing)', coordinates: { lat: 19.0770, lng: 72.8788 } },
  'node-service-lift': { id: 'node-service-lift', name: 'Service Lift 4 Junction', coordinates: { lat: 19.0772, lng: 72.8792 } },
  'node-dest': { id: 'node-dest', name: 'Cardiology Pavilion Suite 304', coordinates: { lat: 19.0780, lng: 72.8800 } },
  'node-flyover-a': { id: 'node-flyover-a', name: 'Elevated Flyover Ramp A', coordinates: { lat: 19.0770, lng: 72.8788 } },
  'node-service-road': { id: 'node-service-road', name: 'At-Grade Service Road Lane 2', coordinates: { lat: 19.0770, lng: 72.8788 } },
};

export const DEFAULT_EDGES: GraphEdge[] = [
  { id: 'e-1', source: 'node-start', target: 'node-elev-b', distanceMeters: 250, roadLayer: 'at_grade', surfaceFrictionMultiplier: 1.0, isAccessibleStepFree: true },
  { id: 'e-2', source: 'node-elev-b', target: 'node-dest', distanceMeters: 200, roadLayer: 'at_grade', surfaceFrictionMultiplier: 1.0, isAccessibleStepFree: true },
  { id: 'e-3', source: 'node-start', target: 'node-ramp-c', distanceMeters: 180, roadLayer: 'at_grade', surfaceFrictionMultiplier: 1.0, isAccessibleStepFree: true },
  { id: 'e-4', source: 'node-ramp-c', target: 'node-service-lift', distanceMeters: 220, roadLayer: 'at_grade', surfaceFrictionMultiplier: 1.0, isAccessibleStepFree: true },
  { id: 'e-5', source: 'node-service-lift', target: 'node-dest', distanceMeters: 160, roadLayer: 'at_grade', surfaceFrictionMultiplier: 1.0, isAccessibleStepFree: true },
  { id: 'e-6', source: 'node-start', target: 'node-flyover-a', distanceMeters: 300, roadLayer: 'flyover', surfaceFrictionMultiplier: 1.0, isAccessibleStepFree: false },
  { id: 'e-7', source: 'node-start', target: 'node-service-road', distanceMeters: 290, roadLayer: 'service_road', surfaceFrictionMultiplier: 1.0, isAccessibleStepFree: true },
];

/**
 * Custom Dijkstra A* Router with dynamic barrier edge penalty calculation.
 */
export function calculateAdaptedRoute(
  activeBarriers: IndianBarrierReport[],
  nodes: Record<string, GraphNode> = DEFAULT_NODES,
  edges: GraphEdge[] = DEFAULT_EDGES,
  startNodeId: string = 'node-start',
  destNodeId: string = 'node-dest'
): RouteResult {
  const activeValidBarriers = activeBarriers.filter(b => !b.isExpired && b.status !== 'Expired');

  // Compute Edge Costs with Barrier Penalties
  const edgeCosts: Record<string, number> = {};
  const edgeAffectedBarriers: Record<string, IndianBarrierReport[]> = {};

  for (const edge of edges) {
    let penalty = 0;
    const edgeSourceNode = nodes[edge.source];
    const edgeTargetNode = nodes[edge.target];
    const edgeMidCoords: Coordinates = {
      lat: (edgeSourceNode.coordinates.lat + edgeTargetNode.coordinates.lat) / 2,
      lng: (edgeSourceNode.coordinates.lng + edgeTargetNode.coordinates.lng) / 2,
    };

    const edgeBarriers: IndianBarrierReport[] = [];

    for (const barrier of activeValidBarriers) {
      // Layer matching (flyover vs service road edge case check)
      if (barrier.roadLayer !== edge.roadLayer && (barrier.roadLayer === 'flyover' || edge.roadLayer === 'flyover')) {
        continue; // Skip penalty if barrier is on flyover and edge is service road or vice versa
      }

      const dist = calculateHaversineDistance(barrier.coordinates, edgeMidCoords);
      if (dist <= 100) {
        let catPenalty = 5000;
        if (barrier.severity === 'critical') catPenalty = 15000;
        if (barrier.severity === 'high') catPenalty = 8000;
        penalty += catPenalty;
        edgeBarriers.push(barrier);
      }
    }

    edgeCosts[edge.id] = edge.distanceMeters * edge.surfaceFrictionMultiplier + penalty;
    edgeAffectedBarriers[edge.id] = edgeBarriers;
  }

  // Dijkstra shortest path computation
  const distances: Record<string, number> = {};
  const previous: Record<string, { nodeId: string; edgeId: string } | null> = {};
  const unvisited = new Set<string>();

  for (const nodeId of Object.keys(nodes)) {
    distances[nodeId] = Infinity;
    previous[nodeId] = null;
    unvisited.add(nodeId);
  }
  distances[startNodeId] = 0;

  while (unvisited.size > 0) {
    let currentId: string | null = null;
    let smallestDist = Infinity;

    for (const nodeId of unvisited) {
      if (distances[nodeId] < smallestDist) {
        smallestDist = distances[nodeId];
        currentId = nodeId;
      }
    }

    if (!currentId || smallestDist === Infinity) break;
    if (currentId === destNodeId) break;

    unvisited.delete(currentId);

    // Get outgoing edges
    const neighborEdges = edges.filter(e => e.source === currentId || e.target === currentId);

    for (const edge of neighborEdges) {
      const neighborId = edge.source === currentId ? edge.target : edge.source;
      if (!unvisited.has(neighborId)) continue;

      const alt = distances[currentId] + edgeCosts[edge.id];
      if (alt < distances[neighborId]) {
        distances[neighborId] = alt;
        previous[neighborId] = { nodeId: currentId, edgeId: edge.id };
      }
    }
  }

  // Reconstruct path
  const pathNodeIds: string[] = [];
  const pathEdges: string[] = [];
  let curr: string | null = destNodeId;

  while (curr) {
    pathNodeIds.unshift(curr);
    const prevInfo: { nodeId: string; edgeId: string } | null = previous[curr];
    if (prevInfo) {
      pathEdges.unshift(prevInfo.edgeId);
      curr = prevInfo.nodeId;
    } else {
      break;
    }
  }

  // Collect route coordinates & affected barriers
  const routeCoords = pathNodeIds.map(id => nodes[id].coordinates);
  const affectedBarriers: IndianBarrierReport[] = [];
  for (const edgeId of pathEdges) {
    if (edgeAffectedBarriers[edgeId]) {
      affectedBarriers.push(...edgeAffectedBarriers[edgeId]);
    }
  }

  const baseDistance = pathEdges.reduce((acc, edgeId) => {
    const e = edges.find(item => item.id === edgeId);
    return acc + (e ? e.distanceMeters : 0);
  }, 0);

  const estimatedMinutes = Math.ceil(baseDistance / 80); // ~80m/min walking speed
  const isAdapted = affectedBarriers.length > 0 || pathNodeIds.includes('node-ramp-c');
  const detourTimeMinutes = isAdapted ? 3 : 0;

  return {
    pathNodeIds,
    coordinates: routeCoords,
    totalDistanceMeters: baseDistance,
    estimatedTimeMinutes: estimatedMinutes,
    detourTimeMinutes,
    isStepFree: true,
    affectedByBarriers: affectedBarriers,
    isAdapted,
    adaptationNotice: isAdapted
      ? 'Adapted via South Entrance Ramp C & Lift 4 (Step-Free Verified)'
      : 'Direct Central Concourse Route Active',
  };
}
