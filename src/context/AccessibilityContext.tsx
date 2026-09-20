'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  IndianBarrierReport,
  createBarrierReport,
  processIncomingBarrierReport,
  upvoteBarrier,
  downvoteBarrier,
  tickBarrierDecay,
  RoadLayer,
} from '@/lib/barrierEngine';
import { calculateAdaptedRoute, RouteResult } from '@/lib/routingEngine';
import { barrierBroadcaster, BarrierEvent } from '@/lib/realtimeEngine';
import { offlineSyncManager } from '@/lib/offlineSync';
import { getAffectedNavigatingUsers } from '@/lib/spatialLookupEngine';
import { RoadLayerType } from '@/lib/db/mongoSchema';

export type PersonaType = 'wheelchair' | 'older-adult' | 'low-vision' | 'caregiver';
export type FontScale = 'sm' | 'md' | 'lg';

export interface BarrierReport extends IndianBarrierReport {}

interface AccessibilityContextType {
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;
  isVoicePromptActive: boolean;
  toggleVoicePrompt: () => void;
  speakText: (text: string) => void;
  persona: PersonaType;
  setPersona: (p: PersonaType) => void;
  simulatedObstacle: {
    active: boolean;
    title: string;
    location: string;
    detourTime: string;
    impact: string;
  };
  toggleSimulatedObstacle: () => void;
  barrierReports: BarrierReport[];
  addBarrierReport: (input: {
    title: string;
    category: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    location: string;
    description?: string;
    roadLayer?: RoadLayer;
    coordinates?: { lat: number; lng: number };
  }) => void;
  upvoteReport: (id: string) => void;
  downvoteReport: (id: string) => void;
  currentRouteResult: RouteResult;
  recalculateCurrentRoute: () => RouteResult;
  realtimeEvents: BarrierEvent[];
  offlinePendingCount: number;
}

