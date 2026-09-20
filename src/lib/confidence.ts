import { Entrance } from '../data/entrances';

export type ConfidenceTier = 'High Confidence' | 'Moderate Confidence' | 'Needs Review';

export interface ConfidenceBreakdownItem {
  label: string;
  value: number;
  maxValue: number;
  description: string;
}

export interface ConfidenceResult {
  score: number;
  tier: ConfidenceTier;
  color: string;
  badgeClass: string;
  photoAttached: boolean;
  photoUrl?: string;
  aiVerification?: {
    verified: boolean;
    label: string;
    confidence: number;
    details?: string;
  };
  breakdown: ConfidenceBreakdownItem[];
  summary: string;
}

export interface GenericTrustInput {
  source: string;
  lastVerified: string | number | Date;
  confirmations: number;
  disputes?: number;
  photoAttached?: boolean;
  photoUrl?: string;
  aiVerification?: {
    verified: boolean;
    label: string;
    confidence: number;
    details?: string;
  };
}

/**
 * Core Trust Score Calculator
 * Evaluates 4 primary pillars (Source Authority, Recency Decay, Community Consensus, Photo Proof)
 * plus an optional AI Photo Check bonus.
 */
export function calculateTrustScore(input: GenericTrustInput): ConfidenceResult {
  let score = 0;
  const breakdown: ConfidenceBreakdownItem[] = [];

  // ── Pillar 1: Source Authority (Max 35 pts) ──
  const src = (input.source || '').toLowerCase();
  let sourceScore = 15;
  let sourceDesc = 'Unverified community submission';

  if (
    src.includes('official') ||
    src.includes('transit') ||
    src.includes('municipal') ||
    src.includes('city authority')
  ) {
    sourceScore = 35;
    sourceDesc = 'Official municipal / transit authority audit';
  } else if (
    src.includes('survey') ||
    src.includes('auditor') ||
    src.includes('verified')
  ) {
    sourceScore = 30;
    sourceDesc = 'Certified accessibility field survey';
  } else if (src.includes('community') || src.includes('navigator')) {
    sourceScore = 22;
    sourceDesc = 'Trusted community navigator crowd audit';
  } else {
    sourceScore = 15;
    sourceDesc = 'Standard crowd submission';
  }

  score += sourceScore;
  breakdown.push({
    label: 'Source Authority',
    value: sourceScore,
    maxValue: 35,
    description: sourceDesc,
  });

  // ── Pillar 2: Recency Decay / Age (Max 25 pts) ──
  const verifiedTimestamp =
    typeof input.lastVerified === 'number'
      ? input.lastVerified
      : new Date(input.lastVerified).getTime();
  const now = Date.now();
  const daysOld = Math.max(
    0,
    Math.floor((now - (isNaN(verifiedTimestamp) ? now : verifiedTimestamp)) / (1000 * 60 * 60 * 24))
  );

  let recencyScore = 0;
  let recencyDesc = '';

  if (daysOld <= 2) {
    recencyScore = 25;
    recencyDesc = `Verified ${daysOld === 0 ? 'today' : daysOld === 1 ? 'yesterday' : '2 days ago'} (Live fresh)`;
  } else if (daysOld <= 7) {
    recencyScore = 20;
    recencyDesc = `Verified within past week (${daysOld}d old)`;
  } else if (daysOld <= 30) {
    recencyScore = 15;
    recencyDesc = `Verified within past month (${daysOld}d old)`;
  } else if (daysOld <= 90) {
    recencyScore = 8;
    recencyDesc = `Audit aging (${daysOld}d old)`;
  } else {
    recencyScore = 2;
    recencyDesc = `Stale audit (${daysOld}d old) — pending re-verification`;
  }

  score += recencyScore;
  breakdown.push({
    label: 'Recency & Age',
    value: recencyScore,
    maxValue: 25,
    description: recencyDesc,
  });

  // ── Pillar 3: Community Confirmations (Max 25 pts) ──
  const disputes = input.disputes || 0;
  const netConfirmations = Math.max(0, input.confirmations - disputes);
  let communityScore = 0;
  let communityDesc = '';

  if (netConfirmations >= 40) {
    communityScore = 25;
    communityDesc = `${netConfirmations} net community confirmations (Overwhelming consensus)`;
  } else if (netConfirmations >= 15) {
    communityScore = 20;
    communityDesc = `${netConfirmations} net confirmations (Strong community consensus)`;
  } else if (netConfirmations >= 5) {
    communityScore = 15;
    communityDesc = `${netConfirmations} confirmations (Verified by local navigators)`;
  } else if (netConfirmations >= 1) {
    communityScore = 10;
    communityDesc = `${netConfirmations} initial confirmation registered`;
  } else {
    communityScore = 2;
    communityDesc = disputes > 0 ? `${disputes} dispute(s) flagged` : 'Awaiting first community confirmation';
  }

  score += communityScore;
  breakdown.push({
    label: 'Community Consensus',
    value: communityScore,
    maxValue: 25,
    description: communityDesc,
  });

  // ── Pillar 4: Photo Proof (Max 15 pts) ──
  const hasPhoto = Boolean(input.photoAttached || input.photoUrl);
  let photoScore = 0;
  let photoDesc = '';

  if (hasPhoto) {
    photoScore = 15;
    photoDesc = 'High-resolution photo proof attached and verified';
  } else {
    photoScore = 0;
    photoDesc = 'No photo attached (Pin only)';
  }

  score += photoScore;
  breakdown.push({
    label: 'Photo Proof',
    value: photoScore,
    maxValue: 15,
    description: photoDesc,
  });

  // ── Bonus: AI Photo Verification Check (+5 pts) ──
  let aiBonus = 0;
  if (hasPhoto && input.aiVerification && input.aiVerification.verified) {
    aiBonus = 5;
    score += aiBonus;
    breakdown.push({
      label: 'AI Photo Check Bonus',
      value: aiBonus,
      maxValue: 5,
      description: `AI Vision Match: ${input.aiVerification.label} (${input.aiVerification.confidence}% match)`,
    });
  }

  // Final Clamping
  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  let tier: ConfidenceTier = 'Needs Review';
  let color = '#ef4444'; // Red
  let badgeClass = 'bg-error-container text-on-error-container border-error/30';

  if (finalScore >= 85) {
    tier = 'High Confidence';
    color = '#10b981'; // Emerald green
    badgeClass = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
  } else if (finalScore >= 60) {
    tier = 'Moderate Confidence';
    color = '#3b82f6'; // Blue
    badgeClass = 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
  }

  const summary = `${finalScore}% Trust Score (${tier}) • ${input.source} • ${daysOld === 0 ? 'Today' : `${daysOld}d ago`} • ${input.confirmations} confirms${hasPhoto ? ' • Photo-Verified' : ''}`;

  return {
    score: finalScore,
    tier,
    color,
    badgeClass,
    photoAttached: hasPhoto,
    photoUrl: input.photoUrl,
    aiVerification: input.aiVerification,
    breakdown,
    summary,
  };
}

