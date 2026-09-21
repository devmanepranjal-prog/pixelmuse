'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccessibility, PersonaType } from '@/context/AccessibilityContext';
import {
  Navigation,
  Compass,
  Map,
  Users,
  AlertTriangle,
  PlusCircle,
  CheckCircle2,
  Contrast,
  Volume2,
  VolumeX,
  Accessibility,
  Footprints,
  Eye,
  Heart,
  User,
  ShieldCheck,
  MapPin
} from 'lucide-react';

const navItems = [
  { href: '/gps-precision', label: 'GPS Precision Map', icon: MapPin, badge: 'HIGH ACCURACY' },
  { href: '/', label: 'Route Planner', icon: Map },
  { href: '/micro-navigation', label: 'Micro-Navigation', icon: Compass },
  { href: '/live-adaptation-alert', label: 'Live Alert', icon: AlertTriangle, alert: true },
  { href: '/community-confidence', label: 'Community Confidence', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const {
    isHighContrast,
    toggleHighContrast,
    fontScale,
    setFontScale,
    isVoicePromptActive,
    toggleVoicePrompt,
    persona,
    setPersona,
    simulatedObstacle,
    speakText
  } = useAccessibility();

  const personas: { id: PersonaType; title: string; icon: React.ElementType }[] = [
    { id: 'wheelchair', title: 'Wheelchair', icon: Accessibility },
    { id: 'older-adult', title: 'Older Adult', icon: Footprints },
    { id: 'low-vision', title: 'Low Vision', icon: Eye },
    { id: 'caregiver', title: 'Caregiver', icon: Heart },
  ];

  return (
    <aside className="w-72 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col justify-between h-screen sticky top-0 z-50 flex-shrink-0 shadow-sm overflow-y-auto">
      
      {/* Top Brand Header */}
      <div className="p-5 flex flex-col gap-4 border-b border-outline-variant/20">
        <Link href="/gps-precision" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
            <Navigation className="w-6 h-6 fill-current text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-on-surface leading-tight tracking-tight">
              PathFinder
            </span>
            <span className="text-[11px] text-on-surface-variant font-bold tracking-wider uppercase">
              Barrier-Free Nav Core
            </span>
          </div>
        </Link>

        {/* GPS Precision Status Badge */}
        <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping" />
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold text-secondary uppercase tracking-wider">
                GPS High Precision
              </span>
              <span className="text-[10px] text-on-surface-variant font-semibold">
                ±0.5m Real-Time Accuracy
              </span>
            </div>
          </div>
          <ShieldCheck className="w-4 h-4 text-secondary flex-shrink-0" />
        </div>
      </div>

      {/* Navigation Pages */}
      <div className="px-3 py-4 flex-1 flex flex-col gap-1">
        <div className="px-3 py-1 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
          Navigation Dashboard
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3.5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-between group ${
                isActive
                  ? 'bg-primary-container text-on-primary-container shadow-md font-extrabold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-on-surface-variant group-hover:text-primary'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-secondary text-on-secondary uppercase">
                  {item.badge}
                </span>
              )}

              {item.alert && simulatedObstacle.active && (
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              )}
            </Link>
          );
        })}

        {/* Mobility Mode Selector in Sidebar */}
        <div className="mt-4 px-3 py-1 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
          Mobility Profile
        </div>
        <div className="grid grid-cols-2 gap-1.5 px-1">
          {personas.map((p) => {
            const Icon = p.icon;
            const isSelected = persona === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPersona(p.id);
                  speakText(`Mobility profile set to ${p.title}`);
                }}
                className={`p-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-primary/10 border-primary text-primary shadow-xs'
                    : 'bg-surface-container-low border-transparent text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{p.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Accessibility Toolbar Controls */}
      <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low flex flex-col gap-3">
        <div className="text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
          <span>Accessibility Toolbar</span>
          <span className="text-[10px] text-secondary font-bold">WCAG AAA</span>
        </div>

        {/* Contrast & Voice Row */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={toggleHighContrast}
            className={`h-10 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
              isHighContrast
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-lowest hover:bg-surface-container-high text-on-surface border border-outline-variant/30'
            }`}
          >
            <Contrast className="w-4 h-4" />
            <span>Contrast</span>
          </button>

          <button
            type="button"
            onClick={toggleVoicePrompt}
            className={`h-10 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
              isVoicePromptActive
                ? 'bg-secondary text-on-secondary shadow-sm'
                : 'bg-surface-container-lowest hover:bg-surface-container-high text-on-surface border border-outline-variant/30'
            }`}
          >
            {isVoicePromptActive ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            <span>Voice</span>
          </button>
        </div>

        {/* Font Scaling Row */}
        <div className="flex items-center justify-between p-1 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
          <span className="text-xs font-bold text-on-surface-variant pl-2">Text Size</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFontScale('sm')}
              className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                fontScale === 'sm' ? 'bg-primary-container text-on-primary-container font-extrabold' : 'text-on-surface-variant'
              }`}
            >
              T-
            </button>
            <button
              onClick={() => setFontScale('md')}
              className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                fontScale === 'md' ? 'bg-primary-container text-on-primary-container font-extrabold' : 'text-on-surface-variant'
              }`}
            >
              T
            </button>
            <button
              onClick={() => setFontScale('lg')}
              className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                fontScale === 'lg' ? 'bg-primary-container text-on-primary-container font-extrabold' : 'text-on-surface-variant'
              }`}
            >
              T+
            </button>
          </div>
        </div>

        {/* User Account */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-on-surface">Community Audit User</span>
              <span className="text-[10px] text-secondary font-bold">Level 4 Navigator</span>
            </div>
          </div>
        </div>

      </div>

    </aside>
  );
}
