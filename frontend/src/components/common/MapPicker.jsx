// ==============================================================================
// Complete India-Wide Interactive Map Picker (MapPicker.jsx)
// Full Leaflet + OpenStreetMap integration with Pan-India Forward/Reverse Search,
// Draggable Pinning, GPS Geolocation, and Real-Time Structured Address Population
// ==============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Search,
  Crosshair,
  Compass,
  CheckCircle2,
  X,
  Loader2,
  RotateCcw,
  Navigation,
  Globe2,
  Building,
  Check,
} from 'lucide-react';
import { geoAPI } from '../../services/api';
import {
  INDIA_MAP_DEFAULT_CENTER,
  PAN_INDIA_LOCATIONS,
  searchLocalIndianPlaces,
  findNearestIndianLocation,
  formatFullIndianAddress,
} from '../../utils/indianGeoData';

// High-contrast Leaflet marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to dynamically animate map viewport
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && typeof center.lat === 'number' && typeof center.lng === 'number') {
      map.setView([center.lat, center.lng], zoom || map.getZoom(), {
        animate: true,
      });
    }
  }, [center, zoom, map]);
  return null;
}

// Interactive Marker component supporting click and drag
function InteractiveLocationMarker({ position, onMarkerMove, readOnly = false }) {
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      if (!readOnly && onMarkerMove) {
        onMarkerMove({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });

  const eventHandlers = React.useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latlng = marker.getLatLng();
          if (onMarkerMove) {
            onMarkerMove({ lat: latlng.lat, lng: latlng.lng });
          }
        }
      },
    }),
    [onMarkerMove]
  );

  return position && typeof position.lat === 'number' && typeof position.lng === 'number' ? (
    <Marker
      draggable={!readOnly}
      eventHandlers={eventHandlers}
      position={[position.lat, position.lng]}
      icon={customIcon}
      ref={markerRef}
    />
  ) : null;
}

// Major Pan-India Macro Regions for quick geographic jumping
const INDIA_MACRO_REGIONS = [
  { name: 'All India', lat: 20.5937, lng: 78.9629, zoom: 5 },
  { name: 'Hyderabad & Telangana', lat: 17.3850, lng: 78.4867, zoom: 12 },
  { name: 'Vijayawada & AP', lat: 16.5062, lng: 80.6480, zoom: 12 },
  { name: 'Bengaluru & South', lat: 12.9716, lng: 77.5946, zoom: 12 },
  { name: 'Mumbai & West', lat: 19.0760, lng: 72.8777, zoom: 12 },
  { name: 'Delhi & North', lat: 28.6139, lng: 77.2090, zoom: 12 },
  { name: 'Kolkata & East', lat: 22.5726, lng: 88.3639, zoom: 12 },
  { name: 'Jaipur & Rajasthan', lat: 26.9124, lng: 75.7873, zoom: 12 },
  { name: 'Srinagar & J&K', lat: 34.0837, lng: 74.7973, zoom: 12 },
  { name: 'Port Blair & Islands', lat: 11.6234, lng: 92.7265, zoom: 12 },
];

