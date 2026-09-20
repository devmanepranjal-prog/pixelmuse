'use client';

import React, { useMemo, useState } from 'react';
import { useAccessibility } from '@/context/AccessibilityContext';
import {
  Volume2,
  Navigation,
  AlertTriangle,
  Info,
  CheckCircle2,
  Camera,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  X
} from 'lucide-react';
import { entrances, Entrance } from '@/data/entrances';
import { selectEntrance } from '@/lib/entranceSelector';
import { computeConfidence } from '@/lib/confidence';

export default function Last50mCard() {
  const { persona, speakText } = useAccessibility();
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Mock user location near Building B for the purpose of the distance calculation
  const userLocation = { lat: 40.7126, lng: -74.0055 };

  const { recommended, avoided, reasoning } = useMemo(
    () => selectEntrance(entrances, persona, userLocation),
    [persona]
  );

  const confidence = recommended ? computeConfidence(recommended) : null;

  const handleSpeak = () => {
    speakText(reasoning);
  };

  return (
    <div className="mt-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
        <span className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 fill-primary" />
          Last 50 m: Entrance Guidance
        </span>
        {confidence && (
          <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            {confidence.score}% Trust Score
          </span>
        )}
      </div>

      {recommended ? (
        <div className="flex flex-col gap-2">
          {/* Recommended Entrance */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-sm flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-1 flex-wrap">
                <h4 className="text-sm font-extrabold text-on-surface">{recommended.name}</h4>
                {recommended.photoAttached && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    <span>Photo Proof</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1 mt-1">
                {recommended.stepFree && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary text-white">
                    Step-Free
                  </span>
                )}
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                  {recommended.doorType} door
                </span>
                {recommended.rampSlopePercent && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                    {recommended.rampSlopePercent}% slope ramp
                  </span>
                )}
                {recommended.aiVerification && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>AI Verified</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Confidence Info & Photo Proof Action */}
          {confidence && (
            <div className="flex flex-col gap-1.5 mt-1 px-2.5 py-2 rounded-xl bg-surface-container-highest/50 border border-outline-variant/20 text-[10px] text-on-surface-variant">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                  <span>
                    Confidence: <strong className="text-on-surface">{confidence.score}%</strong> ({confidence.tier})
                    {' '}• {recommended.source} • Verified {Math.floor((Date.now() - new Date(recommended.lastVerified).getTime())/86400000)}d ago
                  </span>
                </div>

                {recommended.photoUrl && (
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(true)}
                    className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <Camera className="w-3 h-3" />
                    <span>View Photo Proof</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm font-bold text-red-600">No verified accessible entrance found for your profile.</div>
      )}

      {/* Avoided */}
      {avoided.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-2 border-t border-outline-variant/20">
          <span className="text-[11px] font-bold text-on-surface-variant">Avoided Entrances:</span>
          <div className="flex flex-wrap gap-1.5">
            {avoided.map((a, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 px-2 py-1 rounded-md">
                <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
                <span className="text-[10px] font-bold text-red-700 dark:text-red-300">{a.entrance.name}</span>
                <span className="text-[10px] text-red-600/80 dark:text-red-400/80 px-1 border-l border-red-200 dark:border-red-900">
                  {a.reason}
                </span>
                {a.entrance.photoAttached && (
                  <span className="text-[9px] font-bold text-red-500">📷 Proof</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instruction & Speak */}
      <div
        className="flex items-center gap-3 p-3 rounded-xl bg-secondary-container/30 border border-secondary/20"
        aria-live="polite"
      >
        <p className="text-xs font-medium text-on-surface flex-1">
          {reasoning}
        </p>
        <button
          onClick={handleSpeak}
          className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-md hover:opacity-90 transition-opacity flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-secondary"
          aria-label="Speak instruction"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Photo Proof Modal for Recommended Entrance */}
      {showPhotoModal && recommended && recommended.photoUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/40 shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-fadeIn">
            <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-on-surface">Photo Proof: {recommended.name}</span>
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-on-surface-variant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-3">
              <div className="rounded-xl overflow-hidden border border-outline-variant/30 shadow-xs">
                <img
                  src={recommended.photoUrl}
                  alt={recommended.name}
                  className="w-full h-48 object-cover"
                />
              </div>

              {recommended.aiVerification && (
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
                  <div className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    AI Vision Analysis: {recommended.aiVerification.confidence}% Match
                  </div>
                  <div className="font-semibold text-on-surface mt-0.5">
                    {recommended.aiVerification.label}
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    {recommended.aiVerification.details}
                  </p>
                </div>
              )}

              {confidence && (
                <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs flex flex-col gap-1">
                  <div className="flex items-center justify-between font-bold text-on-surface">
                    <span>Accessibility Confidence Score</span>
                    <span className="text-primary font-mono">{confidence.score}%</span>
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    {recommended.source} • {recommended.confirmations} community confirmations
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-outline-variant/20 flex justify-end">
              <button
                onClick={() => setShowPhotoModal(false)}
                className="px-4 py-1.5 rounded-xl bg-primary text-on-primary font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
