'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAccessibility, PersonaType } from '@/context/AccessibilityContext';
import {
  Search,
  Mic,
  Check,
  CheckCircle2,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Navigation,
  Compass,
  AlertTriangle,
  Info,
  ChevronRight,
  Footprints,
  Accessibility,
  Eye,
  Heart,
  Maximize2,
  Camera
} from 'lucide-react';

interface PreferenceState {
  stepFreeElevators: boolean;
  gentleSlopes: boolean;
  tactilePaving: boolean;
  wideDoors: boolean;
  lowSensory: boolean;
}

export default function RoutePlannerPage() {
  const { persona, setPersona, simulatedObstacle, speakText } = useAccessibility();
  const [searchQuery, setSearchQuery] = useState('St. Jude Medical Pavilion - Cardiology Dept');
  const [isSearching, setIsSearching] = useState(false);
  const [preferences, setPreferences] = useState<PreferenceState>({
    stepFreeElevators: true,
    gentleSlopes: true,
    tactilePaving: true,
    wideDoors: true,
    lowSensory: false,
  });

  const personas: { id: PersonaType; title: string; icon: React.ElementType }[] = [
    { id: 'wheelchair', title: 'Wheelchair', icon: Accessibility },
    { id: 'older-adult', title: 'Older Adult', icon: Footprints },
    { id: 'low-vision', title: 'Low Vision', icon: Eye },
    { id: 'caregiver', title: 'Caregiver', icon: Heart },
  ];

  const togglePreference = (key: keyof PreferenceState) => {
    setPreferences(prev => {
      const next = { ...prev, [key]: !prev[key] };
      speakText(`${key.replace(/([A-Z])/g, ' $1')} preference toggled ${next[key] ? 'on' : 'off'}`);
      return next;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    speakText(`Calculating accessible route to ${searchQuery}`);
    setTimeout(() => {
      setIsSearching(false);
    }, 600);
  };

  return (
    <div className="w-full px-4 md:px-8 py-8 flex justify-center">
      <div className="w-full max-w-[850px] flex flex-col gap-6">
        
        {/* Title Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-md">
            <Compass className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">
              Route Planner
            </h1>
            <p className="text-on-surface-variant text-base font-medium">
              Plan an accessible journey tailored to your exact mobility parameters.
            </p>
          </div>
        </div>

        {/* Live Simulation Warning Banner if active */}
        {simulatedObstacle.active && (
          <div className="p-4 rounded-2xl bg-tertiary-container/15 border-2 border-tertiary/40 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-6 h-6 text-tertiary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-tertiary uppercase tracking-wider">
                  Real-time Adaptation Active
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-tertiary text-on-tertiary">
                  {simulatedObstacle.detourTime}
                </span>
              </div>
              <h3 className="font-bold text-on-surface text-base mt-1">
                {simulatedObstacle.title}
              </h3>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                {simulatedObstacle.impact}
              </p>
            </div>
            <Link
              href="/live-adaptation-alert"
              className="px-3 py-1.5 rounded-xl bg-tertiary text-on-tertiary text-xs font-bold hover:opacity-90 transition-opacity self-center whitespace-nowrap"
            >
              View Reroute
            </Link>
          </div>
        )}

        {/* Destination Search Box */}
        <form onSubmit={handleSearch} className="relative">
          <div className="relative flex items-center bg-surface-container-lowest rounded-2xl shadow-md border border-outline-variant/40 focus-within:shadow-xl focus-within:border-primary transition-all">
            <div className="pl-4 pr-2 text-on-surface-variant">
              <Search className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search venue, clinic, or destination..."
              className="w-full h-16 bg-transparent text-lg font-medium text-on-surface placeholder:text-outline focus:outline-none pr-4"
              aria-label="Search destination or venue"
            />
            <button
              type="button"
              onClick={() => speakText("Voice input listening for destination")}
              className="h-12 w-12 mr-2 flex items-center justify-center rounded-xl text-primary hover:bg-surface-container-high transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Voice input search"
            >
              <Mic className="w-6 h-6" />
            </button>
          </div>
        </form>

        {/* Mobility Persona Radiogroup */}
        <section aria-labelledby="travel-persona-heading" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 id="travel-persona-heading" className="text-lg font-bold text-on-surface">
              I am travelling as:
            </h2>
            <span className="text-xs font-semibold text-primary">
              Select primary mobility mode
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {personas.map((p) => {
              const Icon = p.icon;
              const isSelected = persona === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPersona(p.id);
                    speakText(`Selected travel mode: ${p.title}`);
                  }}
                  className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all h-28 focus:outline-none focus:ring-2 focus:ring-primary ${
                    isSelected
                      ? 'bg-surface-container-lowest shadow-md border-2 border-primary ring-2 ring-primary/20'
                      : 'bg-surface-container-lowest shadow-xs border border-outline-variant/30 hover:bg-surface-container-low'
                  }`}
                  aria-pressed={isSelected}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-primary/10 text-primary'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-sm text-on-surface text-center">
                    {p.title}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Route Preferences Section */}
        <section className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-on-surface">
                Accessibility Preferences
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary text-on-secondary text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              WCAG AAA Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => togglePreference('stepFreeElevators')}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
                preferences.stepFreeElevators
                  ? 'bg-secondary-container/20 border-secondary text-on-surface'
                  : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
              }`}
            >
              <div>
                <div className="font-bold text-sm text-on-surface">Step-Free & Elevators Only</div>
                <div className="text-xs text-on-surface-variant font-medium">Bypasses all stairs and high steps</div>
              </div>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${
                preferences.stepFreeElevators ? 'bg-secondary text-white border-secondary' : 'border-outline'
              }`}>
                {preferences.stepFreeElevators && <Check className="w-4 h-4" />}
              </div>
            </button>

            <button
              type="button"
              onClick={() => togglePreference('gentleSlopes')}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
                preferences.gentleSlopes
                  ? 'bg-secondary-container/20 border-secondary text-on-surface'
                  : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
              }`}
            >
              <div>
                <div className="font-bold text-sm text-on-surface">Gentle Ramp Incline (&lt; 5%)</div>
                <div className="text-xs text-on-surface-variant font-medium">Avoids steep manual wheelchair ramps</div>
              </div>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${
                preferences.gentleSlopes ? 'bg-secondary text-white border-secondary' : 'border-outline'
              }`}>
                {preferences.gentleSlopes && <Check className="w-4 h-4" />}
              </div>
            </button>

            <button
              type="button"
              onClick={() => togglePreference('tactilePaving')}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
                preferences.tactilePaving
                  ? 'bg-secondary-container/20 border-secondary text-on-surface'
                  : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
              }`}
            >
              <div>
                <div className="font-bold text-sm text-on-surface">Tactile Ground Indicators</div>
                <div className="text-xs text-on-surface-variant font-medium">Prioritizes tactile paving paths</div>
              </div>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${
                preferences.tactilePaving ? 'bg-secondary text-white border-secondary' : 'border-outline'
              }`}>
                {preferences.tactilePaving && <Check className="w-4 h-4" />}
              </div>
            </button>

            <button
              type="button"
              onClick={() => togglePreference('wideDoors')}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
                preferences.wideDoors
                  ? 'bg-secondary-container/20 border-secondary text-on-surface'
                  : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
              }`}
            >
              <div>
                <div className="font-bold text-sm text-on-surface">Wide Doorways (&gt; 90cm)</div>
                <div className="text-xs text-on-surface-variant font-medium">Verified automatic wide doors</div>
              </div>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${
                preferences.wideDoors ? 'bg-secondary text-white border-secondary' : 'border-outline'
              }`}>
                {preferences.wideDoors && <Check className="w-4 h-4" />}
              </div>
            </button>
          </div>
        </section>

        {/* Calculated Accessible Route Preview Card */}
        <section className="p-6 bg-surface-container-lowest rounded-2xl border-2 border-primary/30 shadow-md flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/20 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% Step-Free Verified Route</span>
              </div>
              <h2 className="text-xl font-bold text-on-surface">
                Main Concourse to Cardiology Suite
              </h2>
              <p className="text-xs text-on-surface-variant font-semibold mt-1">
                Via South Entrance Ramp C & Elevator B
              </p>
            </div>
            <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/30">
              <div className="text-center">
                <div className="text-xs text-on-surface-variant font-medium">Distance</div>
                <div className="font-extrabold text-lg text-primary">450 m</div>
              </div>
              <div className="h-8 w-px bg-outline-variant/40" />
              <div className="text-center">
                <div className="text-xs text-on-surface-variant font-medium">Est. Time</div>
                <div className="font-extrabold text-lg text-secondary">6 mins</div>
              </div>
            </div>
          </div>

          {/* Interactive Map Visualizer Placeholder Component */}
          <div className="relative w-full h-48 rounded-xl bg-surface-container-high overflow-hidden border border-outline-variant/40 flex items-center justify-center">
            {/* Map styling grid graphic */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative z-10 flex flex-col items-center gap-2 p-4 text-center">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-lowest shadow-md text-sm font-bold text-primary">
                <Navigation className="w-4 h-4 fill-primary" />
                <span>Interactive Accessible Path Loaded</span>
              </div>
              <p className="text-xs font-semibold text-on-surface-variant max-w-md">
                Tactile paved surface • Zero stairs • 2 Automatic doors • Elevator level 3
              </p>
            </div>
          </div>

          {/* Turn-by-Turn Waypoint List */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wide">
              Step-by-Step Waypoint Guidance
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <div className="font-bold text-sm text-on-surface">Enter South Accessible Entrance</div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        98% Trust
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                        <Camera className="w-2.5 h-2.5" />
                        <span>Photo Proof</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-on-surface-variant font-medium mt-0.5">
                    110cm wide automatic sliding door with tactile floor indicator strip.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <div className="font-bold text-sm text-on-surface">Ascend Concourse Ramp C</div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        97% Trust (Ramp)
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                        <Camera className="w-2.5 h-2.5" />
                        <span>Photo Proof</span>
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>AI Verified</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-on-surface-variant font-medium mt-0.5">
                    Gentle 3.5% incline with dual stainless steel handrails &amp; continuous grip floor.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <div className="font-bold text-sm text-on-surface">Elevator B to 3rd Floor</div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        96% Trust (Lift)
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                        <Camera className="w-2.5 h-2.5" />
                        <span>Photo Proof</span>
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>AI Verified</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-on-surface-variant font-medium mt-0.5">
                    Braille buttons at 100cm height + voice floor announcement.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/micro-navigation"
              className="flex-1 h-14 rounded-xl bg-primary text-on-primary font-bold text-base flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition-opacity"
            >
              <Navigation className="w-5 h-5 fill-current" />
              <span>Start Micro-Navigation</span>
            </Link>
            
            <Link
              href="/route-simulator"
              className="px-6 h-14 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 font-bold text-sm text-on-surface flex items-center justify-center gap-2 transition-colors"
            >
              <Sliders className="w-5 h-5 text-primary" />
              <span>Simulate Reroute</span>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