export default function MapPicker({
  initialLat,
  initialLng,
  onLocationSelect,
  readOnly = false,
  height = '380px',
  initialAddress = null,
}) {
  // Use provided coordinates or default to India map center
  const hasInitialCoords = typeof initialLat === 'number' && !isNaN(initialLat) && typeof initialLng === 'number' && !isNaN(initialLng);
  const defaultPos = hasInitialCoords
    ? { lat: initialLat, lng: initialLng }
    : { lat: INDIA_MAP_DEFAULT_CENTER.lat, lng: INDIA_MAP_DEFAULT_CENTER.lng };

  const [position, setPosition] = useState(defaultPos);
  const [mapZoom, setMapZoom] = useState(hasInitialCoords ? 14 : INDIA_MAP_DEFAULT_CENTER.zoom);

  // Address and status tracking
  const [addressDetails, setAddressDetails] = useState(initialAddress || null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Search box state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchWrapperRef = useRef(null);

  // GPS Locate state
  const [isLocating, setIsLocating] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync position if initialLat/initialLng props change from outside
  useEffect(() => {
    if (typeof initialLat === 'number' && typeof initialLng === 'number' && !isNaN(initialLat) && !isNaN(initialLng)) {
      setPosition({ lat: initialLat, lng: initialLng });
    }
  }, [initialLat, initialLng]);

  // Execute reverse geocoding for coordinates
  const triggerReverseGeocode = useCallback(
    async (lat, lng, explicitAddress = null) => {
      setIsReverseGeocoding(true);
      setIsConfirmed(false);

      if (explicitAddress) {
        setAddressDetails(explicitAddress);
        if (onLocationSelect) {
          onLocationSelect({
            lat,
            lng,
            ...explicitAddress,
          });
        }
        setIsReverseGeocoding(false);
        return;
      }

      try {
        const res = await geoAPI.reverse(lat, lng);
        if (res.data?.success && res.data.data) {
          const d = res.data.data;
          const resolvedAddress = {
            country: 'India',
            state: d.address?.state || '',
            district: d.address?.district || '',
            city: d.address?.city || '',
            street: d.address?.street || '',
            pincode: d.address?.pincode || '',
            formattedAddress: d.address?.formattedAddress || d.displayName || '',
          };
          setAddressDetails(resolvedAddress);
          if (onLocationSelect) {
            onLocationSelect({
              lat,
              lng,
              ...resolvedAddress,
            });
          }
          setIsReverseGeocoding(false);
          return;
        }
      } catch (err) {
        console.warn('Reverse geocoding notice; using offline Indian geo reference:', err.message);
      }

      // Offline fallback: find nearest Indian city/district
      const nearest = findNearestIndianLocation(lat, lng);
      const fallbackAddress = {
        country: 'India',
        state: nearest.state,
        district: nearest.district,
        city: nearest.name,
        street: `Near ${nearest.name}`,
        pincode: nearest.pincode || '',
        formattedAddress: `${nearest.name}, ${nearest.district}, ${nearest.state}, India`,
      };
      setAddressDetails(fallbackAddress);
      if (onLocationSelect) {
        onLocationSelect({
          lat,
          lng,
          ...fallbackAddress,
        });
      }
      setIsReverseGeocoding(false);
    },
    [onLocationSelect]
  );

  // Handles marker movement (click or drag)
  const handleMarkerMove = useCallback(
    (newPos) => {
      setPosition(newPos);
      triggerReverseGeocode(newPos.lat, newPos.lng);
    },
    [triggerReverseGeocode]
  );

  // Search input change handler with 300ms debounce
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!val || val.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setIsDropdownOpen(false);
      return;
    }

    setIsSearching(true);
    setIsDropdownOpen(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await geoAPI.search(val.trim(), 8);
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setSearchResults(res.data.data);
          setIsSearching(false);
          return;
        }
      } catch (err) {
        console.warn('Backend geocoding search notice; trying local database:', err.message);
      }

      // Local offline fallback
      const localMatches = searchLocalIndianPlaces(val.trim());
      setSearchResults(localMatches);
      setIsSearching(false);
    }, 300);
  };

  // Select place from search suggestions
  const handleSelectPlace = (place) => {
    const newPos = { lat: place.latitude, lng: place.longitude };
    setPosition(newPos);
    setMapZoom(15);
    setSearchQuery(place.name || place.displayName);
    setIsDropdownOpen(false);

    triggerReverseGeocode(place.latitude, place.longitude, place.address);
  };

  // GPS Location button
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatusNotice('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setStatusNotice('Acquiring high-accuracy GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPosition(newPos);
        setMapZoom(16);
        setIsLocating(false);
        setStatusNotice('GPS coordinates captured!');
        triggerReverseGeocode(newPos.lat, newPos.lng);
        setTimeout(() => setStatusNotice(''), 3000);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        setStatusNotice('Could not acquire GPS automatically. Please click or search your location.');
        setTimeout(() => setStatusNotice(''), 4000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Jump to predefined Indian region
  const handleRegionJump = (region) => {
    const newPos = { lat: region.lat, lng: region.lng };
    setPosition(newPos);
    setMapZoom(region.zoom);
    if (!readOnly && region.name !== 'All India') {
      handleMarkerMove(newPos);
    }
  };

  // Confirm selected location
  const handleConfirmLocation = () => {
    setIsConfirmed(true);
    setStatusNotice('Location confirmed successfully!');
    setTimeout(() => setStatusNotice(''), 3000);
  };

  // Clear selection back to full India view
  const handleClearSelection = () => {
    const allIndia = { lat: INDIA_MAP_DEFAULT_CENTER.lat, lng: INDIA_MAP_DEFAULT_CENTER.lng };
    setPosition(allIndia);
    setMapZoom(5);
    setAddressDetails(null);
    setSearchQuery('');
    setIsConfirmed(false);
    if (onLocationSelect) {
      onLocationSelect(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* 1. Prominent Search Box directly above the map (Interactive Mode Only) */}
      {!readOnly && (
        <div ref={searchWrapperRef} className="relative z-30">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => {
                if (searchResults.length > 0) setIsDropdownOpen(true);
              }}
              placeholder="Search anywhere in India (e.g. Vijayawada, Koramangala Bengaluru, Jaipur, 500001, MG Road Pune)..."
              className="w-full pl-10 pr-10 py-2.5 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-xs"
            />
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-sky-600 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setIsDropdownOpen(false);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {/* Search Suggestions Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 z-50">
              {searchResults.length === 0 ? (
                <div className="py-4 px-4 text-center text-xs text-slate-400">
                  {isSearching ? 'Searching Indian places...' : 'No locations found. Try city, district, village, or PIN code.'}
                </div>
              ) : (
                searchResults.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => handleSelectPlace(result)}
                    className="w-full px-4 py-2.5 text-left text-xs hover:bg-sky-50/70 dark:hover:bg-slate-800 transition-colors flex items-start gap-2.5 cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {result.name || result.address?.city || 'Location'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {result.displayName}
                      </p>
                    </div>
                    {result.type && (
                      <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full shrink-0">
                        {result.type}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. Controls and Region Jump Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
          <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
          {readOnly
            ? 'Pinned Incident Coordinates (OpenStreetMap India)'
            : 'Click anywhere in India or drag the pin to set the exact spot:'}
        </span>

        {!readOnly && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 dark:text-sky-300 hover:text-sky-800 dark:hover:text-sky-200 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Acquiring GPS...' : 'Use My Current GPS'}</span>
            </button>

            {addressDetails && (
              <button
                type="button"
                onClick={handleConfirmLocation}
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                  isConfirmed
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isConfirmed ? 'Location Confirmed' : 'Confirm Location'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleClearSelection}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
              title="Reset view to all India"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>

      {statusNotice && (
        <div className="text-[11px] text-sky-800 dark:text-sky-200 bg-sky-50 dark:bg-sky-950/60 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* 3. Quick Indian Macro-Region Jump Pills */}
      {!readOnly && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
            <Globe2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Region Focus:</span>
          </span>
          {INDIA_MACRO_REGIONS.map((region) => (
            <button
              key={region.name}
              type="button"
              onClick={() => handleRegionJump(region)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border whitespace-nowrap transition-colors cursor-pointer ${
                Math.abs(position.lat - region.lat) < 0.2 && Math.abs(position.lng - region.lng) < 0.2
                  ? 'bg-sky-600 text-white border-sky-600 font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {region.name}
            </button>
          ))}
        </div>
      )}

      {/* 4. Leaflet Map Container */}
      <div
        className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner relative z-10"
        style={{ height }}
      >
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={mapZoom}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeMapView center={position} zoom={mapZoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Government of India Survey'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <InteractiveLocationMarker
            position={position}
            onMarkerMove={handleMarkerMove}
            readOnly={readOnly}
          />
        </MapContainer>

        {isReverseGeocoding && (
          <div className="absolute top-3 right-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
            <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin" />
            <span>Resolving Indian address...</span>
          </div>
        )}
      </div>

      {/* 5. Address Details & Coordinates Banner */}
      <div className="bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-start gap-2 min-w-0">
            <Building className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-bold text-slate-900 dark:text-white truncate">
                {addressDetails?.formattedAddress || addressDetails?.city || 'Pinned Location on Map'}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px]">
                {addressDetails?.state && (
                  <span className="bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded-md font-semibold">
                    State: {addressDetails.state}
                  </span>
                )}
                {addressDetails?.district && (
                  <span className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-md font-semibold">
                    District: {addressDetails.district}
                  </span>
                )}
                {addressDetails?.city && (
                  <span className="bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-md font-semibold">
                    City/Town: {addressDetails.city}
                  </span>
                )}
                {addressDetails?.pincode && (
                  <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md font-semibold font-mono">
                    PIN: {addressDetails.pincode}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Latitude and Longitude readout */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-200/60 dark:border-slate-800">
          <span className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <span>Lat: <strong className="text-slate-800 dark:text-slate-200">{Number(position.lat).toFixed(6)}° N</strong></span>
          </span>
          <span>Lng: <strong className="text-slate-800 dark:text-slate-200">{Number(position.lng).toFixed(6)}° E</strong></span>
        </div>
      </div>
    </div>
  );
}
