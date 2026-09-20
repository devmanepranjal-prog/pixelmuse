import { Coordinates, calculateHaversineDistance, getQuadKey } from './spatial';
import { computeBarrierConfidence } from './confidence';

export type RoadLayer = 'flyover' | 'service_road' | 'at_grade';

export interface IndianBarrierReport {
  id: string;
  title: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  status: 'Reported' | 'Verified' | 'Under Review' | 'Resolved' | 'Expired';
  votes: number;
  downvotes: number;
  date: string;
  createdAt: number; // Unix timestamp ms
  expiresAt: number; // Unix timestamp ms
  ttlSeconds: number;
  initialTtlSeconds: number;
  description: string;
  coordinates: Coordinates;
  roadLayer: RoadLayer;
  quadKey: string;
  clusterCount: number;
  isExpired: boolean;
  source: string;
  photoAttached: boolean;
  photoUrl?: string;
  aiVerification?: {
    verified: boolean;
    label: string;
    confidence: number;
    details?: string;
  };
  confidenceScore: number;
}

export const CATEGORY_TTL_SECONDS: Record<string, number> = {
  'Flooding/Waterlogging': 7200,      // 2 hours
  'Waterlogging': 7200,
  'Construction': 43200,              // 12 hours
  'Construction Obstruction': 43200,
  'Blocked Ramp/Flyover': 3600,       // 1 hour
  'Blocked Flyover': 3600,
  'Police Checkpoint/Barricade': 10800,// 3 hours
  'Police Checkpoint': 10800,
  'Fallen Tree/Pothole Obstruction': 14400, // 4 hours
  'Elevator Outage': 21600,           // 6 hours
  'Missing Curb Cut': 28800,          // 8 hours
  'Door Sensor Malfunction': 14400,
  'Steep Slope Ramp': 28800,
  'Other Hazard': 14400,
};

export function getDefaultTtlForCategory(category: string): number {
  for (const [key, ttl] of Object.entries(CATEGORY_TTL_SECONDS)) {
    if (category.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(category.toLowerCase())) {
      return ttl;
    }
  }
  return 14400; // Default 4 hours
}

/**
 * Creates a brand new IndianBarrierReport object initialized with spatial index, TTL bounds,
 * photo proof verification, and calculated accessibility confidence score.
 */
export function createBarrierReport(input: {
  title: string;
  category: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description?: string;
  coordinates?: Coordinates;
  roadLayer?: RoadLayer;
  source?: string;
  photoAttached?: boolean;
  photoUrl?: string;
  aiVerification?: {
    verified: boolean;
    label: string;
    confidence: number;
    details?: string;
  };
}): IndianBarrierReport {
  const now = Date.now();
  const ttl = getDefaultTtlForCategory(input.category);
  const coords = input.coordinates || { lat: 19.0760, lng: 72.8777 }; // Default Mumbai / Urban core lat/lng
  const layer = input.roadLayer || 'at_grade';
  const src = input.source || 'Community Navigator';
  const hasPhoto = input.photoAttached ?? Boolean(input.photoUrl);

  const initialVotes = 1;
  const initialDownvotes = 0;

  const trustResult = computeBarrierConfidence({
    source: src,
    createdAt: now,
    votes: initialVotes,
    downvotes: initialDownvotes,
    photoAttached: hasPhoto,
    photoUrl: input.photoUrl,
    aiVerification: input.aiVerification,
  });

  return {
    id: `rep-${now}-${Math.floor(Math.random() * 1000)}`,
    title: input.title,
    category: input.category,
    severity: input.severity || 'high',
    location: input.location,
    status: 'Reported',
    votes: initialVotes,
    downvotes: initialDownvotes,
    date: 'Just now',
    createdAt: now,
    expiresAt: now + ttl * 1000,
    ttlSeconds: ttl,
    initialTtlSeconds: ttl,
    description: input.description || 'Submitted by community navigator.',
    coordinates: coords,
    roadLayer: layer,
    quadKey: getQuadKey(coords),
    clusterCount: 1,
    isExpired: false,
    source: src,
    photoAttached: hasPhoto,
    photoUrl: input.photoUrl,
    aiVerification: input.aiVerification,
    confidenceScore: trustResult.score,
  };
}

/**
 * 20-Meter Clustering Engine:
 * Searches existing active barriers. If a barrier of same category & layer exists within 20m,
 * merges submission into existing report (increments vote & extends TTL).
 * Otherwise creates and appends a new report.
 */