const defaultReports: IndianBarrierReport[] = [
  createBarrierReport({
    title: 'Waterlogging & Heavy Rain Puddling',
    category: 'Flooding/Waterlogging',
    severity: 'high',
    location: 'SVT Road - Underpass Entrance Gate 2',
    description: '15cm water buildup near curb ramp. Accessible ramp temporarily submerged.',
    coordinates: { lat: 19.0760, lng: 72.8777 },
    roadLayer: 'at_grade',
  }),
  createBarrierReport({
    title: 'Temporary Scaffold Blocking Curb Cut',
    category: 'Construction Obstruction',
    severity: 'high',
    location: 'Main Plaza & 4th Avenue Crossing',
    description: 'Construction scaffolding reduces sidewalk width below 90cm. Narrow clearance.',
    coordinates: { lat: 19.0765, lng: 72.8782 },
    roadLayer: 'at_grade',
  }),
  createBarrierReport({
    title: 'Blocked Elevators - West Wing Entrance',
    category: 'Elevator Outage',
    severity: 'critical',
    location: 'Building B, 2nd Floor Junction',
    description: 'Main passenger elevator under emergency maintenance. Reroute via South Ramp Entrance.',
    coordinates: { lat: 19.0770, lng: 72.8788 },
    roadLayer: 'at_grade',
  }),
];

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState<FontScale>('md');
  const [isVoicePromptActive, setIsVoicePromptActive] = useState(false);
  const [persona, setPersona] = useState<PersonaType>('wheelchair');
  const [simulatedObstacle, setSimulatedObstacle] = useState({
    active: true,
    title: 'Main Central Elevator Maintenance',
    location: 'Sector 3 Transit Hub - Level 2',
    detourTime: '+3 min detour',
    impact: 'Wheelchair & Stroller access redirected via Ramp C',
  });

  const [barrierReports, setBarrierReports] = useState<IndianBarrierReport[]>(defaultReports);
  const [realtimeEvents, setRealtimeEvents] = useState<BarrierEvent[]>([]);
  const [offlinePendingCount, setOfflinePendingCount] = useState(0);

  // Compute Initial Route Result
  const [currentRouteResult, setCurrentRouteResult] = useState<RouteResult>(() =>
    calculateAdaptedRoute(defaultReports)
  );

  const toggleHighContrast = () => setIsHighContrast(prev => !prev);
  const toggleVoicePrompt = () => {
    setIsVoicePromptActive(prev => {
      const next = !prev;
      if (next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance("Voice navigation prompt enabled. Accessible guidance active.");
        window.speechSynthesis.speak(msg);
      }
      return next;
    });
  };

  const speakText = useCallback((text: string) => {
    if (isVoicePromptActive && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(msg);
    }
  }, [isVoicePromptActive]);

  const recalculateCurrentRoute = useCallback(() => {
    const updated = calculateAdaptedRoute(
      simulatedObstacle.active ? barrierReports : barrierReports.filter(b => !b.title.includes('Elevator'))
    );
    setCurrentRouteResult(updated);
    return updated;
  }, [barrierReports, simulatedObstacle.active]);

  // Recalculate route automatically when barrier reports change or simulation toggles
  useEffect(() => {
    const newRoute = calculateAdaptedRoute(
      simulatedObstacle.active ? barrierReports : barrierReports.filter(b => !b.title.includes('Elevator'))
    );
    setCurrentRouteResult(newRoute);
  }, [barrierReports, simulatedObstacle.active]);

  // Setup Real-time Event Broadcaster Subscription
  useEffect(() => {
    const unsubscribe = barrierBroadcaster.subscribe(evt => {
      setRealtimeEvents(prev => [evt, ...prev.slice(0, 49)]); // Keep last 50 events
    });
    return unsubscribe;
  }, []);

  // Setup Dynamic TTL Decay Tick Timer (runs every 10 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setBarrierReports(prev => tickBarrierDecay(prev));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Setup Offline Sync Listener
  useEffect(() => {
    offlineSyncManager.setFlushCallback(flushedReports => {
      flushedReports.forEach(rep => {
        addBarrierReport({
          title: rep.title,
          category: rep.category,
          severity: rep.severity,
          location: rep.location,
          description: rep.description,
          coordinates: rep.coordinates,
          roadLayer: rep.roadLayer,
        });
      });
      setOfflinePendingCount(0);
    });
  }, []);

  const toggleSimulatedObstacle = () => {
    setSimulatedObstacle(prev => {
      const nextState = !prev.active;
      barrierBroadcaster.broadcast({
        type: 'ROUTE_RECALCULATED',
        message: nextState ? 'Obstacle simulation activated.' : 'Obstacle simulation cleared.',
      });
      return { ...prev, active: nextState };
    });
  };

  const addBarrierReport = (input: {
    title: string;
    category: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    location: string;
    description?: string;
    roadLayer?: RoadLayer;
    coordinates?: { lat: number; lng: number };
  }) => {
    // If offline, queue report locally
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      offlineSyncManager.enqueueReport({
        title: input.title,
        category: input.category,
        severity: input.severity || 'high',
        location: input.location,
        description: input.description || 'Offline submission.',
        coordinates: input.coordinates || { lat: 19.0760, lng: 72.8777 },
        roadLayer: input.roadLayer || 'at_grade',
      });
      setOfflinePendingCount(offlineSyncManager.getPendingQueue().length);
      speakText("Network connection spotty. Barrier report queued locally for sync.");
      return;
    }

    // 20-Meter Spatial Clustering Process
    const { updatedReports, merged, targetId } = processIncomingBarrierReport(barrierReports, input);
    setBarrierReports(updatedReports);

    const target = updatedReports.find(r => r.id === targetId);

    // ── Spatial Lookup: find all active navigating users affected ──
    if (target) {
      // Map our internal RoadLayer string to RoadLayerType enum for lookup engine
      const layerMap: Record<string, RoadLayerType> = {
        flyover: RoadLayerType.FLYOVER,
        service_road: RoadLayerType.SERVICE_ROAD,
        at_grade: RoadLayerType.AT_GRADE,
      };
      getAffectedNavigatingUsers({
        barrierId: target.id,
        category: target.category,
        location: target.coordinates,
        roadLayer: layerMap[target.roadLayer] ?? RoadLayerType.AT_GRADE,
        confidenceScore: target.votes / (target.votes + target.downvotes + 1),
        radiusMeters: 300,
      });
    }

    if (merged) {
      barrierBroadcaster.broadcast({
        type: 'BARRIER_CONFIRMED',
        quadKey: target?.quadKey,
        barrier: target,
        message: `Barrier "${input.title}" re-confirmed within 20m cluster. TTL extended.`,
      });
      speakText("Duplicate barrier detected within 20 meters. Merged report & extended hazard duration.");
    } else {
      barrierBroadcaster.broadcast({
        type: 'BARRIER_REPORTED',
        quadKey: target?.quadKey,
        barrier: target,
        message: `New temporary barrier reported: ${input.title}`,
      });
      speakText("New temporary barrier reported to live network.");
    }
  };

  const upvoteReport = (id: string) => {
    setBarrierReports(prev => {
      const next = upvoteBarrier(prev, id);
      const target = next.find(r => r.id === id);
      if (target) {
        barrierBroadcaster.broadcast({
          type: 'BARRIER_CONFIRMED',
          quadKey: target.quadKey,
          barrier: target,
          message: `Community verified barrier "${target.title}". TTL +30 min extension added.`,
        });
        speakText(`Upvoted barrier. Community confidence extended TTL by 30 minutes.`);
      }
      return next;
    });
  };

  const downvoteReport = (id: string) => {
    setBarrierReports(prev => {
      const next = downvoteBarrier(prev, id);
      const target = next.find(r => r.id === id);
      if (target) {
        if (target.isExpired) {
          barrierBroadcaster.broadcast({
            type: 'BARRIER_EXPIRED',
            quadKey: target.quadKey,
            barrier: target,
            message: `Barrier "${target.title}" auto-expired due to community downvotes.`,
          });
          speakText(`Downvote threshold reached. Barrier auto-expired and cleared from route.`);
        } else {
          barrierBroadcaster.broadcast({
            type: 'BARRIER_CONFIRMED',
            quadKey: target.quadKey,
            barrier: target,
            message: `Downvoted barrier "${target.title}". TTL reduced by 45 mins.`,
          });
          speakText(`Downvoted barrier. Hazard TTL reduced.`);
        }
      }
      return next;
    });
  };

  return (
    <AccessibilityContext.Provider
      value={{
        isHighContrast,
        toggleHighContrast,
        fontScale,
        setFontScale,
        isVoicePromptActive,
        toggleVoicePrompt,
        speakText,
        persona,
        setPersona,
        simulatedObstacle,
        toggleSimulatedObstacle,
        barrierReports,
        addBarrierReport,
        upvoteReport,
        downvoteReport,
        currentRouteResult,
        recalculateCurrentRoute,
        realtimeEvents,
        offlinePendingCount,
      }}
    >
      <div
        className={`${isHighContrast ? 'high-contrast' : ''} font-scale-${fontScale} min-h-screen transition-all`}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}
