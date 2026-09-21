export interface Coordinates {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/**
 * Calculates Haversine distance between two geographic coordinates in meters.
 */
export function calculateHaversineDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Computes a Tile Quadkey for spatial indexing at specified zoom level (default 18 ~ 15m resolution).
 */
export function getQuadKey(coord: Coordinates, zoom: number = 18): string {
  const lat = Math.max(-85.05112878, Math.min(85.05112878, coord.lat));
  const lng = Math.max(-180, Math.min(180, coord.lng));

  const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const y = Math.floor(
    (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * Math.pow(2, zoom)
  );

  let quadKey = '';
  for (let i = zoom; i > 0; i--) {
    let digit = 0;
    const mask = 1 << (i - 1);
    if ((x & mask) !== 0) digit++;
    if ((y & mask) !== 0) digit += 2;
    quadKey += digit.toString();
  }
  return quadKey;
}

/**
 * Generates a BoundingBox around a route path given a search radius buffer in meters.
 */
export function getRouteBoundingBox(routeCoords: Coordinates[], bufferMeters: number = 50): BoundingBox {
  if (routeCoords.length === 0) {
    return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
  }

  let minLat = routeCoords[0].lat;
  let maxLat = routeCoords[0].lat;
  let minLng = routeCoords[0].lng;
  let maxLng = routeCoords[0].lng;

  for (const c of routeCoords) {
    if (c.lat < minLat) minLat = c.lat;
    if (c.lat > maxLat) maxLat = c.lat;
    if (c.lng < minLng) minLng = c.lng;
    if (c.lng > maxLng) maxLng = c.lng;
  }

  // Convert buffer meters to approx degrees (1 deg ~ 111,000 m)
  const latBuffer = bufferMeters / 111000;
  const lngBuffer = bufferMeters / (111000 * Math.cos((minLat * Math.PI) / 180));

  return {
    minLat: minLat - latBuffer,
    maxLat: maxLat + latBuffer,
    minLng: minLng - lngBuffer,
    maxLng: maxLng + lngBuffer,
  };
}

/**
 * Checks if a coordinate point falls inside a given BoundingBox.
 */
export function isPointInBoundingBox(point: Coordinates, bbox: BoundingBox): boolean {
  return (
    point.lat >= bbox.minLat &&
    point.lat <= bbox.maxLat &&
    point.lng >= bbox.minLng &&
    point.lng <= bbox.maxLng
  );
}

/**
 * Determines if a barrier intersects with any segment of a route within a proximity threshold.
 */
export function isBarrierOnRouteSegment(
  barrierCoord: Coordinates,
  routeCoords: Coordinates[],
  proximityMeters: number = 25
): boolean {
  for (let i = 0; i < routeCoords.length - 1; i++) {
    const p1 = routeCoords[i];
    const p2 = routeCoords[i + 1];

    const distToStart = calculateHaversineDistance(barrierCoord, p1);
    const distToEnd = calculateHaversineDistance(barrierCoord, p2);

    if (distToStart <= proximityMeters || distToEnd <= proximityMeters) {
      return true;
    }
  }
  return false;
}

/**
 * Computes remaining route distance in meters from a given waypoint index to destination.
 */
export function getRemainingRouteDistance(
  routeCoords: Coordinates[],
  fromIndex: number
): number {
  let total = 0;
  for (let i = fromIndex; i < routeCoords.length - 1; i++) {
    total += calculateHaversineDistance(routeCoords[i], routeCoords[i + 1]);
  }
  return total;
}
