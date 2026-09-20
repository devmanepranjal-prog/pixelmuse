'use client';

import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Settings,
  UserCircle,
  Accessibility,
  EyeOff,
  Activity,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  Camera,
  ThumbsUp,
  ThumbsDown,
  Clock,
  X,
  BadgeCheck,
  CheckCircle2,
  AlertOctagon,
  Image as ImageIcon,
  ChevronRight,
  Info
} from 'lucide-react';

const PROFILES = [
  { id: 'wheelchair', name: 'Wheelchair User', icon: Accessibility, needs: 'Step-free, low slope, dropped kerbs' },
  { id: 'visual', name: 'Visually Impaired', icon: EyeOff, needs: 'Tactile paving, audio signals, safe crossings' },
  { id: 'older', name: 'Older Adult', icon: Activity, needs: 'Rest spots, minimal distance, flat terrain' }
];

const INITIAL_MARKERS = [
  {
    id: 1,
    title: "Main Entrance Ramp",
    type: "accessibility", // "accessibility" | "barrier"
    x: 35, y: 40, // percentage coordinates for map placement
    score: 95,
    photoUrl: "https://images.unsplash.com/photo-1571597148560-60b64be60580?auto=format&fit=crop&q=80&w=600",
    photoVerified: true,
    aiChecked: true,
    reporter: "SarahD",
    timeAgo: "2 hours ago",
    confirmations: 14,
    disputes: 0,
    description: "Smooth gradient ramp, clear of debris. Automatic doors are functioning perfectly.",
    location: "Library Main Entrance",
    agePenalty: 0
  },
  {
    id: 2,
    title: "Blocked Footpath",
    type: "barrier",
    x: 60, y: 65,
    score: 82,
    photoUrl: "https://images.unsplash.com/photo-1621531707663-125000570b69?auto=format&fit=crop&q=80&w=600",
    photoVerified: true,
    aiChecked: false,
    reporter: "Mike (Local Guide)",
    timeAgo: "1 day ago",
    confirmations: 8,
    disputes: 1,
    description: "Construction work blocking the entire sidewalk. No ramp down to street level, requires going onto the road.",
    location: "Oak St & 4th Ave",
    agePenalty: 5
  },
  {
    id: 3,
    title: "Broken Elevator",
    type: "barrier",
    x: 75, y: 30,
    score: 35,
    photoUrl: null,
    photoVerified: false,
    aiChecked: false,
    reporter: "Anonymous",
    timeAgo: "3 weeks ago",
    confirmations: 2,
    disputes: 5,
    description: "South wing elevator is out of order. No signage indicating when it will be fixed.",
    location: "Metro Station South",
    agePenalty: 25
  },
  {
    id: 4,
    title: "Tactile Crossing",
    type: "accessibility",
    x: 45, y: 75,
    score: 88,
    photoUrl: "https://images.unsplash.com/photo-1596700816942-019623e1c662?auto=format&fit=crop&q=80&w=600",
    photoVerified: true,
    aiChecked: true,
    reporter: "AlexV",
    timeAgo: "5 days ago",
    confirmations: 11,
    disputes: 0,
    description: "Clear tactile paving and working audio signals at this major intersection.",
    location: "5th Ave Intersection",
    agePenalty: 2
  }
];

const ScoreRing = ({ score, size = 60, strokeWidth = 6 }: { score: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;
 
  let colorClass = "text-red-500";
  if (score >= 80) colorClass = "text-emerald-500";
  else if (score >= 50) colorClass = "text-amber-500";
 
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-gray-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${colorClass} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="font-bold text-gray-900" style={{ fontSize: size * 0.3 }}>{score}</span>
      </div>
    </div>
  );
};

