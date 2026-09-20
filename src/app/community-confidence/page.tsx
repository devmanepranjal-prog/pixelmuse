'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAccessibility } from '@/context/AccessibilityContext';
import {
  Users,
  ShieldCheck,
  ThumbsUp,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PlusCircle,
  Award,
  Filter
} from 'lucide-react';

export default function CommunityConfidencePage() {
  const { barrierReports, upvoteReport, downvoteReport, speakText } = useAccessibility();
  const [filterTag, setFilterTag] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterOptions = [
    { id: 'all', label: 'All Community Audits' },
    { id: 'elevator', label: 'Elevator Outages' },
    { id: 'verified', label: 'Verified Accessible' },
    { id: 'critical', label: 'Critical Barriers' }
  ];

  const filteredReports = barrierReports.filter(report => {
    if (report.isExpired || report.status === 'Expired') return false;
    if (filterTag === 'elevator' && !report.category.toLowerCase().includes('elevator')) return false;
    if (filterTag === 'critical' && report.severity !== 'critical') return false;
    if (filterTag === 'verified' && report.status !== 'Verified') return false;
    if (searchQuery && !report.title.toLowerCase().includes(searchQuery.toLowerCase()) && !report.location.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="w-full px-4 md:px-8 py-8 flex justify-center">
      <div className="w-full max-w-[850px] flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shadow-md">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">
                Community Confidence
              </h1>
              <p className="text-on-surface-variant text-base font-medium">
                Verified crowd-audited places & community trust scores.
              </p>
            </div>
          </div>

          <Link
            href="/report-barrier"
            className="h-12 px-5 rounded-xl bg-primary text-on-primary font-bold text-sm flex items-center gap-2 shadow-md hover:opacity-90 transition-opacity self-start sm:self-center whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Barrier</span>
          </Link>
        </div>

        {/* Overall Trust Metric Dashboard Card */}
        <div className="p-6 bg-gradient-to-r from-primary-container/20 to-secondary-container/20 rounded-3xl border border-primary/20 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary text-on-secondary flex items-center justify-center shadow-md flex-shrink-0">
              <Award className="w-10 h-10" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-secondary uppercase tracking-wider">
                Community Network Health
              </div>
              <div className="text-3xl font-black text-on-surface">98.4% Trust Score</div>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                Based on 1,420 real-time crowd audits across 350 urban sectors.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-surface-container-lowest px-4 py-3 rounded-2xl border border-outline-variant/30 w-full sm:w-auto justify-around">
            <div className="text-center">
              <div className="text-xs font-bold text-on-surface-variant">Active Audits</div>
              <div className="text-xl font-extrabold text-primary">1,420</div>
            </div>
            <div className="h-8 w-px bg-outline-variant/30" />
            <div className="text-center">
              <div className="text-xs font-bold text-on-surface-variant">Resolved</div>
              <div className="text-xl font-extrabold text-secondary">94%</div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-4 top-4 text-on-surface-variant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports or locations..."
              className="w-full h-13 pl-12 pr-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 font-medium text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
            {filterOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFilterTag(opt.id)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  filterTag === opt.id
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-lowest hover:bg-surface-container-high text-on-surface border border-outline-variant/30'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Feed */}
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-bold text-on-surface uppercase tracking-wide">
            Live Community Audit Feed ({filteredReports.length})
          </h2>

          {filteredReports.map((report) => {
            const isCritical = report.severity === 'critical';
            return (
              <div
                key={report.id}
                className={`p-6 rounded-3xl bg-surface-container-lowest border transition-all shadow-xs flex flex-col gap-4 ${
                  isCritical ? 'border-tertiary/60 shadow-md' : 'border-outline-variant/40'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                        isCritical
                          ? 'bg-tertiary/20 text-tertiary'
                          : 'bg-secondary-container text-on-secondary-container'
                      }`}
                    >
                      {report.category}
                    </span>
                    <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {report.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-secondary">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{report.status}</span>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-lg font-extrabold text-on-surface">
                    {report.title}
                  </h3>
                  <div className="text-xs font-bold text-primary mt-0.5">
                    📍 {report.location}
                  </div>
                  <p className="text-sm text-on-surface-variant font-medium mt-2 leading-relaxed">
                    {report.description}
                  </p>
                </div>

                {/* Footer Upvote & Downvote */}
                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        upvoteReport(report.id);
                        speakText(`Helpful upvote registered for ${report.title}`);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Confirm Still There (+30m) ({report.votes})</span>
                    </button>

                    <button
                      onClick={() => {
                        downvoteReport(report.id);
                        speakText(`Downvoted barrier ${report.title}`);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-error-container/20 hover:bg-error-container/40 text-error font-bold text-xs transition-colors"
                    >
                      <span>Resolved / Not There (-45m)</span>
                    </button>
                  </div>

                  <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
                    ⏱️ TTL: {Math.max(0, Math.floor((report.ttlSeconds || 0) / 60))}m remaining
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