export function processIncomingBarrierReport(
  existingReports: IndianBarrierReport[],
  newInput: {
    title: string;
    category: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    location: string;
    description?: string;
    coordinates?: Coordinates;
    roadLayer?: RoadLayer;
    source?: string;
    photoAttached?: boolean;
    photoUrl?: string;
    aiVerification?: {
      verified: boolean;
      label: string;
      confidence: number;
      details?: string;
    };
  },
  clusteringRadiusMeters: number = 20
): { updatedReports: IndianBarrierReport[]; merged: boolean; targetId: string } {
  const coords = newInput.coordinates || { lat: 19.0760, lng: 72.8777 };
  const layer = newInput.roadLayer || 'at_grade';

  const now = Date.now();

  // Find candidate for merging within 20m
  const matchingIndex = existingReports.findIndex(rep => {
    if (rep.isExpired || rep.status === 'Expired' || rep.status === 'Resolved') return false;
    
    // Check road layer matching (flyover vs service road distinction)
    if (rep.roadLayer !== layer) return false;

    // Check distance
    const dist = calculateHaversineDistance(rep.coordinates, coords);
    return dist <= clusteringRadiusMeters;
  });

  if (matchingIndex !== -1) {
    const existing = existingReports[matchingIndex];
    const ttlBonus = 1800 * 1000; // +30 minutes
    const maxExpiry = now + existing.initialTtlSeconds * 2000; // Max cap 2x initial TTL
    const newExpiresAt = Math.min(existing.expiresAt + ttlBonus, maxExpiry);
    const newVotes = existing.votes + 1;
    const hasPhoto = existing.photoAttached || Boolean(newInput.photoUrl || newInput.photoAttached);
    const resolvedPhotoUrl = existing.photoUrl || newInput.photoUrl;
    const aiCheck = existing.aiVerification || newInput.aiVerification;

    const trustResult = computeBarrierConfidence({
      source: existing.source,
      createdAt: existing.createdAt,
      votes: newVotes,
      downvotes: existing.downvotes,
      photoAttached: hasPhoto,
      photoUrl: resolvedPhotoUrl,
      aiVerification: aiCheck,
    });

    const updatedMerged: IndianBarrierReport = {
      ...existing,
      votes: newVotes,
      clusterCount: existing.clusterCount + 1,
      expiresAt: newExpiresAt,
      ttlSeconds: Math.max(0, Math.floor((newExpiresAt - now) / 1000)),
      date: 'Updated just now',
      description: `${existing.description} | Re-confirmed by community navigator.`,
      status: newVotes >= 3 ? 'Verified' : existing.status,
      photoAttached: hasPhoto,
      photoUrl: resolvedPhotoUrl,
      aiVerification: aiCheck,
      confidenceScore: trustResult.score,
    };

    const nextList = [...existingReports];
    nextList[matchingIndex] = updatedMerged;
    return { updatedReports: nextList, merged: true, targetId: existing.id };
  }

  // Create new report if no close duplicate found
  const brandNew = createBarrierReport(newInput);
  return { updatedReports: [brandNew, ...existingReports], merged: false, targetId: brandNew.id };
}

/**
 * Upvote handler: extends TTL by 30 mins and updates status to Verified if votes >= 3.
 * Dynamically recomputes confidence score.
 */
export function upvoteBarrier(reports: IndianBarrierReport[], id: string): IndianBarrierReport[] {
  const now = Date.now();
  return reports.map(r => {
    if (r.id !== id) return r;
    const extensionMs = 1800 * 1000;
    const maxExpiresAt = now + r.initialTtlSeconds * 2000;
    const newExpiresAt = Math.min(r.expiresAt + extensionMs, maxExpiresAt);
    const newVotes = r.votes + 1;

    const trustResult = computeBarrierConfidence({
      source: r.source,
      createdAt: r.createdAt,
      votes: newVotes,
      downvotes: r.downvotes,
      photoAttached: r.photoAttached,
      photoUrl: r.photoUrl,
      aiVerification: r.aiVerification,
    });

    return {
      ...r,
      votes: newVotes,
      expiresAt: newExpiresAt,
      ttlSeconds: Math.max(0, Math.floor((newExpiresAt - now) / 1000)),
      status: newVotes >= 3 ? 'Verified' : r.status,
      confidenceScore: trustResult.score,
    };
  });
}

/**
 * Downvote handler: reduces TTL by 45 mins (-2700s).
 * Auto-expires if downvotes > votes + 2 or TTL <= 0.
 * Dynamically recomputes confidence score.
 */
export function downvoteBarrier(reports: IndianBarrierReport[], id: string): IndianBarrierReport[] {
  const now = Date.now();
  return reports.map(r => {
    if (r.id !== id) return r;
    const reductionMs = 2700 * 1000;
    const newExpiresAt = r.expiresAt - reductionMs;
    const newDownvotes = r.downvotes + 1;
    const isExpired = newExpiresAt <= now || newDownvotes >= r.votes + 3;

    const trustResult = computeBarrierConfidence({
      source: r.source,
      createdAt: r.createdAt,
      votes: r.votes,
      downvotes: newDownvotes,
      photoAttached: r.photoAttached,
      photoUrl: r.photoUrl,
      aiVerification: r.aiVerification,
    });

    return {
      ...r,
      downvotes: newDownvotes,
      expiresAt: newExpiresAt,
      ttlSeconds: Math.max(0, Math.floor((newExpiresAt - now) / 1000)),
      isExpired,
      status: isExpired ? 'Expired' : r.status,
      confidenceScore: trustResult.score,
    };
  });
}

/**
 * Periodically called decay tick processor to expire elapsed barriers.
 */
export function tickBarrierDecay(reports: IndianBarrierReport[]): IndianBarrierReport[] {
  const now = Date.now();
  return reports.map(r => {
    if (r.isExpired || r.status === 'Expired') return r;
    const remainingMs = r.expiresAt - now;
    if (remainingMs <= 0) {
      return {
        ...r,
        ttlSeconds: 0,
        isExpired: true,
        status: 'Expired',
      };
    }
    return {
      ...r,
      ttlSeconds: Math.floor(remainingMs / 1000),
    };
  });
}
