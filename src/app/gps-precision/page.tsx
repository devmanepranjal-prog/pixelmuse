'use client';

import React from 'react';
import InteractiveMap from '@/components/InteractiveMap';
import { MapPin, Navigation, ShieldCheck } from 'lucide-react';

export default function GpsPrecisionPage() {
  return (
    <div className="w-full p-4 md:p-6 flex flex-col gap-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-sm">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-on-surface tracking-tight">
              GPS High Precision Map Dashboard
            </h1>
            <p className="text-xs text-on-surface-variant font-medium">
              Google Maps-style barrier-free navigation engine with origin and destination pathing.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-extrabold shadow-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>GPS Accuracy ±0.5m</span>
        </div>
      </div>

      {/* Main Full Interactive Map Canvas */}
      <InteractiveMap />
    </div>
  );
}
