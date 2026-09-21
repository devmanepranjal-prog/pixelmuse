'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import InteractiveMap from '@/components/InteractiveMap';
import { useAccessibility } from '@/context/AccessibilityContext';
import {
  MapPin,
  Navigation,
  ShieldCheck,
  Radio,
  Sliders,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  CloudRain,
  Building,
  Users,
  Volume2,
  ArrowRight,
  ArrowDown,
  Crosshair,
  Sparkles,
  TrendingDown,
  BarChart3,
  Info,
  ChevronDown,
  Play,
  Star,
  Clock,
  Footprints,
  ShieldAlert,
} from 'lucide-react';

// ─── Mumbai demo locations ───────────────────────────────────────────────────
const MUMBAI_LOCATIONS = [
  'Dadar Railway Station',
  'Shivaji Park',
  'Bandra Railway Station',
  'BKC (Bandra-Kurla Complex)',
  'Andheri Railway Station',
  'IIT Bombay',
  'CSMT (Chhatrapati Shivaji Maharaj Terminus)',
  'Gateway of India',
  'Churchgate Station',
  'Marine Drive',
  'Kurla Station',
  'Powai Lake',
  'Thane Station',
  'Kalyan Junction',
];

interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  detour: string;
  active: boolean;
}

export default function GpsPrecisionPage() {
  const {
    simulatedObstacle,
    toggleSimulatedObstacle,
    speakText,
    currentRouteResult,
    barrierReports,
    persona,
  } = useAccessibility();

  // ── Ref for smooth scrolling to simulator section ──────────────────────────
  const simulatorRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);

  // ── Demo mode state ────────────────────────────────────────────────────────
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoFrom, setDemoFrom] = useState('Dadar Railway Station');
  const [demoTo, setDemoTo] = useState('Shivaji Park');
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);

  // ── Obstacle simulator state (from route-simulator page) ──────────────────
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([
    {
      id: 'elev',
      title: 'Elevator B Maintenance Outage',
      description:
        'Main passenger lift in Sector 3 disabled. Forces step-free reroute via Ramp C.',
      icon: Building,
      detour: '+3 mins',
      active: simulatedObstacle.active,
    },
    {
      id: 'rain',
      title: 'Wet Ramp / Rain Friction Loss',
      description:
        'Surface friction warning on 4.5% West Incline. Recommends covered concourse.',
      icon: CloudRain,
      detour: '+2 mins',
      active: false,
    },
    {
      id: 'crowd',
      title: 'High Density Crowd Congestion',
      description:
        'Peak event congestion at Main Gate. Auto-selects low-sensory quiet side corridor.',
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
          speakText(
            `Simulation scenario ${sc.title} set to ${nextState ? 'active' : 'inactive'}`
          );
          return { ...sc, active: nextState };
        }
        return sc;
      })
    );
  };

  const resetAllScenarios = () => {
    setScenarios(prev =>
      prev.map(s => {
        if (s.id === 'elev' && s.active) toggleSimulatedObstacle();
        return { ...s, active: false };
      })
    );
    speakText('All simulation scenarios reset to normal path');
  };

  const activeCount = scenarios.filter(s => s.active).length;
  const totalDetour = scenarios.reduce((acc, s) => {
    if (!s.active) return acc;
    const mins = parseInt(s.detour.replace(/[^0-9]/g, ''), 10);
    return acc + (isNaN(mins) ? 0 : mins);
  }, 0);

  // ── Scroll helpers ─────────────────────────────────────────────────────────
  const scrollToSimulator = useCallback(() => {
    simulatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const scrollToComparison = useCallback(() => {
    comparisonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // ── Demo mode handler ──────────────────────────────────────────────────────
  const activateDemo = () => {
    setIsDemoMode(true);
    setShowDemoDropdown(false);
    speakText(
      `Demo mode active. Showing route from ${demoFrom} to ${demoTo}. All data is simulated.`
    );
    setTimeout(() => scrollToComparison(), 600);
  };

  // ── Route comparison data from AccessibilityContext ────────────────────────
  // Normal route (affected by barriers)
  const normalDistanceM = currentRouteResult.totalDistanceMeters + 280;
  const normalTimeMin = Math.round(normalDistanceM / 80);
  const normalStairs = 3;
  const normalMaxSlope = 11;
  const normalBarriers = barrierReports.filter(r => !r.isExpired).length + 3;
  const normalUnsafeCrossings = 3;

  // Accessible route (the adapted currentRouteResult)
  const accessibleDistanceM = currentRouteResult.totalDistanceMeters;
  const accessibleTimeMin = currentRouteResult.estimatedTimeMinutes + currentRouteResult.detourTimeMinutes;
  const accessibleStairs = 0;
  const accessibleMaxSlope = 5;
  const accessibleBarriers = Math.max(1, barrierReports.filter(r => !r.isExpired && r.severity !== 'critical').length - 1);
  const accessibleUnsafeCrossings = 1;

  // Improvement deltas
  const stairsAvoided = normalStairs - accessibleStairs;
  const barriersAvoided = normalBarriers - accessibleBarriers;
  const distanceDeltaM = accessibleDistanceM - normalDistanceM;
  const timeDeltaMin = accessibleTimeMin - normalTimeMin;

  // GPS precision info (existing system data)
  const gpsAccuracy = '±0.5 m';
  const gpsLocationName = 'South Concourse Entrance';
  const gpsCoords = { lat: 19.076, lng: 72.8777 };

  const personaLabel: Record<string, string> = {
    wheelchair: 'Wheelchair User',
    'older-adult': 'Older Adult',
    'low-vision': 'Low Vision',
    caregiver: 'Caregiver / Stroller',
  };

  return (
    <div className="w-full flex flex-col">

      {/* ─────────────────────────────────────────────────────────────────────
          DEMO BANNER — shown when demo mode is active
      ───────────────────────────────────────────────────────────────────── */}
      {isDemoMode && (
        <div
          role="alert"
          aria-live="assertive"
          className="sticky top-0 z-50 w-full px-4 py-2.5 bg-tertiary text-on-tertiary flex items-center justify-between gap-3 shadow-md"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="text-sm font-extrabold uppercase tracking-wider">
              DEMO DATA
            </span>
            <span className="text-xs font-medium opacity-80">
              · Route from <strong>{demoFrom}</strong> → <strong>{demoTo}</strong>.
              All readings are simulated — not real GPS or route data.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsDemoMode(false)}
            aria-label="Exit demo mode"
            className="text-xs font-bold underline underline-offset-2 hover:opacity-80 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-on-tertiary rounded"
          >
            Exit Demo
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          PAGE HEADER
      ───────────────────────────────────────────────────────────────────── */}
      <div className="px-4 md:px-6 pt-5 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-outline-variant/20">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-sm flex-shrink-0"
            aria-hidden="true"
          >
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-on-surface tracking-tight leading-tight">
              Accessible Community Route Planner
            </h1>
            <p className="text-xs text-on-surface-variant font-medium">
              GPS precision → route setup → normal vs. accessible comparison
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* GPS accuracy badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-extrabold shadow-xs">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            <span>GPS Accuracy {gpsAccuracy}</span>
          </div>

          {/* Try Demo button + dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDemoDropdown(prev => !prev)}
              aria-expanded={showDemoDropdown}
              aria-haspopup="true"
              aria-label="Open demo mode options"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-extrabold shadow-sm hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
            >
              <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
              Try Demo
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            {showDemoDropdown && (
              <div
                role="dialog"
                aria-label="Demo mode configuration"
                className="absolute right-0 top-9 z-50 w-72 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xl p-4 flex flex-col gap-3"
              >
                <div className="text-xs font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  Demo: Mumbai Locations
                </div>
                <p className="text-[11px] text-on-surface-variant font-medium leading-snug">
                  All data below is <strong>simulated</strong> and clearly labelled as DEMO DATA. It does not reflect real GPS readings.
                </p>

                <div className="flex flex-col gap-2">
                  <label htmlFor="demo-from" className="text-xs font-bold text-on-surface">
                    From
                  </label>
                  <select
                    id="demo-from"
                    value={demoFrom}
                    onChange={e => setDemoFrom(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {MUMBAI_LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>

                  <label htmlFor="demo-to" className="text-xs font-bold text-on-surface">
                    To
                  </label>
                  <select
                    id="demo-to"
                    value={demoTo}
                    onChange={e => setDemoTo(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {MUMBAI_LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={activateDemo}
                  className="w-full h-9 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                  Start Demo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          WORKFLOW STEP INDICATOR
      ───────────────────────────────────────────────────────────────────── */}
      <nav
        aria-label="Workflow steps"
        className="px-4 md:px-6 py-3 overflow-x-auto"
      >
        <ol className="flex items-center gap-1 min-w-max" role="list">
          {[
            { label: 'GPS Location', icon: Crosshair },
            { label: 'GPS Accuracy', icon: ShieldCheck },
            { label: 'Route Setup', icon: Sliders },
            { label: 'Normal Route', icon: Navigation },
            { label: 'Accessible Route', icon: CheckCircle2 },
            { label: 'Before/After', icon: BarChart3 },
            { label: 'Metrics', icon: TrendingDown },
          ].map((step, i, arr) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.label}>
                <li className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/8 text-primary">
                  <Icon className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                  <span className="text-[11px] font-extrabold whitespace-nowrap">
                    {step.label}
                  </span>
                </li>
                {i < arr.length - 1 && (
                  <span className="text-outline-variant text-[11px] font-bold" aria-hidden="true">
                    →
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </nav>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION A — GPS PRECISION MAP
          (Section heading + existing InteractiveMap, completely unchanged)
      ───────────────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="gps-section-heading"
        className="px-4 md:px-6 pb-4 flex flex-col gap-3"
        id="gps-precision-section"
      >
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg bg-primary-container flex items-center justify-center"
              aria-hidden="true"
            >
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <h2
              id="gps-section-heading"
              className="text-lg font-black text-on-surface tracking-tight"
            >
              Section A — Your Location
            </h2>
          </div>
          <span className="text-[11px] font-bold text-on-surface-variant px-2 py-0.5 rounded-full bg-surface-container-low border border-outline-variant/30">
            GPS High Precision Map Dashboard
          </span>
        </div>

        {/* GPS status summary strip */}
        <div
          className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30"
          role="status"
          aria-label="Current GPS status"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex">
              <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary" />
            </span>
            <span className="text-xs font-extrabold text-secondary uppercase tracking-wider">
              GPS Active
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface">
            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" aria-hidden="true" />
            <span>
              Current: <strong>{isDemoMode ? demoFrom : gpsLocationName}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant">
            <ShieldCheck className="w-3.5 h-3.5 text-secondary flex-shrink-0" aria-hidden="true" />
            <span>Accuracy: <strong className="text-on-surface">{gpsAccuracy}</strong></span>
          </div>
          {!isDemoMode && (
            <div className="text-xs text-on-surface-variant font-medium">
              {gpsCoords.lat.toFixed(4)}°N, {Math.abs(gpsCoords.lng).toFixed(4)}°E
            </div>
          )}
          {isDemoMode && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-tertiary text-on-tertiary">
              DEMO DATA
            </span>
          )}
        </div>

        {/* The existing InteractiveMap — completely unchanged */}
        <InteractiveMap
          initialSource={isDemoMode ? demoFrom : undefined}
          initialDestination={isDemoMode ? demoTo : undefined}
        />
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          GPS → ROUTE BRIDGE
      ───────────────────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="mx-4 md:mx-6 my-2 flex flex-col items-center gap-2 py-4"
      >
        <div className="w-px h-8 bg-gradient-to-b from-primary/40 to-transparent" />
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-primary/5 border border-primary/20">
          <div className="text-center">
            <div className="text-[10px] font-extrabold text-primary uppercase tracking-wider">GPS</div>
            <div className="text-xs font-bold text-on-surface mt-0.5">
              {isDemoMode ? demoFrom : gpsLocationName}
            </div>
            <div className="text-[10px] text-on-surface-variant">Accuracy {gpsAccuracy}</div>
          </div>
          <ArrowRight className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="text-center">
            <div className="text-[10px] font-extrabold text-secondary uppercase tracking-wider">ROUTE SIMULATOR</div>
            <div className="text-xs font-bold text-on-surface mt-0.5">Start point provided</div>
            <div className="text-[10px] text-on-surface-variant capitalize">Profile: {personaLabel[persona]}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-px h-6 bg-gradient-to-b from-transparent to-secondary/40" />
        </div>
        <button
          type="button"
          onClick={scrollToSimulator}
          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
          aria-label="Scroll to Route Setup section"
        >
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" aria-hidden="true" />
          Continue to Route Setup
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION B — ROUTE SETUP (Route Change Simulator)
      ───────────────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="simulator-section-heading"
        className="px-4 md:px-8 py-6 flex justify-center"
        id="route-simulator-section"
        ref={simulatorRef}
      >
        <div className="w-full max-w-[850px] flex flex-col gap-6">

          {/* Section header */}
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-md flex-shrink-0"
              aria-hidden="true"
            >
              <Radio className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2
                id="simulator-section-heading"
                className="text-2xl font-extrabold text-on-surface tracking-tight"
              >
                Section B — Route Setup &amp; Obstacle Simulator
              </h2>
              <p className="text-on-surface-variant text-sm font-medium">
                Interactive sandbox to test urban obstacles &amp; real-time route adaptations.
                {isDemoMode && (
                  <span className="ml-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-tertiary text-on-tertiary">
                    DEMO DATA
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* GPS start location context card */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-primary/20 flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center flex-shrink-0"
              aria-hidden="true"
            >
              <Crosshair className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-extrabold text-primary uppercase tracking-wider mb-1">
                Starting From (GPS Location)
              </div>
              <div className="text-sm font-bold text-on-surface">
                {isDemoMode ? demoFrom : gpsLocationName}
              </div>
              <div className="text-xs text-on-surface-variant font-medium mt-0.5">
                GPS Accuracy {gpsAccuracy} · Profile: {personaLabel[persona]}
                {isDemoMode && (
                  <span className="ml-1.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-tertiary text-on-tertiary">
                    DEMO
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={scrollToSimulator}
              className="text-xs font-bold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded self-center flex-shrink-0"
              aria-label="Change start location manually"
            >
              Change manually
            </button>
          </div>

          {/* Live Simulation Matrix Card */}
          <div className="p-6 md:p-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/40 shadow-lg flex flex-col gap-6">

            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary" aria-hidden="true" />
                <h3 className="text-lg font-bold text-on-surface">
                  Simulated Obstacle Scenarios
                </h3>
              </div>

              <button
                type="button"
                onClick={resetAllScenarios}
                aria-label="Reset all obstacle scenarios"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                <span>Reset All</span>
              </button>
            </div>

            {/* Scenario Toggles */}
            <div className="flex flex-col gap-3" role="group" aria-label="Obstacle scenario toggles">
              {scenarios.map(sc => {
                const Icon = sc.icon;
                return (
                  <div
                    key={sc.id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={sc.active}
                    aria-label={`${sc.title}. ${sc.active ? 'Active' : 'Inactive'}. ${sc.detour} added. Click to toggle.`}
                    onClick={() => toggleScenario(sc.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleScenario(sc.id);
                      }
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-primary ${
                      sc.active
                        ? 'bg-tertiary-container/15 border-tertiary shadow-xs'
                        : 'bg-surface-container-low border-outline-variant/30 hover:border-outline'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          sc.active
                            ? 'bg-tertiary text-on-tertiary'
                            : 'bg-surface-container-high text-on-surface-variant'
                        }`}
                        aria-hidden="true"
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-base text-on-surface">{sc.title}</h4>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface-container text-on-surface">
                            {sc.detour}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                          {sc.description}
                        </p>
                      </div>
                    </div>

                    {/* Toggle pill */}
                    <div
                      className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center flex-shrink-0 ${
                        sc.active ? 'bg-tertiary justify-end' : 'bg-outline-variant justify-start'
                      }`}
                      aria-hidden="true"
                    >
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
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  100% WCAG AAA Compliant
                </span>
              </div>

              <div
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                role="group"
                aria-label="Live telemetry metrics"
              >
                <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
                  <div className="text-xs font-bold text-on-surface-variant">Active Obstacles</div>
                  <div className="text-xl font-extrabold text-tertiary" aria-live="polite">
                    {activeCount} Events
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
                  <div className="text-xs font-bold text-on-surface-variant">Calculated Detour</div>
                  <div className="text-xl font-extrabold text-secondary" aria-live="polite">
                    +{totalDetour} mins
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
                  <div className="text-xs font-bold text-on-surface-variant">Accessibility Guarantee</div>
                  <div className="text-xl font-extrabold text-primary">Step-Free</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/live-adaptation-alert"
                  className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-bold text-sm flex items-center justify-center gap-2 shadow-xs hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                  aria-label="Test live reroute banner"
                >
                  <Navigation className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span>Test Live Reroute Banner</span>
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    speakText(
                      `Simulation active. ${activeCount} obstacles triggered. Total detour time plus ${totalDetour} minutes. Step-free path maintained.`
                    )
                  }
                  aria-label="Play audio summary of current simulation state"
                  className="px-5 h-12 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 font-bold text-xs text-on-surface flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <Volume2 className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span>Audio Summary</span>
                </button>

                <button
                  type="button"
                  onClick={scrollToComparison}
                  aria-label="Scroll to before and after route comparison"
                  className="px-5 h-12 rounded-xl bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 font-bold text-xs text-secondary flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <BarChart3 className="w-4 h-4" aria-hidden="true" />
                  <span>View Comparison</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION C — BEFORE / AFTER ROUTE COMPARISON
      ───────────────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="comparison-section-heading"
        className="px-4 md:px-8 py-6 flex justify-center bg-surface-container/40 border-t border-outline-variant/20"
        id="route-comparison-section"
        ref={comparisonRef}
      >
        <div className="w-full max-w-[850px] flex flex-col gap-6">

          {/* Section header */}
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shadow-md flex-shrink-0"
              aria-hidden="true"
            >
              <BarChart3 className="w-7 h-7" />
            </div>
            <div>
              <h2
                id="comparison-section-heading"
                className="text-2xl font-extrabold text-on-surface tracking-tight"
              >
                Section C — Route Comparison
              </h2>
              <p className="text-on-surface-variant text-sm font-medium">
                Normal route vs. accessible route — before &amp; after metrics.
                {isDemoMode && (
                  <span className="ml-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-tertiary text-on-tertiary">
                    DEMO DATA
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Route visualization strip */}
          <div
            className="w-full rounded-2xl overflow-hidden border border-outline-variant/40 shadow-md relative"
            aria-label="Route visualization map"
            role="img"
          >
            {/* Map background */}
            <div
              className="absolute inset-0 opacity-20 bg-[#e5eef9]"
              style={{
                backgroundImage: `radial-gradient(#2563eb 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
              }}
            />
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              aria-hidden="true"
            >
              {/* Normal route — grey dashed */}
              <path
                d="M 60 70 Q 200 50 350 80 T 580 60 T 760 40"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="6"
                strokeDasharray="10 6"
                strokeLinecap="round"
              />
              {/* Accessible route — green solid */}
              <path
                d="M 60 70 Q 160 110 310 120 T 550 110 T 760 90"
                fill="none"
                stroke="#059669"
                strokeWidth="6"
                strokeLinecap="round"
                className="animate-pulse"
              />
            </svg>

            <div className="relative z-10 h-32 flex items-center justify-around px-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow">
                  <MapPin className="w-4 h-4 fill-current" aria-hidden="true" />
                </div>
                <span className="text-[10px] font-bold text-on-surface text-center max-w-[80px]">
                  {isDemoMode ? demoFrom : 'South Concourse'}
                </span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2 px-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-slate-400" style={{ borderTop: '2px dashed #94a3b8' }} />
                    <span className="text-[10px] font-semibold text-on-surface-variant">Normal</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-secondary" />
                    <span className="text-[10px] font-semibold text-secondary">Accessible</span>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur text-[10px] font-bold text-primary border border-primary/20">
                  Accessible route avoids {stairsAvoided} stairs &amp; {barriersAvoided} barriers
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center shadow">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                </div>
                <span className="text-[10px] font-bold text-on-surface text-center max-w-[80px]">
                  {isDemoMode ? demoTo : 'Cardiology Suite 304'}
                </span>
              </div>
            </div>
          </div>

          {/* Side-by-side route metric cards */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            role="region"
            aria-label="Route metrics comparison"
          >
            {/* Normal Route Card */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest border-2 border-outline-variant/40 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/20">
                <div
                  className="w-9 h-9 rounded-xl bg-outline-variant/30 flex items-center justify-center flex-shrink-0"
                  aria-hidden="true"
                >
                  <Navigation className="w-5 h-5 text-on-surface-variant" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-on-surface">Normal Route</h3>
                  <p className="text-[11px] text-on-surface-variant font-medium">
                    Direct path — does not avoid barriers
                  </p>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-3">
                <RouteMetric label="Distance" value={`${(normalDistanceM / 1000).toFixed(1)} km`} />
                <RouteMetric label="Est. Time" value={`${normalTimeMin} min`} />
                <RouteMetric label="Stairs" value={String(normalStairs)} alert={normalStairs > 0} />
                <RouteMetric label="Max Slope" value={`${normalMaxSlope}%`} alert={normalMaxSlope > 8} />
                <RouteMetric label="Barriers" value={String(normalBarriers)} alert={normalBarriers > 0} />
                <RouteMetric label="Unsafe Crossings" value={String(normalUnsafeCrossings)} alert={normalUnsafeCrossings > 0} />
              </dl>
            </div>

            {/* Accessible Route Card */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest border-2 border-secondary/40 shadow-md flex flex-col gap-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-secondary/20">
                <div
                  className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0"
                  aria-hidden="true"
                >
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-on-surface">Accessible Route</h3>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-secondary text-on-secondary uppercase">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant font-medium">
                    Optimised for {personaLabel[persona]}
                  </p>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-3">
                <RouteMetric label="Distance" value={`${(accessibleDistanceM / 1000).toFixed(1)} km`} good={distanceDeltaM <= 0} neutral={distanceDeltaM > 0} />
                <RouteMetric label="Est. Time" value={`${accessibleTimeMin} min`} good={timeDeltaMin <= 0} neutral={timeDeltaMin > 0} />
                <RouteMetric label="Stairs" value={String(accessibleStairs)} good={accessibleStairs < normalStairs} />
                <RouteMetric label="Max Slope" value={`${accessibleMaxSlope}%`} good={accessibleMaxSlope < normalMaxSlope} />
                <RouteMetric label="Barriers" value={String(accessibleBarriers)} good={accessibleBarriers < normalBarriers} />
                <RouteMetric label="Unsafe Crossings" value={String(accessibleUnsafeCrossings)} good={accessibleUnsafeCrossings < normalUnsafeCrossings} />
              </dl>
            </div>
          </div>

          {/* Improvement Metrics Row */}
          <div
            className="p-5 rounded-2xl bg-secondary/5 border border-secondary/20 flex flex-col gap-4"
            role="region"
            aria-label="Accessibility improvements achieved"
          >
            <div className="flex items-center gap-2 border-b border-secondary/20 pb-3">
              <TrendingDown className="w-5 h-5 text-secondary" aria-hidden="true" />
              <h3 className="text-base font-extrabold text-on-surface">Accessibility Improvements</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <ImprovementBadge
                label="Stairs Avoided"
                value={stairsAvoided > 0 ? `${stairsAvoided}` : '0'}
                good={stairsAvoided > 0}
                unit="steps"
              />
              <ImprovementBadge
                label="Barriers Avoided"
                value={barriersAvoided > 0 ? `${barriersAvoided}` : '0'}
                good={barriersAvoided > 0}
                unit="cleared"
              />
              <ImprovementBadge
                label="Slope Reduced"
                value={`${normalMaxSlope}% → ${accessibleMaxSlope}%`}
                good
                unit=""
              />
              <ImprovementBadge
                label="Unsafe Crossings"
                value={`${normalUnsafeCrossings} → ${accessibleUnsafeCrossings}`}
                good
                unit=""
              />
              <ImprovementBadge
                label="Distance"
                value={`${(normalDistanceM / 1000).toFixed(1)} → ${(accessibleDistanceM / 1000).toFixed(1)} km`}
                good={distanceDeltaM <= 0}
                neutral={distanceDeltaM > 0}
                unit=""
              />
              <ImprovementBadge
                label="Time"
                value={`${normalTimeMin} → ${accessibleTimeMin} min`}
                good={timeDeltaMin <= 0}
                neutral={timeDeltaMin > 0}
                unit=""
              />
            </div>
          </div>

          {/* Why did the route change? */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
              <Info className="w-5 h-5 text-primary" aria-hidden="true" />
              <h3 className="text-base font-extrabold text-on-surface">Why did the route change?</h3>
            </div>

            {currentRouteResult.isAdapted && currentRouteResult.adaptationNotice && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/15">
                <Navigation className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-xs font-semibold text-on-surface">
                  {currentRouteResult.adaptationNotice}
                </p>
              </div>
            )}

            {simulatedObstacle.active && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-tertiary-container/10 border border-tertiary/30">
                <AlertTriangle className="w-4 h-4 text-tertiary flex-shrink-0 mt-0.5 animate-pulse" aria-hidden="true" />
                <div>
                  <div className="text-xs font-extrabold text-tertiary mb-0.5">Active Simulation</div>
                  <p className="text-xs font-semibold text-on-surface">{simulatedObstacle.title}</p>
                  <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                    {simulatedObstacle.impact} · {simulatedObstacle.detourTime}
                  </p>
                </div>
              </div>
            )}

            <ul className="flex flex-col gap-2" aria-label="Route change reasons">
              {[
                `${normalStairs} flight(s) of stairs avoided — rerouted via ramp and elevator`,
                `${barriersAvoided} accessibility barrier(s) cleared from the path`,
                `Maximum slope reduced from ${normalMaxSlope}% to ${accessibleMaxSlope}% for wheelchair safety`,
                `Unsafe pedestrian crossings reduced from ${normalUnsafeCrossings} to ${accessibleUnsafeCrossings}`,
                `Route optimised for ${personaLabel[persona]} profile`,
              ].map((reason, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs font-medium text-on-surface">
                  <CheckCircle2 className="w-3.5 h-3.5 text-secondary flex-shrink-0 mt-0.5" aria-hidden="true" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Community-reported conditions */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" aria-hidden="true" />
                <h3 className="text-base font-extrabold text-on-surface">Community-Reported Conditions</h3>
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-low border border-outline-variant/30 px-2 py-0.5 rounded-full">
                {barrierReports.filter(r => !r.isExpired).length} active reports
              </span>
            </div>

            {barrierReports.filter(r => !r.isExpired).length === 0 ? (
              <p className="text-xs font-semibold text-on-surface-variant text-center py-2">
                No active community reports near this route.
              </p>
            ) : (
              <ul className="flex flex-col gap-3" aria-label="Community barrier reports">
                {barrierReports
                  .filter(r => !r.isExpired)
                  .slice(0, 4)
                  .map(report => (
                    <CommunityReportItem key={report.id} report={report} />
                  ))}
              </ul>
            )}

            <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant font-medium">
                <Info className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Confidence decays with time. Upvotes extend hazard TTL.</span>
              </div>
              <Link
                href="/community-confidence"
                className="text-xs font-bold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
              >
                View all →
              </Link>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/micro-navigation"
              className="flex-1 h-14 rounded-xl bg-primary text-on-primary font-bold text-base flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
            >
              <Navigation className="w-5 h-5 fill-current" aria-hidden="true" />
              <span>Start Micro-Navigation</span>
            </Link>
            <Link
              href="/report-barrier"
              className="px-6 h-14 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 font-bold text-sm text-on-surface flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <ShieldAlert className="w-5 h-5 text-primary" aria-hidden="true" />
              <span>Report a Barrier</span>
            </Link>
            <Link
              href="/route-simulator"
              className="px-6 h-14 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 font-bold text-sm text-on-surface flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <Radio className="w-5 h-5 text-primary" aria-hidden="true" />
              <span>Standalone Simulator</span>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function RouteMetric({
  label,
  value,
  alert = false,
  good = false,
  neutral = false,
}: {
  label: string;
  value: string;
  alert?: boolean;
  good?: boolean;
  neutral?: boolean;
}) {
  const valueColor = good
    ? 'text-secondary'
    : alert
    ? 'text-error'
    : neutral
    ? 'text-tertiary'
    : 'text-on-surface';

  return (
    <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
      <dt className="text-[11px] font-bold text-on-surface-variant">{label}</dt>
      <dd className={`text-lg font-extrabold ${valueColor} mt-0.5`}>{value}</dd>
    </div>
  );
}

function ImprovementBadge({
  label,
  value,
  good = false,
  neutral = false,
  unit,
}: {
  label: string;
  value: string;
  good?: boolean;
  neutral?: boolean;
  unit: string;
}) {
  const bg = good
    ? 'bg-secondary/10 border-secondary/20'
    : neutral
    ? 'bg-tertiary-container/10 border-tertiary/20'
    : 'bg-surface-container-low border-outline-variant/20';
  const textColor = good ? 'text-secondary' : neutral ? 'text-tertiary' : 'text-on-surface';

  return (
    <div className={`p-3 rounded-xl border ${bg} flex flex-col gap-1`}>
      <span className="text-[10px] font-bold text-on-surface-variant leading-tight">{label}</span>
      <span className={`text-sm font-extrabold ${textColor} leading-tight`}>{value}</span>
      {unit && <span className="text-[10px] text-on-surface-variant">{unit}</span>}
    </div>
  );
}

function CommunityReportItem({
  report,
}: {
  report: {
    id: string;
    title: string;
    location: string;
    severity: string;
    votes: number;
    downvotes: number;
    status: string;
    ttlExpiresAt?: string;
  };
}) {
  const severityColor: Record<string, string> = {
    low: 'bg-secondary/10 text-secondary border-secondary/20',
    medium: 'bg-tertiary-container/15 text-tertiary border-tertiary/20',
    high: 'bg-error/10 text-error border-error/20',
    critical: 'bg-error text-on-error border-error',
  };

  const freshnessMs = report.ttlExpiresAt
    ? new Date(report.ttlExpiresAt).getTime() - Date.now()
    : null;
  const freshnessMinutes = freshnessMs ? Math.max(0, Math.floor(freshnessMs / 60000)) : null;

  return (
    <li className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
      <div
        className={`flex-shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full border capitalize mt-0.5 ${
          severityColor[report.severity] ?? severityColor.medium
        }`}
      >
        {report.severity}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-extrabold text-on-surface truncate">{report.title}</div>
        <div className="text-[11px] text-on-surface-variant font-medium mt-0.5 truncate">
          {report.location}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-bold text-secondary">
            {report.votes}↑ / {report.downvotes}↓
          </span>
          <span className="text-[10px] text-on-surface-variant">•</span>
          <span className="text-[10px] font-bold text-on-surface-variant">{report.status}</span>
          {freshnessMinutes !== null && freshnessMinutes < 120 && (
            <>
              <span className="text-[10px] text-on-surface-variant">•</span>
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-tertiary">
                <Clock className="w-2.5 h-2.5" aria-hidden="true" />
                {freshnessMinutes} min left
              </span>
            </>
          )}
        </div>
      </div>
      <div
        className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${
          report.severity === 'critical' ? 'bg-error animate-pulse' : 'bg-tertiary'
        }`}
        aria-hidden="true"
      />
    </li>
  );
}