/**
 * Computes confidence for an Entrance (Ramp, Lift, Step-Free Door)
 */
export function computeConfidence(entrance: Entrance): ConfidenceResult {
  return calculateTrustScore({
    source: entrance.source,
    lastVerified: entrance.lastVerified,
    confirmations: entrance.confirmations,
    disputes: entrance.disputes,
    photoAttached: entrance.photoAttached ?? Boolean(entrance.photoUrl),
    photoUrl: entrance.photoUrl,
    aiVerification: entrance.aiVerification,
  });
}

/**
 * Computes confidence for a Barrier Report (Outage, Obstruction, etc.)
 */
export function computeBarrierConfidence(barrier: {
  source?: string;
  createdAt: number;
  votes: number;
  downvotes: number;
  photoAttached?: boolean;
  photoUrl?: string;
  aiVerification?: {
    verified: boolean;
    label: string;
    confidence: number;
    details?: string;
  };
}): ConfidenceResult {
  return calculateTrustScore({
    source: barrier.source || 'Community Navigator',
    lastVerified: barrier.createdAt,
    confirmations: barrier.votes,
    disputes: barrier.downvotes,
    photoAttached: barrier.photoAttached ?? Boolean(barrier.photoUrl),
    photoUrl: barrier.photoUrl,
    aiVerification: barrier.aiVerification,
  });
}
