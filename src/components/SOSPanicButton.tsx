'use client';

import React, { useState, useCallback, useRef } from 'react';
import { AlertTriangle, Phone } from 'lucide-react';

interface SOSPanicButtonProps {
  userEmail: string;
  coords?: { lat: number; lng: number };
  tripId?: string;
  /** Called after SOS is successfully dispatched */
  onSOSDispatched?: () => void;
  /** Compact mode: smaller button for inline use */
  compact?: boolean;
}

/**
 * SOSPanicButton — Emergency panic button component.
 *
 * On press:
 *  1. Plays a browser audio cue via the Web Audio API (two urgent beeps).
 *  2. Calls POST /api/guardian/sos to notify all active guardians.
 *  3. Triggers onSOSDispatched callback.
 *
 * Requires a 2-second hold (longpress) to prevent accidental triggers.
 * Shows a radial progress ring during hold.
 */
export default function SOSPanicButton({
  userEmail,
  coords,
  tripId,
  onSOSDispatched,
  compact = false,
}: SOSPanicButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dispatching, setDispatching] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const [error, setError] = useState('');

  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStartRef = useRef<number>(0);
  const HOLD_DURATION_MS = 2000;
  const TICK_MS = 50;

  // ─── Audio ──────────────────────────────────────────────────────────────────

  function playSOSBeep() {
    try {
      const ctx = new AudioContext();
      function beep(startTime: number, freq: number, duration: number) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.4, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      }
      // Three short beeps — SOS pattern
      beep(ctx.currentTime + 0.00, 880, 0.15);
      beep(ctx.currentTime + 0.20, 880, 0.15);
      beep(ctx.currentTime + 0.40, 660, 0.35);
    } catch {
      // AudioContext not available (SSR / privacy mode) — silently skip
    }
  }

  // ─── Hold-to-trigger logic ───────────────────────────────────────────────────

  const startHold = useCallback(() => {
    if (dispatching || dispatched) return;
    setIsHolding(true);
    setProgress(0);
    holdStartRef.current = Date.now();

    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      const pct = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(holdTimerRef.current!);
        triggerSOS();
      }
    }, TICK_MS);
  }, [dispatching, dispatched]);

  const cancelHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHolding(false);
    setProgress(0);
  }, []);

  const triggerSOS = useCallback(async () => {
    setIsHolding(false);
    setDispatching(true);
    setError('');
    playSOSBeep();

    try {
      const currentCoords =
        coords ||
        (typeof window !== 'undefined' &&
          (await new Promise<{ lat: number; lng: number } | null>(resolve => {
            if (!navigator.geolocation) return resolve(null);
            navigator.geolocation.getCurrentPosition(
              p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
              () => resolve(null),
              { timeout: 3000, maximumAge: 10000 }
            );
          }))) ||
        { lat: 19.076, lng: 72.8777 };

      const res = await fetch('/api/guardian/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, coords: currentCoords, tripId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'SOS dispatch failed.');
      }

      setDispatched(true);
      onSOSDispatched?.();

      // Reset after 30 seconds to allow re-trigger
      setTimeout(() => {
        setDispatched(false);
        setProgress(0);
      }, 30_000);
    } catch (err: any) {
      setError(err.message || 'SOS failed to send. Call emergency services directly.');
    } finally {
      setDispatching(false);
    }
  }, [userEmail, coords, tripId, onSOSDispatched]);

  // ─── Rendering ───────────────────────────────────────────────────────────────

  const circumference = 2 * Math.PI * (compact ? 26 : 44);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const baseSize = compact ? 'w-14 h-14' : 'w-24 h-24';
  const iconSize = compact ? 'w-6 h-6' : 'w-10 h-10';
  const svgSize = compact ? 60 : 100;
  const r = compact ? 26 : 44;

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {/* Button with radial hold-progress ring */}
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        {/* SVG progress ring */}
        <svg
          width={svgSize}
          height={svgSize}
          className="absolute inset-0 -rotate-90"
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={r}
            fill="none"
            stroke="rgba(220,38,38,0.2)"
            strokeWidth={compact ? 3 : 4}
          />
          {/* Progress */}
          {isHolding && (
            <circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={r}
              fill="none"
              stroke="#dc2626"
              strokeWidth={compact ? 3 : 4}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all"
              style={{ transitionDuration: `${TICK_MS}ms` }}
            />
          )}
        </svg>

        {/* Button core */}
        <button
          type="button"
          id="sos-panic-button"
          aria-label="SOS Emergency Button — Hold for 2 seconds to trigger"
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchStart={e => { e.preventDefault(); startHold(); }}
          onTouchEnd={cancelHold}
          disabled={dispatching}
          className={[
            'absolute inset-0 m-auto rounded-full flex items-center justify-center cursor-pointer transition-all duration-200',
            baseSize,
            dispatched
              ? 'bg-red-900 shadow-lg shadow-red-900/40'
              : isHolding
              ? 'bg-red-500 scale-95 shadow-xl shadow-red-500/60'
              : 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/40 hover:shadow-red-500/60 active:scale-95',
            dispatching ? 'opacity-70 cursor-wait' : '',
          ].join(' ')}
          style={{
            width: compact ? 48 : 80,
            height: compact ? 48 : 80,
            top: '50%',
            left: '50%',
            transform: isHolding
              ? 'translate(-50%, -50%) scale(0.95)'
              : 'translate(-50%, -50%)',
          }}
        >
          {dispatched ? (
            <Phone className={`${iconSize} text-white animate-pulse`} />
          ) : (
            <AlertTriangle className={`${iconSize} text-white ${dispatching ? 'animate-spin' : ''}`} />
          )}
        </button>
      </div>

      {/* Label */}
      {!compact && (
        <div className="text-center">
          <p className="text-xs font-black text-red-600 uppercase tracking-widest">
            {dispatched ? 'SOS SENT ✓' : dispatching ? 'Sending…' : 'Hold 2s · SOS'}
          </p>
          {isHolding && (
            <p className="text-[10px] text-red-400 mt-0.5 animate-pulse">
              Release to cancel
            </p>
          )}
          {error && (
            <p className="text-[10px] text-red-500 mt-1 max-w-[120px] text-center">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