const ScoreBreakdown = ({ marker }: { marker: typeof INITIAL_MARKERS[0] }) => {
  const baseScore = 50;
  const photoBonus = marker.photoVerified ? 20 : 0;
  const aiBonus = marker.aiChecked ? 10 : 0;
  const confirmBonus = Math.min(30, marker.confirmations * 3);
  const disputePenalty = marker.disputes * -10;
 
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">Base System Score</span>
        <span className="font-medium text-gray-900">50</span>
      </div>
     
      {marker.photoVerified && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-emerald-600 flex items-center"><Camera className="w-4 h-4 mr-1"/> Photo Proof</span>
          <span className="font-medium text-emerald-600">+{photoBonus}</span>
        </div>
      )}
     
      {marker.aiChecked && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-emerald-600 flex items-center"><BadgeCheck className="w-4 h-4 mr-1"/> AI Verification</span>
          <span className="font-medium text-emerald-600">+{aiBonus}</span>
        </div>
      )}
     
      {marker.confirmations > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-emerald-600 flex items-center"><ThumbsUp className="w-4 h-4 mr-1"/> Community Confirmed</span>
          <span className="font-medium text-emerald-600">+{confirmBonus}</span>
        </div>
      )}
     
      {marker.disputes > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-red-600 flex items-center"><ThumbsDown className="w-4 h-4 mr-1"/> Community Disputes</span>
          <span className="font-medium text-red-600">{disputePenalty}</span>
        </div>
      )}
     
      {marker.agePenalty > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-amber-600 flex items-center"><Clock className="w-4 h-4 mr-1"/> Data Age Penalty</span>
          <span className="font-medium text-amber-600">-{marker.agePenalty}</span>
        </div>
      )}
     
      <div className="pt-2 border-t border-gray-200 flex justify-between items-center font-bold">
        <span className="text-gray-900">Final Confidence</span>
        <span className={marker.score >= 80 ? 'text-emerald-600' : marker.score >= 50 ? 'text-amber-600' : 'text-red-600'}>
          {marker.score}%
        </span>
      </div>
    </div>
  );
};

