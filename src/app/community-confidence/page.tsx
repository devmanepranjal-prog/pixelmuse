'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAccessibility, BarrierReport } from '@/context/AccessibilityContext';
import { computeBarrierConfidence, ConfidenceResult } from '@/lib/confidence';
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
  Camera,
  Sparkles,
  Info,
  X,
  ExternalLink
} from 'lucide-react';

export default function CommunityConfidencePage() {
  const { barrierReports, upvoteReport, downvoteReport, speakText } = useAccessibility();
  const [filterTag, setFilterTag] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhotoProof, setSelectedPhotoProof] = useState<{
    report: BarrierReport;
    trust: ConfidenceResult;
  } | null>(null);
  const [expandedBreakdownId, setExpandedBreakdownId] = useState<string | null>(null);

  const filterOptions = [
    { id: 'all', label: 'All Community Audits' },
    { id: 'photo', label: '📷 Photo-Verified Only' },
    { id: 'elevator', label: 'Elevator Outages' },
    { id: 'verified', label: 'High Trust Score (>85%)' },
    { id: 'critical', label: 'Critical Barriers' }
  ];

  const filteredReports = barrierReports.filter(report => {
    if (report.isExpired || report.status === 'Expired') return false;
    if (filterTag === 'photo' && !report.photoAttached && !report.photoUrl) return false;
    if (filterTag === 'elevator' && !report.category.toLowerCase().includes('elevator')) return false;
    if (filterTag === 'critical' && report.severity !== 'critical') return false;
    
    const trust = computeBarrierConfidence(report);
    if (filterTag === 'verified' && trust.score < 85) return false;

    if (
      searchQuery &&
      !report.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !report.location.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(report.source && report.source.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }
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
                Verified crowd-audited places & community trust scores backed by photo proof.
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
                Every ramp, lift & barrier verified via source authority, recency & photo proof.
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
              <div className="text-xs font-bold text-on-surface-variant">Photo Verified</div>
              <div className="text-xl font-extrabold text-secondary">96%</div>
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
              placeholder="Search reports, locations, or verification source..."
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
            const trust = computeBarrierConfidence(report);
            const hasPhoto = Boolean(report.photoAttached || report.photoUrl);
            const isBreakdownExpanded = expandedBreakdownId === report.id;

            return (
              <div
                key={report.id}
                className={`p-6 rounded-3xl bg-surface-container-lowest border transition-all shadow-xs flex flex-col gap-4 ${
                  isCritical ? 'border-tertiary/60 shadow-md' : 'border-outline-variant/40'
                }`}
              >
                {/* Top Badge Strip: Category, Date, Status, Trust Score, Photo & AI Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
                  <div className="flex items-center flex-wrap gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                        isCritical
                          ? 'bg-tertiary/20 text-tertiary'
                          : 'bg-secondary-container text-on-secondary-container'
                      }`}
                    >
                      {report.category}
                    </span>

                    {/* Accessibility Confidence Score Pill */}
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedBreakdownId(isBreakdownExpanded ? null : report.id);
                        speakText(`${report.title} confidence score: ${trust.score} percent, ${trust.tier}`);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border transition-transform active:scale-95 ${trust.badgeClass}`}
                      title="Click to view 4-pillar trust breakdown"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{trust.score}% Trust Score</span>
                    </button>

                    {/* Photo Attached Badge */}
                    {hasPhoto && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                        <Camera className="w-3 h-3" />
                        <span>Photo Proof</span>
                      </span>
                    )}

                    {/* AI Verified Badge (Optional bonus) */}
                    {report.aiVerification && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                        <Sparkles className="w-3 h-3 text-purple-500" />
                        <span>AI Check: {report.aiVerification.confidence}%</span>
                      </span>
                    )}

                    <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1 ml-auto sm:ml-0">
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
                  
                  {/* Location & Authority Source Stamp */}
                  <div className="flex items-center flex-wrap gap-2 text-xs font-bold mt-1 text-on-surface-variant">
                    <span className="text-primary">📍 {report.location}</span>
                    <span>•</span>
                    <span className="text-secondary font-extrabold">🏛️ {report.source || 'Community Navigator'}</span>
                    {hasPhoto && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-700 dark:text-emerald-400">📷 Visual proof verified</span>
                      </>
                    )}
                  </div>

                  <p className="text-sm text-on-surface-variant font-medium mt-2 leading-relaxed">
                    {report.description}
                  </p>
                </div>

                {/* Photo Proof Preview Card with Instant Inspection */}
                {hasPhoto && report.photoUrl && (
                  <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => setSelectedPhotoProof({ report, trust })}
                        className="relative w-20 h-14 rounded-xl overflow-hidden cursor-pointer group flex-shrink-0 border border-outline-variant/40 shadow-xs"
                      >
                        <img
                          src={report.photoUrl}
                          alt={`Photo proof for ${report.title}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                        <div className="absolute bottom-1 right-1 px-1 rounded bg-black/70 text-[9px] font-bold text-white">
                          HD
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                          <Camera className="w-3.5 h-3.5 text-primary" />
                          <span>Photo-Verified Report Proof</span>
                        </div>
                        {report.aiVerification && (
                          <div className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 mt-0.5 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-500" />
                            <span>AI Check: {report.aiVerification.label}</span>
                          </div>
                        )}
                        <span className="text-[10px] text-on-surface-variant">
                          Audited by {report.source || 'Community Navigator'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedPhotoProof({ report, trust })}
                      className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary font-bold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-center"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Full Photo Proof</span>
                    </button>
                  </div>
                )}

                {/* Expandable Trust Breakdown Drawer */}
                {isBreakdownExpanded && (
                  <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                      <span className="text-xs font-black text-on-surface flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-secondary" />
                        Confidence Score Breakdown ({trust.score}/100)
                      </span>
                      <span className="text-[11px] font-bold text-secondary">{trust.tier}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {trust.breakdown.map((item, idx) => (
                        <div key={idx} className="p-2 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
                          <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                            <span>{item.label}</span>
                            <span className="text-primary font-mono">{item.value}/{item.maxValue}</span>
                          </div>
                          <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Upvote & Downvote */}
                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        upvoteReport(report.id);
                        speakText(`Helpful upvote registered for ${report.title}. Confidence score updated.`);
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

      {/* Photo Proof & Trust Breakdown Detail Modal */}
      {selectedPhotoProof && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/40 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                <h3 className="text-base font-extrabold text-on-surface">Photo-Verified Report Evidence</h3>
              </div>
              <button
                onClick={() => setSelectedPhotoProof(null)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant font-bold text-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex flex-col gap-4">
              
              {/* Photo Display */}
              <div className="w-full rounded-2xl overflow-hidden border border-outline-variant/30 shadow-md bg-slate-900">
                <img
                  src={selectedPhotoProof.report.photoUrl}
                  alt={selectedPhotoProof.report.title}
                  className="w-full h-auto max-h-[280px] object-contain"
                />
              </div>

              {/* Title & Metadata */}
              <div>
                <h4 className="text-lg font-black text-on-surface">{selectedPhotoProof.report.title}</h4>
                <div className="text-xs font-bold text-primary mt-0.5">📍 {selectedPhotoProof.report.location}</div>
                <p className="text-xs text-on-surface-variant mt-1.5 font-medium leading-relaxed">
                  {selectedPhotoProof.report.description}
                </p>
              </div>

              {/* AI Verification Bonus Card */}
              {selectedPhotoProof.report.aiVerification && (
                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      AI Computer Vision Analysis
                    </span>
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-purple-600 text-white">
                      {selectedPhotoProof.report.aiVerification.confidence}% Match
                    </span>
                  </div>
                  <div className="text-xs font-bold text-on-surface">
                    {selectedPhotoProof.report.aiVerification.label}
                  </div>
                  {selectedPhotoProof.report.aiVerification.details && (
                    <p className="text-[11px] text-on-surface-variant font-medium">
                      {selectedPhotoProof.report.aiVerification.details}
                    </p>
                  )}
                </div>
              )}

              {/* Trust Score 4-Pillar Breakdown */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                  <span className="text-xs font-black text-on-surface uppercase tracking-wider">
                    Trust Score Breakdown
                  </span>
                  <span className="text-sm font-black text-primary">
                    {selectedPhotoProof.trust.score}% Trust
                  </span>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  {selectedPhotoProof.trust.breakdown.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-0.5">
                      <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                        <span>{item.label}</span>
                        <span className="font-mono text-primary">{item.value} / {item.maxValue} pts</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full"
                          style={{ width: `${Math.min(100, (item.value / item.maxValue) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-on-surface-variant">{item.description}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-outline-variant/20 flex justify-end">
              <button
                onClick={() => setSelectedPhotoProof(null)}
                className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs"
              >
                Close Proof Viewer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
