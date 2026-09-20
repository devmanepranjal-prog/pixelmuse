'use client';

import React from 'react';
import Link from 'next/link';
import { useAccessibility } from '@/context/AccessibilityContext';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  MapPin,
  Clock,
  ShieldCheck,
  Navigation,
  Compass
} from 'lucide-react';

export default function LiveAdaptationAlertPage() {
  const { simulatedObstacle, toggleSimulatedObstacle, speakText, lastReroutePayload } = useAccessibility();

  return (
    <div className="w-full px-4 md:px-8 py-8 flex justify-center">
      <div className="w-full max-w-[850px] flex flex-col gap-6">
        
        {/* Title */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center shadow-md">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">
              Live Adaptation Alert
            </h1>
            <p className="text-on-surface-variant text-base font-medium">
              Real-time obstacle detector & automatic accessible rerouting system.
            </p>
          </div>
        </div>

        {/* Main Alert Card */}
        <div className="p-6 md:p-8 bg-surface-container-lowest rounded-3xl border-2 border-tertiary shadow-xl flex flex-col gap-6">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-tertiary/15 text-tertiary flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-bold text-tertiary uppercase tracking-wider">
                  Active Hazard Warning
                </span>
                <h2 className="text-xl font-extrabold text-on-surface">
                  {simulatedObstacle.title}
                </h2>
              </div>
            </div>

            <button
              onClick={() => {
                toggleSimulatedObstacle();
                speakText(simulatedObstacle.active ? "Simulated obstacle resolved. Original path restored." : "Simulated obstacle activated.");
              }}
              className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-center"
            >
              <RefreshCw className="w-4 h-4 text-primary" />
              <span>{simulatedObstacle.active ? 'Simulate Obstacle Fix' : 'Re-activate Alert'}</span>
            </button>
          </div>

          {/* Location & Impact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-tertiary flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-on-surface-variant">Affected Location</div>
                <div className="text-sm font-extrabold text-on-surface">{simulatedObstacle.location}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3">
              <Clock className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-on-surface-variant">Reroute Impact</div>
                <div className="text-sm font-extrabold text-secondary">{simulatedObstacle.detourTime}</div>
              </div>
            </div>
          </div>

          {/* Route Comparison Matrix */}
          <div className="flex flex-col gap-3 pt-2">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wide">
              Route Comparison: Original vs Adapted Step-Free Route
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Original Route (Blocked) */}
              <div className="p-5 rounded-2xl bg-error-container/10 border-2 border-error/30 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-error uppercase">Original Planned Route</span>
                    <XCircle className="w-5 h-5 text-error" />
                  </div>
                  <h4 className="font-extrabold text-base text-on-surface">Via Elevator B Central</h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Direct concourse path. Elevator out of service due to hydraulic fault.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-error-container/20 text-on-error-container text-xs font-bold flex items-center gap-2">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Stairs required as fallback (Not Step-Free)</span>
                </div>
              </div>

              {/* Adapted Route (Active) */}
              <div className="p-5 rounded-2xl bg-secondary-container/20 border-2 border-secondary flex flex-col justify-between gap-4 shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-secondary uppercase">Recommended Adapted Route</span>
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                  </div>
                  <h4 className="font-extrabold text-base text-on-surface">Via South Entrance Ramp C & Lift 4</h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Bypasses elevator hub via gentle 3.5% incline ramp and service lift.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-secondary text-on-secondary text-xs font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 text-white" />
                  <span>100% Step-Free & WCAG AAA Verified</span>
                </div>
              </div>

            </div>
          </div>

          {/* Real-time Recalculated Reroute Payload Telemetry */}
          {lastReroutePayload && (
            <div className="p-4 rounded-2xl bg-surface-container-high border border-primary/30 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-primary" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                    Emitted Reroute Payload Telemetry
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-xs font-bold">
                  Active Recalculation Trigger
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-surface-container-lowest">
                  <span className="text-on-surface-variant font-bold">Session ID:</span>
                  <div className="font-mono font-bold text-on-surface truncate">{lastReroutePayload.sessionId}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-container-lowest">
                  <span className="text-on-surface-variant font-bold">Hazard Avoided:</span>
                  <div className="font-bold text-error">{lastReroutePayload.hazardType}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-container-lowest">
                  <span className="text-on-surface-variant font-bold">Time Saved:</span>
                  <div className="font-bold text-secondary">+{lastReroutePayload.timeSaved} min</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-container-lowest">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-on-surface-variant">Encoded newPolyline:</span>
                  <span className="text-[10px] text-primary font-bold">OSRM/Google Spec (1e5 precision)</span>
                </div>
                <div className="font-mono text-xs text-on-surface break-all bg-surface-container p-2 rounded-lg">
                  {lastReroutePayload.newPolyline}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-outline-variant/30">
            <Link
              href="/micro-navigation"
              onClick={() => speakText("Adapted route accepted. Navigating via South Ramp C.")}
              className="flex-1 h-14 rounded-xl bg-secondary text-on-secondary font-bold text-base flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-opacity"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Accept & Navigate Reroute</span>
            </Link>

            <Link
              href="/community-confidence"
              className="px-6 h-14 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 font-bold text-sm text-on-surface flex items-center justify-center gap-2 transition-colors"
            >
              <Compass className="w-5 h-5 text-primary" />
              <span>Community Verification</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