export default function CommunityConfidencePage() {
  const [activeProfile, setActiveProfile] = useState('wheelchair');
  const [markers, setMarkers] = useState(INITIAL_MARKERS);
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);
  const [interactedMarkers, setInteractedMarkers] = useState<Set<number>>(new Set());

  const selectedMarker = markers.find(m => m.id === selectedMarkerId);

  const handleInteract = (action: 'confirm' | 'dispute') => {
    if (!selectedMarker || interactedMarkers.has(selectedMarker.id)) return;

    setMarkers(prevMarkers => prevMarkers.map(marker => {
      if (marker.id === selectedMarker.id) {
        let newConf = marker.confirmations;
        let newDisp = marker.disputes;
        let newScore = marker.score;
        let newAgePenalty = 0; // Reset age penalty upon new verification
        let newTimeAgo = "Just now";

        if (action === 'confirm') {
          newConf += 1;
          newScore = Math.min(100, newScore + 5);
        } else {
          newDisp += 1;
          newScore = Math.max(0, newScore - 15);
        }

        return {
          ...marker,
          confirmations: newConf,
          disputes: newDisp,
          score: newScore,
          timeAgo: newTimeAgo,
          agePenalty: newAgePenalty
        };
      }
      return marker;
    }));

    setInteractedMarkers(prev => new Set(prev).add(selectedMarker.id));
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden font-sans">
     
      {/* LEFT SIDEBAR: Routing & Profiles */}
      <div className="w-96 bg-white shadow-xl z-20 flex flex-col">
        {/* Branding */}
        <div className="p-6 bg-blue-600 text-white flex items-center space-x-3">
          <Navigation className="w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-tight">AccessMap</h1>
        </div>

        {/* Profile Selector */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Travel Profile</h2>
          <div className="space-y-3">
            {PROFILES.map(profile => {
              const Icon = profile.icon;
              const isActive = activeProfile === profile.id;
              return (
                <button
                  key={profile.id}
                  onClick={() => setActiveProfile(profile.id)}
                  className={`w-full flex items-start p-3 rounded-xl border-2 text-left transition-all ${
                    isActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-3 ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className={`font-bold ${isActive ? 'text-blue-900' : 'text-gray-700'}`}>{profile.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{profile.needs}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Routing Input Mockup */}
        <div className="p-6 flex-1">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Plan Route</h2>
          <div className="relative space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full border-2 border-blue-500 flex-shrink-0"></div>
              <input type="text" value="City Center Station" readOnly className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700" />
            </div>
            <div className="absolute left-[21px] top-[30px] bottom-[30px] w-px bg-gray-300"></div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 -ml-0.5" />
              <input type="text" value="Public Library" readOnly className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700" />
            </div>
          </div>

          {/* Dynamic Route Info based on Profile */}
          <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <h3 className="font-bold text-emerald-900 flex items-center mb-2">
              <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-600" />
              Personalized Route Found
            </h3>
            <p className="text-sm text-emerald-800 leading-relaxed">
              {activeProfile === 'wheelchair' && "Avoiding 2 sets of stairs and prioritizing step-free entrances."}
              {activeProfile === 'visual' && "Routing via tactile crossings and well-lit pedestrian pathways."}
              {activeProfile === 'older' && "Selecting the flattest terrain with available resting benches along the way."}
            </p>
          </div>
        </div>
      </div>

      {/* MAIN MAP AREA */}
      <div className="flex-1 relative bg-[#e5e3df] overflow-hidden">
        {/* Mock Map Background (CSS Pattern) */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(to right, #d4d2cd 2px, transparent 2px),
              linear-gradient(to bottom, #d4d2cd 2px, transparent 2px)
            `,
            backgroundSize: '100px 100px'
          }}
        />
       
        {/* Mock Map Features (Parks/Water) */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#c4dec4] rounded-[4rem] opacity-60"></div>
        <div className="absolute bottom-20 right-20 w-80 h-40 bg-[#a3c9eb] rounded-full opacity-60 transform -rotate-12"></div>

        {/* Mock Route Path SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
           {activeProfile === 'wheelchair' ? (
              // Wheelchair path (detours around the barrier at 60,65)
              <path d="M 200 400 L 400 400 L 450 200 L 700 200" stroke="#3b82f6" strokeWidth="8" fill="none" strokeDasharray="16" className="opacity-80" strokeLinecap="round" />
           ) : (
              // Direct path
              <path d="M 200 400 L 600 400 L 700 200" stroke="#8b5cf6" strokeWidth="8" fill="none" strokeDasharray="16" className="opacity-80" strokeLinecap="round" />
           )}
        </svg>

        {/* Map Markers */}
        {markers.map(marker => (
          <button
            key={marker.id}
            onClick={() => setSelectedMarkerId(marker.id)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 hover:scale-110 z-10`}
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
          >
            {/* Pulsing effect for selected marker */}
            {selectedMarkerId === marker.id && (
              <span className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-75"></span>
            )}
           
            <div className={`relative p-3 rounded-full shadow-lg ${
              marker.type === 'accessibility'
                ? 'bg-emerald-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
              {marker.type === 'accessibility' ? <CheckCircle2 className="w-6 h-6" /> : <AlertOctagon className="w-6 h-6" />}
            </div>
           
            {/* Tooltip on hover (desktop only) */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white px-3 py-1.5 rounded-lg shadow-xl text-xs font-bold text-gray-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {marker.title}
            </div>
          </button>
        ))}

        {/* Legend */}
        <div className="absolute bottom-6 left-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100 z-10">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Map Legend</h4>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-4 h-4 bg-emerald-500 rounded-full mr-2"></div> Accessible Feature
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div> Reported Barrier
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT PANEL: Report Details (Confidence Score UI) */}
      <div
        className={`w-[450px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-30 transition-transform duration-500 ease-in-out transform flex flex-col ${
          selectedMarkerId ? 'translate-x-0' : 'translate-x-full'
        } absolute right-0 top-0 bottom-0`}
      >
        {selectedMarker && (
          <>
            {/* Panel Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-gray-900">Community Report</span>
              </div>
              <button
                onClick={() => setSelectedMarkerId(null)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Photo Section */}
              <div className="relative h-64 bg-gray-100 w-full flex-shrink-0">
                {selectedMarker.photoUrl ? (
                  <img
                    src={selectedMarker.photoUrl}
                    alt={selectedMarker.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-16 h-16 mb-3 opacity-50" />
                    <span className="font-medium">No photo provided</span>
                  </div>
                )}
               
                {selectedMarker.photoVerified && (
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg flex items-center space-x-2 border border-gray-200">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-bold text-gray-900">Photo Verified</span>
                  </div>
                )}
              </div>

              {/* Core Details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      {selectedMarker.type === 'accessibility' ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-1 rounded">Accessibility Feature</span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-1 rounded">Reported Barrier</span>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-1 rounded flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> {selectedMarker.timeAgo}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedMarker.title}</h2>
                    <p className="text-sm text-gray-500 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" /> {selectedMarker.location}
                    </p>
                  </div>
                  <div className="flex flex-col items-center ml-4">
                    <ScoreRing score={selectedMarker.score} size={68} strokeWidth={5} />
                    <span className="text-[10px] font-bold text-gray-500 uppercase mt-2 text-center leading-tight">Confidence<br/>Score</span>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {selectedMarker.description}
                </p>

                {/* Score Breakdown Section */}
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                    <Info className="w-4 h-4 mr-2 text-blue-600" />
                    Score Calculation
                  </h3>
                  <ScoreBreakdown marker={selectedMarker} />
                </div>

                {/* Interactive Verification Section */}
                <div className="border-t border-gray-100 pt-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Verify this report
                    </h3>
                    <div className="text-xs text-gray-500 font-medium">
                      Reported by <span className="font-bold text-gray-700">{selectedMarker.reporter}</span>
                    </div>
                  </div>
                 
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleInteract('confirm')}
                      disabled={interactedMarkers.has(selectedMarker.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all group ${
                        interactedMarkers.has(selectedMarker.id)
                          ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
                          : 'bg-white border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50'
                      }`}
                    >
                      <ThumbsUp className={`w-6 h-6 mb-2 ${interactedMarkers.has(selectedMarker.id) ? 'text-gray-400' : 'text-emerald-500 group-hover:scale-110 transition-transform'}`} />
                      <span className={`font-bold ${interactedMarkers.has(selectedMarker.id) ? 'text-gray-500' : 'text-emerald-700'}`}>Confirm</span>
                      <span className="text-xs text-gray-500 mt-1">{selectedMarker.confirmations} users</span>
                    </button>
                   
                    <button
                      onClick={() => handleInteract('dispute')}
                      disabled={interactedMarkers.has(selectedMarker.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all group ${
                        interactedMarkers.has(selectedMarker.id)
                          ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
                          : 'bg-white border-red-100 hover:border-red-500 hover:bg-red-50'
                      }`}
                    >
                      <ThumbsDown className={`w-6 h-6 mb-2 ${interactedMarkers.has(selectedMarker.id) ? 'text-gray-400' : 'text-red-500 group-hover:scale-110 transition-transform'}`} />
                      <span className={`font-bold ${interactedMarkers.has(selectedMarker.id) ? 'text-gray-500' : 'text-red-700'}`}>Dispute</span>
                      <span className="text-xs text-gray-500 mt-1">{selectedMarker.disputes} users</span>
                    </button>
                  </div>
                 
                  {interactedMarkers.has(selectedMarker.id) && (
                    <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm font-medium rounded-lg text-center animate-pulse">
                      Thank you! Your feedback instantly updates the routing network for everyone.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
