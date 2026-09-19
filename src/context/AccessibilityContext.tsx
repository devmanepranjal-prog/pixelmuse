'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type PersonaType = 'wheelchair' | 'older-adult' | 'low-vision' | 'caregiver';
export type FontScale = 'sm' | 'md' | 'lg';

export interface BarrierReport {
  id: string;
  title: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  status: 'Reported' | 'Verified' | 'Under Review' | 'Resolved';
  votes: number;
  date: string;
  description: string;
}

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
  addBarrierReport: (report: Omit<BarrierReport, 'id' | 'votes' | 'date' | 'status'>) => void;
  upvoteReport: (id: string) => void;
}

const defaultReports: BarrierReport[] = [
  {
    id: 'rep-1',
    title: 'North Elevator Outage - West Wing Entrance',
    category: 'Elevator Outage',
    severity: 'critical',
    location: 'Building B, 2nd Floor Junction',
    status: 'Verified',
    votes: 42,
    date: '10 mins ago',
    description: 'Main passenger elevator is under emergency maintenance. Reroute via South Ramp Entrance.'
  },
  {
    id: 'rep-2',
    title: 'Temporary Scaffold Blocking Curb Cut',
    category: 'Obstruction',
    severity: 'high',
    location: 'Main Plaza & 4th Avenue Crossing',
    status: 'Verified',
    votes: 28,
    date: '35 mins ago',
    description: 'Construction scaffolding reduces sidewalk width below 90cm. Narrow wheelchair clearance.'
  },
  {
    id: 'rep-3',
    title: 'Automatic Door Sensor Malfunction',
    category: 'Entrance Door',
    severity: 'medium',
    location: 'Medical Center South Pavilion',
    status: 'Under Review',
    votes: 15,
    date: '2 hours ago',
    description: 'Sliding sensor doors require manual push button override on left pillar.'
  }
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
    impact: 'Wheelchair & Stroller access redirected via Ramp C'
  });
  const [barrierReports, setBarrierReports] = useState<BarrierReport[]>(defaultReports);

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

  const speakText = (text: string) => {
    if (isVoicePromptActive && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(msg);
    }
  };

  const toggleSimulatedObstacle = () => {
    setSimulatedObstacle(prev => ({
      ...prev,
      active: !prev.active
    }));
  };

  const addBarrierReport = (report: Omit<BarrierReport, 'id' | 'votes' | 'date' | 'status'>) => {
    const newReport: BarrierReport = {
      ...report,
      id: `rep-${Date.now()}`,
      votes: 1,
      date: 'Just now',
      status: 'Reported'
    };
    setBarrierReports(prev => [newReport, ...prev]);
  };

  const upvoteReport = (id: string) => {
    setBarrierReports(prev =>
      prev.map(r => (r.id === id ? { ...r, votes: r.votes + 1 } : r))
    );
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
        upvoteReport
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
