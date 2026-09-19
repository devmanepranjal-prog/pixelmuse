'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccessibility } from '@/context/AccessibilityContext';
import {
  PlusCircle,
  MapPin,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Tag,
  Sliders,
  Send,
  ShieldAlert
} from 'lucide-react';

export default function ReportBarrierPage() {
  const { addBarrierReport, speakText } = useAccessibility();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Elevator Outage');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [location, setLocation] = useState('North Concourse Plaza - Entrance Gate 3');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    'Elevator Outage',
    'Construction Obstruction',
    'Missing Curb Cut',
    'Door Sensor Malfunction',
    'Steep Slope Ramp',
    'Other Hazard'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsSubmitting(true);
    speakText("Submitting accessibility barrier report to community network");

    setTimeout(() => {
      addBarrierReport({
        title,
        category,
        severity,
        location,
        description: description || 'Reported by community navigator.'
      });
      setIsSubmitting(false);
      setSubmitted(true);

      setTimeout(() => {
        router.push('/community-confidence');
      }, 1200);
    }, 500);
  };

  return (
    <div className="w-full px-4 md:px-8 py-8 flex justify-center">
      <div className="w-full max-w-[800px] flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center shadow-md">
            <PlusCircle className="w-7 h-7 text-tertiary" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">
              Report a Barrier
            </h1>
            <p className="text-on-surface-variant text-base font-medium">
              Crowdsource physical accessibility hazards to safeguard community navigators.
            </p>
          </div>
        </div>

        {/* Success Toast Banner */}
        {submitted && (
          <div className="p-4 rounded-2xl bg-secondary-container/30 border-2 border-secondary flex items-center gap-3 shadow-md animate-bounce">
            <CheckCircle2 className="w-6 h-6 text-secondary flex-shrink-0" />
            <div>
              <h3 className="font-extrabold text-on-surface text-sm">
                Barrier Report Submitted Successfully!
              </h3>
              <p className="text-xs text-on-surface-variant font-medium">
                Redirecting to Community Confidence Feed...
              </p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/40 shadow-lg flex flex-col gap-6">
          
          {/* Title Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-on-surface flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-tertiary" />
              Barrier Title / Hazard Summary *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., North Elevator Outage or Broken Curb Cut Ramp"
              className="w-full h-14 px-4 rounded-xl bg-surface-container-low border border-outline-variant/40 font-medium text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Category Chip Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              Hazard Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    speakText(`Category selected: ${cat}`);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                    category === cat
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface border border-outline-variant/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Location Field with Pin Button */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-on-surface flex items-center gap-2">
              <MapPin className="w-4 h-4 text-secondary" />
              Exact Location
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Building, entrance, floor, or cross street..."
                className="w-full h-14 px-4 rounded-xl bg-surface-container-low border border-outline-variant/40 font-medium text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => {
                  setLocation('Current GPS Pin (37.7749° N, 122.4194° W)');
                  speakText('Current GPS pin inserted');
                }}
                className="h-14 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center gap-1.5 border border-outline-variant/30 whitespace-nowrap"
              >
                <MapPin className="w-4 h-4" />
                <span>GPS Pin</span>
              </button>
            </div>
          </div>

          {/* Severity Radio Group */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Sliders className="w-4 h-4 text-tertiary" />
              Severity Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'low', label: 'Low', color: 'bg-surface-container text-on-surface' },
                { id: 'medium', label: 'Medium', color: 'bg-secondary/20 text-secondary' },
                { id: 'high', label: 'High', color: 'bg-tertiary/20 text-tertiary' },
                { id: 'critical', label: 'Critical', color: 'bg-error-container text-on-error-container' }
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSeverity(s.id as any)}
                  className={`h-12 rounded-xl text-xs font-extrabold transition-all border ${
                    severity === s.id
                      ? 'border-primary ring-2 ring-primary/30 shadow-xs ' + s.color
                      : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description Textarea */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-on-surface">
              Detailed Description & Guidance Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the barrier, clearance dimensions, or workaround options..."
              className="w-full p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 font-medium text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Photo Attachment Button */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-dashed border-outline-variant/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="w-6 h-6 text-primary" />
              <div>
                <div className="text-sm font-bold text-on-surface">Photo Evidence (Optional)</div>
                <div className="text-xs text-on-surface-variant">JPG, PNG up to 10MB</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => speakText("Photo attachment window opened")}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary font-bold text-xs"
            >
              Attach Photo
            </button>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-14 rounded-xl bg-primary text-on-primary font-extrabold text-base flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-opacity mt-2"
          >
            <Send className="w-5 h-5" />
            <span>{isSubmitting ? 'Publishing Report...' : 'Publish Barrier Report'}</span>
          </button>

        </form>

      </div>
    </div>
  );
}
