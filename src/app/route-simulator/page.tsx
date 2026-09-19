'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAccessibility } from '@/context/AccessibilityContext';
import {
  Radio,
  Sliders,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Navigation,
  CloudRain,
  Building,
  Users,
  Volume2,
  ArrowRight
} from 'lucide-react';

interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  detour: string;
  active: boolean;
}

export default function RouteSimulatorPage() {
  const { simulatedObstacle, toggleSimulatedObstacle, speakText } = useAccessibility();

  const [scenarios, setScenarios] = useState<SimulationScenario[]>([
    {
      id: 'elev',
      title: 'Elevator B Maintenance Outage',
      description: 'Main passenger lift in Sector 3 disabled. Forces step-free reroute via Ramp C.',
      icon: Building,
      detour: '+3 mins',
      active: simulatedObstacle.active,
    },
    {
      id: 'rain',
      title: 'Wet Ramp / Rain Friction Loss',
      description: 'Surface friction warning on 4.5% West Incline. Recommends covered concourse.',
      icon: CloudRain,
      detour: '+2 mins',
      active: false,
    },
    {
      id: 'crowd',
      title: 'High Density Crowd Congestion',
      description: 'Peak event congestion at Main Gate. Auto-selects low-sensory quiet side corridor.',
      icon: Users,
      detour: '+1 min',
      active: false,
    },
  ]);

  const toggleScenario = (id: string) => {
    setScenarios(prev =>
      prev.map(sc => {
        if (sc.id === id) {
          const nextState = !sc.active;
          if (id === 'elev') toggleSimulatedObstacle();
          speakText(`Simulation scenario ${sc.title} set to ${nextState ? 'active' : 'inactive'}`);
          return { ...sc, active: nextState };
        }
        return sc;
      })
    );
  };

  const activeCount = scenarios.filter(s => s.active).length;
  const totalDetour = activeCount * 2 + (scenarios[0].active ? 1 : 0);

  return (
    <div className="w-full px-4 md:px-8 py-8 flex justify-center">
      <div className="w-full max-w-[850px] flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-md">
            <Radio className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">
              Route Change Simulator
            </h1>
            <p className="text-on-surface-variant text-base font-medium">
              Interactive sandbox to test urban obstacles & real-time route adaptations.
            </p>
          </div>
        </div>

        {/* Live Simulation Matrix Card */}
        <div className="p-6 md:p-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/40 shadow-lg flex flex-col gap-6">
          
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-on-surface">
                Simulated Obstacle Scenarios
              </h2>
            </div>

            <button
              onClick={() => {
                setScenarios(scenarios.map(s => ({ ...s, active: false })));
                if (simulatedObstacle.active) toggleSimulatedObstacle();
                speakText("All simulation scenarios reset to normal path");
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset All</span>
            </button>
          </div>

          {/* Scenario Toggles */}
          <div className="flex flex-col gap-3">
            {scenarios.map((sc) => {
              const Icon = sc.icon;
              return (
                <div
                  key={sc.id}
                  onClick={() => toggleScenario(sc.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    sc.active
                      ? 'bg-tertiary-container/15 border-tertiary shadow-xs'
                      : 'bg-surface-container-low border-outline-variant/30 hover:border-outline'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      sc.active ? 'bg-tertiary text-on-tertiary' : 'bg-surface-container-high text-on-surface-variant'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-on-surface">{sc.title}</h3>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface-container text-on-surface">
                          {sc.detour}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                        {sc.description}
                      </p>
                    </div>
                  </div>

                  <div className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center ${
                    sc.active ? 'bg-tertiary justify-end' : 'bg-outline-variant justify-start'
                  }`}>
                    <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-Time Adaptation Output Dashboard */}
          <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
                Live Simulator Navigation Telemetry
              </span>
              <span className="text-xs font-bold text-secondary flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                100% WCAG AAA Compliant
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
                <div className="text-xs font-bold text-on-surface-variant">Active Obstacles</div>
                <div className="text-xl font-extrabold text-tertiary">{activeCount} Events</div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
                <div className="text-xs font-bold text-on-surface-variant">Calculated Detour</div>
                <div className="text-xl font-extrabold text-secondary">+{totalDetour} mins</div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
                <div className="text-xs font-bold text-on-surface-variant">Accessibility Guarantee</div>
                <div className="text-xl font-extrabold text-primary">Step-Free</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/live-adaptation-alert"
                className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-bold text-sm flex items-center justify-center gap-2 shadow-xs hover:opacity-90"
              >
                <Navigation className="w-4 h-4 fill-current" />
                <span>Test Live Reroute Banner</span>
              </Link>

              <button
                type="button"
                onClick={() => speakText(`Simulation active. ${activeCount} obstacles triggered. Total detour time plus ${totalDetour} minutes. Step-free path maintained.`)}
                className="px-5 h-12 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 font-bold text-xs text-on-surface flex items-center justify-center gap-2"
              >
                <Volume2 className="w-4 h-4 text-primary" />
                <span>Audio Summary</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
