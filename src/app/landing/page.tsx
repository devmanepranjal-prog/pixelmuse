'use client';

import React from 'react';
import Link from 'next/link';
import { useAccessibility } from '@/context/AccessibilityContext';
import {
  Navigation,
  Sparkles,
  Accessibility,
  SlidersHorizontal,
  Volume2,
  ArrowRight,
  User,
  ShieldCheck,
  CheckCircle2,
  Compass,
  MapPin,
} from 'lucide-react';

export default function LandingPage() {
  const { openOnboarding, user } = useAccessibility();

  return (
    <div className="w-full min-h-screen bg-surface text-on-surface flex flex-col">
      {/* Top Navbar */}
      <header className="w-full px-6 py-4 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-sm">
            <Navigation className="w-6 h-6 text-white fill-current" />
          </div>
          <div className="flex flex-col py-1">
            <span className="text-xl sm:text-2xl font-black text-on-surface tracking-tight leading-normal">
              PathFinder Access
            </span>
            <span className="text-[11px] sm:text-xs text-on-surface-variant font-extrabold uppercase tracking-wider">
              Accessible Navigation Core
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.isLoggedIn ? (
            <>
              <span className="text-xs font-bold text-on-surface-variant hidden sm:inline">
                Welcome, <span className="text-on-surface font-extrabold">{user.name || 'Navigator'}</span>
              </span>
              <Link
                href="/gps-precision"
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-black shadow-sm hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4" />
                <span>Go to Navigation Dashboard →</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-xs font-extrabold text-on-surface transition-colors"
              >
                Log In
              </Link>

              <Link
                href="/signup"
                className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-black shadow-sm hover:opacity-90 transition-opacity"
              >
                Sign Up & Set Profile
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 py-12 flex flex-col gap-12 text-center items-center justify-center">
        
        {/* Badge & Title */}
        <div className="flex flex-col items-center gap-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black shadow-xs">
            <Sparkles className="w-4 h-4" />
            <span>WCAG AAA Accessible Community Navigation</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-on-surface tracking-tight leading-tight py-2">
            Barrier-Free Navigation <br className="hidden sm:inline" />
            <span className="text-primary">Tailored to Your Mobility</span>
          </h1>

          <p className="text-base sm:text-lg text-on-surface-variant font-semibold leading-relaxed max-w-2xl">
            Precision GPS guidance, real-time crowdsourced barrier alerts, and custom step-free route recommendations calibrated to your exact physical requirements.
          </p>
        </div>

        {/* Primary Call-to-Actions */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-xl">
          {user.isLoggedIn ? (
            <>
              <Link
                href="/gps-precision"
                className="w-full md:flex-1 min-h-[3.5rem] py-3 px-4 rounded-2xl bg-primary text-on-primary font-black text-base flex flex-wrap items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-opacity text-center"
              >
                <Compass className="w-5 h-5 flex-shrink-0" />
                <span>Open GPS Precision Map</span>
                <ArrowRight className="w-5 h-5 flex-shrink-0" />
              </Link>

              <Link
                href="/micro-navigation"
                className="w-full md:flex-1 min-h-[3.5rem] py-3 px-4 rounded-2xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/50 text-on-surface font-extrabold text-base flex flex-wrap items-center justify-center gap-2 transition-colors text-center"
              >
                <Navigation className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Micro-Nav HUD</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className="w-full md:flex-1 min-h-[3.5rem] py-3 px-4 rounded-2xl bg-primary text-on-primary font-black text-base flex flex-wrap items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-opacity text-center"
              >
                <span>Create Account & Setup Profile</span>
                <ArrowRight className="w-5 h-5 flex-shrink-0" />
              </Link>

              <Link
                href="/login"
                className="w-full md:flex-1 min-h-[3.5rem] py-3 px-4 rounded-2xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/50 text-on-surface font-extrabold text-base flex flex-wrap items-center justify-center gap-2 transition-colors text-center"
              >
                <User className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Log In</span>
              </Link>
            </>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-6 text-left">
          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Accessibility className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-on-surface">Step-Free Guarantees</h2>
            <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
              Guaranteed ramp, elevator & curb-cut routing. Never get trapped by unexpected flight of stairs again.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-on-surface">Slope & Incline Tolerances</h2>
            <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
              Customize maximum slope limits (3% to 15% grade) to filter out steep hills and strenuous ramps.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center">
              <Volume2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-on-surface">Spoken Voice Navigation</h2>
            <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
              Auditory crossing cues and turn-by-turn spoken guidance for visually impaired and low-vision navigators.
            </p>
          </div>
        </div>

        {/* Quick Link to Dashboard */}
        <div className="pt-4">
          <Link
            href="/gps-precision"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-primary hover:underline underline-offset-4"
          >
            <span>Launch GPS Precision Map & Navigation Dashboard →</span>
          </Link>
        </div>

      </main>
    </div>
  );
}
