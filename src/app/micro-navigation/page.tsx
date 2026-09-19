'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAccessibility } from '@/context/AccessibilityContext';
import {
  Compass,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Building,
  Layers,
  DoorOpen,
  Maximize,
  AlertTriangle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface StepItem {
  id: number;
  instruction: string;
  subtext: string;
  distance: string;
  icon: 'straight' | 'left' | 'right' | 'elevator' | 'door';
  floor: string;
}

const steps: StepItem[] = [
  {
    id: 1,
    instruction: 'Proceed straight along Tactile Strip 14',
    subtext: 'Maintain straight path toward South Atrium Ramp. Surface is smooth concrete with rubber tactile studs.',
    distance: '25 meters',
    icon: 'straight',
    floor: 'Level 1'
  },
  {
    id: 2,
    instruction: 'Turn Left at Yellow Tactile Paving Junction',
    subtext: 'Gentle 3.5% incline ramp begins on your left. Dual handrails available on both sides.',
    distance: '15 meters',
    icon: 'left',
    floor: 'Level 1'
  },
  {
    id: 3,
    instruction: 'Enter Elevator B (West Wing Hub)',
    subtext: 'Wide 110cm automatic door. Select Floor 3 on lower accessible control panel (height 100cm).',
    distance: '8 meters',
    icon: 'elevator',
    floor: 'Level 1 to Level 3'
  },
  {
    id: 4,
    instruction: 'Exit Elevator B and turn Right',
    subtext: 'Cardiology Department entrance is 10 meters straight ahead through double automatic sliding doors.',
    distance: '10 meters',
    icon: 'right',
    floor: 'Level 3'
  }
];

export default function MicroNavigationPage() {
  const { isVoicePromptActive, speakText, simulatedObstacle } = useAccessibility();
  const [currentStepIdx, setCurrentStepIdx] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeFloor, setActiveFloor] = useState('Level 3');

  const step = steps[currentStepIdx];

  const handleNextStep = () => {
    if (currentStepIdx < steps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      speakText(`Step ${nextIdx + 1}: ${steps[nextIdx].instruction}`);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      speakText(`Step ${prevIdx + 1}: ${steps[prevIdx].instruction}`);
    }
  };

  return (
    <div className="w-full px-4 md:px-8 py-8 flex justify-center">
      <div className="w-full max-w-[850px] flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shadow-md">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">
                Micro-Navigation
              </h1>
              <p className="text-on-surface-variant text-base font-medium">
                Step-by-step turn guidance with real-time haptic & audio prompts.
              </p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Live Haptic Feedback Active
            </span>
          </div>
        </div>

        {/* Live Reroute Banner if simulation obstacle active */}
        {simulatedObstacle.active && (
          <div className="p-4 rounded-2xl bg-tertiary-container/15 border-2 border-tertiary/40 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-tertiary flex-shrink-0" />
              <div>
                <span className="font-bold text-sm text-tertiary">Live Obstacle Alert</span>
                <p className="text-xs text-on-surface-variant font-medium">
                  {simulatedObstacle.title} ({simulatedObstacle.detourTime})
                </p>
              </div>
            </div>
            <Link
              href="/live-adaptation-alert"
              className="px-3 py-1.5 rounded-xl bg-tertiary text-on-tertiary text-xs font-bold hover:opacity-90"
            >
              Adapt Route
            </Link>
          </div>
        )}

        {/* Primary Navigation Guidance HUD Card */}
        <div className="p-6 md:p-8 bg-surface-container-lowest rounded-3xl border-2 border-primary shadow-xl flex flex-col gap-6">
          
          {/* Step Count & Floor Indicator */}
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-primary text-white text-sm font-black">
                Step {step.id} of {steps.length}
              </span>
              <span className="text-xs font-bold text-on-surface-variant">
                Floor: {step.floor}
              </span>
            </div>

            <button
              onClick={() => speakText(`Step ${step.id}: ${step.instruction}. ${step.subtext}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>Read Aloud</span>
            </button>
          </div>

          {/* Direction Icon & Main Prompt */}
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left py-2">
            <div className="w-24 h-24 rounded-3xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-md flex-shrink-0">
              {step.icon === 'straight' && <ArrowUp className="w-14 h-14 text-white stroke-[3]" />}
              {step.icon === 'left' && <ArrowLeft className="w-14 h-14 text-white stroke-[3]" />}
              {step.icon === 'right' && <ArrowRight className="w-14 h-14 text-white stroke-[3]" />}
              {step.icon === 'elevator' && <Building className="w-14 h-14 text-white" />}
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <div className="text-xs font-extrabold text-secondary uppercase tracking-wider">
                In {step.distance}
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-on-surface leading-tight">
                {step.instruction}
              </h2>
              <p className="text-sm md:text-base text-on-surface-variant font-medium leading-relaxed">
                {step.subtext}
              </p>
            </div>
          </div>

          {/* Elevator & Doorway Clearance Inspector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center gap-3">
              <DoorOpen className="w-6 h-6 text-primary flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-on-surface-variant">Doorway Clearance</div>
                <div className="text-sm font-extrabold text-on-surface">110cm Automatic Sensor</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center gap-3">
              <Layers className="w-6 h-6 text-secondary flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-on-surface-variant">Accessible Elevator B</div>
                <div className="text-sm font-extrabold text-on-surface">Lower Braille Control Panel</div>
              </div>
            </div>
          </div>

          {/* Interactive Player Controls */}
          <div className="flex items-center justify-between border-t border-outline-variant/30 pt-6 gap-3">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIdx === 0}
              className="h-14 px-5 rounded-xl bg-surface-container hover:bg-surface-container-high disabled:opacity-40 font-bold text-sm text-on-surface flex items-center gap-2 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <button
              onClick={() => setIsPlaying(prev => !prev)}
              className="h-14 px-6 rounded-xl bg-surface-container-high hover:bg-surface-container-highest font-bold text-sm text-on-surface flex items-center gap-2"
            >
              {isPlaying ? <Pause className="w-5 h-5 text-primary" /> : <Play className="w-5 h-5 text-primary" />}
              <span>{isPlaying ? 'Pause Auto-Play' : 'Resume Auto-Play'}</span>
            </button>

            <button
              onClick={handleNextStep}
              disabled={currentStepIdx === steps.length - 1}
              className="h-14 px-6 rounded-xl bg-primary text-on-primary disabled:opacity-40 font-bold text-sm flex items-center gap-2 shadow-md hover:opacity-90 transition-opacity"
            >
              <span className="hidden sm:inline">Next Step</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Interactive Elevator Level Selector */}
        <section className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              Elevator Level Fast Selector
            </h3>
            <span className="text-xs font-semibold text-on-surface-variant">
              Active: {activeFloor}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {['Level 1', 'Level 2', 'Level 3', 'Level 4'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  setActiveFloor(lvl);
                  speakText(`Elevator level changed to ${lvl}`);
                }}
                className={`h-14 rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                  activeFloor === lvl
                    ? 'bg-primary text-on-primary shadow-md ring-2 ring-primary/30'
                    : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface border border-outline-variant/30'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
