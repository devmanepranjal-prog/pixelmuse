'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import {
  Map as MapIcon,
  Globe,
  Navigation,
  Search,
  Volume2,
  VolumeX,
  Camera,
  AlertTriangle,
} from 'lucide-react';
import { useAccessibility } from '@/context/AccessibilityContext';

export interface LiveLeafletMapProps {
  center: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  zoom?: number;
  accuracy?: number;
  routeGeojson?: any; // Leaving this for backwards compatibility, but we might have encodedPolyline instead later
  navigationStep?: any;
  isNavigating?: boolean;
  onExitNavigation?: () => void;
  totalDistanceKm?: number;
  totalMinutes?: number;
  totalSteps?: number;
  destName?: string;
  roadName?: string;
  originalRouteGeojson?: any;
  originalRoutePath?: Array<{ lat: number; lng: number }>;
  barrierLocation?: { lat: number; lng: number; title?: string };
  isRerouted?: boolean;
  encodedPolyline?: string;
}

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

type MapTypeOption = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';

export default function LiveLeafletMap(props: LiveLeafletMapProps) {
  const [mapType, setMapType] = useState<MapTypeOption>('roadmap');
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || '';

  const { speakText, isVoicePromptActive, toggleVoicePrompt } = useAccessibility();
  const [bearing, setBearing] = useState<number>(0);
  const mapRef = useRef<google.maps.Map | null>(null);
  const prevCenterRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (props.center && prevCenterRef.current && window.google) {
      const prev = prevCenterRef.current;
      const curr = props.center;
      if (prev.lat !== curr.lat || prev.lng !== curr.lng) {
        // Only update bearing if we actually moved a tiny bit to avoid jitter
        if (Math.abs(prev.lat - curr.lat) > 0.00001 || Math.abs(prev.lng - curr.lng) > 0.00001) {
          const h = google.maps.geometry.spherical.computeHeading(prev, curr);
          setBearing(h);
        }
      }
    }
    prevCenterRef.current = props.center;
  }, [props.center]);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: googleApiKey,
    libraries,
  });

  const handleRecentre = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.panTo(props.center);
      mapRef.current.setZoom(18);
      if (props.isNavigating) {
        mapRef.current.setHeading(bearing);
        mapRef.current.setTilt(60);
      } else {
        mapRef.current.setTilt(0);
        mapRef.current.setHeading(0);
      }
      speakText('Re-centred on your live location');
    }
  }, [props.center, props.isNavigating, bearing, speakText]);

  useEffect(() => {
    if (mapRef.current && props.isNavigating) {
      mapRef.current.setHeading(bearing);
      mapRef.current.setTilt(60);
      mapRef.current.panTo(props.center);
    }
  }, [props.center, props.isNavigating, bearing]);

  // Decode routeGeojson into a path of {lat, lng} objects if needed
  const routePath = React.useMemo(() => {
    if (props.encodedPolyline && window.google) {
      const decoded = google.maps.geometry.encoding.decodePath(props.encodedPolyline);
      return decoded.map(p => ({ lat: p.lat(), lng: p.lng() }));
    }
    
    if (!props.routeGeojson) return [];
    try {
      if (props.routeGeojson.geometry && props.routeGeojson.geometry.type === 'LineString') {
        const coords = props.routeGeojson.geometry.coordinates;
        return coords.map((c: any) => ({ lat: c[1], lng: c[0] }));
      } else if (props.routeGeojson.type === 'FeatureCollection' && props.routeGeojson.features.length > 0) {
        const firstFeature = props.routeGeojson.features[0];
        if (firstFeature.geometry && firstFeature.geometry.type === 'LineString') {
          return firstFeature.geometry.coordinates.map((c: any) => ({ lat: c[1], lng: c[0] }));
        }
      }
    } catch (e) {
      console.error('Failed to parse routeGeojson', e);
    }
    return [];
  }, [props.routeGeojson, props.encodedPolyline, isLoaded]);

  const originalRoutePath = React.useMemo(() => {
    if (props.originalRoutePath) return props.originalRoutePath;
    if (!props.originalRouteGeojson) return undefined;
    
    // If it's a string, it's an encoded polyline
    if (typeof props.originalRouteGeojson === 'string' && window.google) {
      try {
        const decoded = google.maps.geometry.encoding.decodePath(props.originalRouteGeojson);
        return decoded.map(p => ({ lat: p.lat(), lng: p.lng() }));
      } catch (e) {
        console.error('Failed to decode originalRouteGeojson polyline', e);
      }
    }

    try {
      if (props.originalRouteGeojson.geometry && props.originalRouteGeojson.geometry.type === 'LineString') {
        const coords = props.originalRouteGeojson.geometry.coordinates;
        return coords.map((c: any) => ({ lat: c[1], lng: c[0] }));
      } else if (props.originalRouteGeojson.type === 'FeatureCollection' && props.originalRouteGeojson.features.length > 0) {
        const firstFeature = props.originalRouteGeojson.features[0];
        if (firstFeature.geometry && firstFeature.geometry.type === 'LineString') {
          return firstFeature.geometry.coordinates.map((c: any) => ({ lat: c[1], lng: c[0] }));
        }
      }
    } catch (e) {
      console.error('Failed to parse originalRouteGeojson', e);
    }
    return undefined;
  }, [props.originalRoutePath, props.originalRouteGeojson]);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    // Fit bounds initially
    if (routePath && routePath.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      routePath.forEach(p => bounds.extend(p));
      if (props.barrierLocation) bounds.extend(props.barrierLocation);
      if (props.center) bounds.extend(props.center);
      if (props.destination) bounds.extend(props.destination);
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    } else if (props.center && props.destination) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(props.center);
      bounds.extend(props.destination);
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    }
  }, [routePath, props.barrierLocation, props.center, props.destination]);

  if (!googleApiKey) {
    return (
      <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-red-50 text-red-900 p-6 rounded-3xl border border-red-200">
        <AlertTriangle className="w-12 h-12 mb-4 text-red-500" />
        <h3 className="text-lg font-bold">Google Maps Configuration Missing</h3>
        <p className="text-sm mt-2 text-center">
          Missing <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>.
          <br/>Please add it to your <code>.env.local</code> file.
        </p>
      </div>
    );
  }

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-slate-100 rounded-3xl">Loading Maps...</div>;
  }

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-slate-100 select-none">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={props.center}
        zoom={props.zoom || 16}
        options={{
          mapId: mapId || undefined,
          mapTypeId: mapType,
          disableDefaultUI: true,
          tilt: props.isNavigating ? 60 : 0,
          heading: props.isNavigating ? bearing : 0,
        }}
        onLoad={onLoad}
      >
        {/* Destination Marker */}
        {props.destination && (
          <Marker position={props.destination} />
        )}

        {/* User Marker (Blue dot or directional chevron) */}
        {props.center && (
          <Marker 
            position={props.center}
            icon={{
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: '#1d4ed8',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#ffffff',
              rotation: bearing,
            }}
            zIndex={1000}
          />
        )}

        {/* Barrier Marker */}
        {props.barrierLocation && (
          <Marker
            position={props.barrierLocation}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#dc2626"/><path d="M15 9L9 15M9 9l6 6" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>'),
              scaledSize: new google.maps.Size(32, 32),
              anchor: new google.maps.Point(16, 16),
            }}
            zIndex={1500}
          />
        )}

        {/* Original/Blocked Route (Red dashed) */}
        {(props.isRerouted || (originalRoutePath && originalRoutePath.length > 0)) && originalRoutePath && (
          <Polyline
            path={originalRoutePath}
            options={{
              strokeColor: '#ef4444',
              strokeOpacity: 0.85,
              strokeWeight: 5,
              icons: [{
                icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 },
                offset: '0',
                repeat: '20px'
              }],
            }}
          />
        )}

        {/* Active Route */}
        {routePath && routePath.length > 0 && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: props.isRerouted ? '#10b981' : '#1d4ed8',
              strokeOpacity: 0,
              strokeWeight: 0,
              icons: [{
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  fillOpacity: 1,
                  fillColor: props.isRerouted ? '#10b981' : '#1d4ed8',
                  strokeOpacity: 0,
                  scale: 4
                },
                offset: '0',
                repeat: '15px'
              }],
            }}
          />
        )}
      </GoogleMap>

      {/* Floating Style Picker (Top Left) */}
      <div className="absolute top-4 left-4 z-[99] p-1 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-md flex items-center gap-1">
        <button
          type="button"
          onClick={() => setMapType('roadmap')}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 transition-all ${
            mapType === 'roadmap' ? 'bg-[#1d4ed8] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapIcon className="w-3 h-3" />
          <span>Street</span>
        </button>

        <button
          type="button"
          onClick={() => setMapType('satellite')}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 transition-all ${
            mapType === 'hybrid' || mapType === 'satellite' ? 'bg-[#1d4ed8] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-3 h-3" />
          <span>Satellite</span>
        </button>
      </div>

      {/* Floating Map Action Buttons (Compass, Search, Voice, Scanner) */}
      <div className="absolute right-4 top-4 z-[100] flex flex-col gap-2.5 items-center">
        {/* North Indicator / Compass */}
        <button
          type="button"
          onClick={() => {
            setBearing(0);
            speakText('Map aligned to True North');
          }}
          className="w-11 h-11 rounded-full bg-white text-slate-800 shadow-xl border border-slate-200 flex flex-col items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
          title="Compass North"
        >
          <span className="text-[10px] font-black text-red-600 leading-none">▲</span>
          <span className="text-xs font-black text-slate-800 leading-none mt-0.5">N</span>
        </button>

        {/* Search button */}
        <button
          type="button"
          onClick={() => speakText('Opening search for accessible points along your route')}
          className="w-11 h-11 rounded-full bg-white text-slate-700 shadow-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
          title="Search along route"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Mute / Unmute Voice */}
        <button
          type="button"
          onClick={() => {
            toggleVoicePrompt();
            speakText(isVoicePromptActive ? 'Voice guidance muted' : 'Voice guidance enabled');
          }}
          className={`w-11 h-11 rounded-full shadow-xl border flex items-center justify-center transition-colors cursor-pointer ${
            isVoicePromptActive
              ? 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
              : 'bg-slate-800 text-white border-slate-900'
          }`}
          title="Toggle Voice Guidance"
        >
          {isVoicePromptActive ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Surroundings Scanner Button */}
        <button
          type="button"
          onClick={() => speakText('Scanning surroundings camera for obstacles and tactile paving')}
          className="w-11 h-11 rounded-full bg-white text-slate-700 shadow-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
          title="Scan surroundings camera"
        >
          <Camera className="w-4 h-4 text-primary" />
        </button>
      </div>

      {/* Floating Re-centre Button (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-[100]">
        <button
          type="button"
          onClick={handleRecentre}
          className="px-4 py-2.5 rounded-full bg-white text-[#1d4ed8] font-black text-xs shadow-2xl border border-slate-200 flex items-center gap-2 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Navigation className="w-4 h-4 text-[#1d4ed8] fill-current" />
          <span>Re-centre</span>
        </button>
      </div>
    </div>
  );
}
