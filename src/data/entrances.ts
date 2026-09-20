import { PHOTO_PROOFS } from './photoProofAssets';

export interface Entrance {
  id: string;
  siteId: string;
  name: string;
  lat: number;
  lng: number;
  stepFree: boolean;
  stepCount: number;
  hasRamp: boolean;
  hasLift: boolean;
  doorType: 'automatic' | 'manual' | 'heavy';
  rampSlopePercent?: number;
  width?: number;
  hasTactilePaving?: boolean;
  isWellLit?: boolean;
  source: string;
  lastVerified: string;
  confirmations: number;
  disputes: number;
  photoUrl?: string;
  photoAttached?: boolean;
  aiVerification?: {
    verified: boolean;
    label: string;
    confidence: number;
    details?: string;
  };
  notes?: string;
}

// Sample Surveyed Points - Each Ramp, Lift, or Barrier includes source, age, confirmations, photo proof, & AI check
export const entrances: Entrance[] = [
  {
    id: 'ent-1',
    siteId: 'site-bldg-b',
    name: 'Main Gate',
    lat: 40.7128,
    lng: -74.0060,
    stepFree: false,
    stepCount: 6,
    hasRamp: false,
    hasLift: false,
    doorType: 'heavy',
    width: 150,
    hasTactilePaving: false,
    isWellLit: true,
    source: 'Official Municipal Survey',
    lastVerified: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    confirmations: 120,
    disputes: 2,
    photoAttached: true,
    photoUrl: PHOTO_PROOFS.scaffoldObstruction,
    aiVerification: {
      verified: true,
      label: 'Stairs Identified (6 steps, No Ramp)',
      confidence: 99,
      details: 'Physical flight of 6 stone steps without wheelchair ramp access. Steep obstacle.',
    },
    notes: 'Main entrance with grand stairs.'
  },
  {
    id: 'ent-2',
    siteId: 'site-bldg-b',
    name: 'Side Entrance (West Ramp C)',
    lat: 40.7129,
    lng: -74.0061,
    stepFree: true,
    stepCount: 0,
    hasRamp: true,
    hasLift: false,
    doorType: 'automatic',
    rampSlopePercent: 6,
    width: 120,
    hasTactilePaving: true,
    isWellLit: true,
    source: 'Certified Accessibility Auditor',
    lastVerified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday (Fresh)
    confirmations: 45,
    disputes: 0,
    photoAttached: true,
    photoUrl: PHOTO_PROOFS.rampClean,
    aiVerification: {
      verified: true,
      label: 'Accessible Ramp (Incline < 6%)',
      confidence: 97,
      details: 'Dual continuous handrails, tactile yellow transition plates, and 120cm clear width.',
    },
    notes: 'Ramp access located on the west side.'
  },
  {
    id: 'ent-3',
    siteId: 'site-bldg-b',
    name: 'Service Lift Lobby (Elevator Hub)',
    lat: 40.7127,
    lng: -74.0059,
    stepFree: true,
    stepCount: 0,
    hasRamp: false,
    hasLift: true,
    doorType: 'automatic',
    width: 110,
    hasTactilePaving: true,
    isWellLit: true,
    source: 'Official Transit Authority',
    lastVerified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    confirmations: 28,
    disputes: 1,
    photoAttached: true,
    photoUrl: PHOTO_PROOFS.elevatorLobby,
    aiVerification: {
      verified: true,
      label: 'Accessible Lift with Braille Panel',
      confidence: 96,
      details: 'Low tactile push buttons at 100cm height, audible arrival chime, wide cabin.',
    },
    notes: 'Level 3 reached by lift on the left. High reliability.'
  },
  {
    id: 'ent-4',
    siteId: 'site-bldg-b',
    name: 'East Wing Door',
    lat: 40.7128,
    lng: -74.0058,
    stepFree: false,
    stepCount: 2,
    hasRamp: false,
    hasLift: false,
    doorType: 'automatic',
    width: 110,
    hasTactilePaving: false,
    isWellLit: true,
    source: 'Community Navigator',
    lastVerified: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    confirmations: 8,
    disputes: 1,
    photoAttached: true,
    photoUrl: PHOTO_PROOFS.scaffoldObstruction,
    aiVerification: {
      verified: true,
      label: '2-Step Curb Threshold (No Ramp)',
      confidence: 91,
      details: 'Double door entry with 2 raised steps. Not suitable for power wheelchairs.',
    },
    notes: 'Only 2 steps, but no ramp.'
  }
];
