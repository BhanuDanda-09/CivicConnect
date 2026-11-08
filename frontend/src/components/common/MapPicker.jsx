import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Crosshair, Navigation, Compass } from 'lucide-react';

// Custom high-contrast Leaflet marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Helper component that dynamically updates map viewport when coordinates change
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

function LocationMarker({ position, setPosition, onLocationChange }) {
  useMapEvents({
    click(e) {
      const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
      setPosition(newPos);
      if (onLocationChange) onLocationChange(newPos);
    },
  });

  return position ? (
    <Marker position={[position.lat, position.lng]} icon={customIcon} />
  ) : null;
}

const INDIAN_CITY_PRESETS = [
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
];

export default function MapPicker({
  initialLat = 17.3850,
  initialLng = 78.4867,
  onLocationSelect,
  readOnly = false,
  height = '320px',
}) {
  // Guard coordinate ranges to prevent NaN or swapped lat/lng
  const safeLat = typeof initialLat === 'number' && !isNaN(initialLat) ? initialLat : 17.3850;
  const safeLng = typeof initialLng === 'number' && !isNaN(initialLng) ? initialLng : 78.4867;

  const [position, setPosition] = useState({ lat: safeLat, lng: safeLng });
  const [mapZoom, setMapZoom] = useState(13);
  const [isLocating, setIsLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState('');

  useEffect(() => {
    if (typeof initialLat === 'number' && typeof initialLng === 'number') {
      setPosition({ lat: initialLat, lng: initialLng });
    }
  }, [initialLat, initialLng]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocationNotice('Acquiring high-accuracy GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPosition(newPos);
        setMapZoom(16);
        if (onLocationSelect) onLocationSelect(newPos);
        setIsLocating(false);
        setLocationNotice('GPS coordinates captured successfully!');
        setTimeout(() => setLocationNotice(''), 3000);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        setLocationNotice('Could not retrieve GPS automatically. Please click your exact location on the map.');
        setTimeout(() => setLocationNotice(''), 4000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleCityPreset = (city) => {
    const newPos = { lat: city.lat, lng: city.lng };
    setPosition(newPos);
    setMapZoom(13);
    if (onLocationSelect) onLocationSelect(newPos);
  };

  return (
    <div className="space-y-2">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
        <span className="flex items-center gap-1.5 font-bold text-slate-700">
          <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
          {readOnly
            ? 'Pinned Incident Location (OpenStreetMap India)'
            : 'Click on the map to pin exact problem coordinates:'}
        </span>

        {!readOnly && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Acquiring GPS...' : 'Use My Current GPS'}</span>
            </button>
          </div>
        )}
      </div>

      {locationNotice && (
        <div className="text-[11px] text-sky-700 bg-sky-50 px-3 py-1 rounded-lg border border-sky-100 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span>{locationNotice}</span>
        </div>
      )}

      {/* Quick City Presets (for fast navigation across India) */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-600">Quick City Focus:</span>
          {INDIAN_CITY_PRESETS.map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => handleCityPreset(city)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-colors cursor-pointer ${
                Math.abs(position.lat - city.lat) < 0.1 && Math.abs(position.lng - city.lng) < 0.1
                  ? 'bg-sky-600 text-white border-sky-600 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <div
        className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-10"
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
          {!readOnly ? (
            <LocationMarker
              position={position}
              setPosition={setPosition}
              onLocationChange={onLocationSelect}
            />
          ) : (
            <Marker position={[position.lat, position.lng]} icon={customIcon} />
          )}
        </MapContainer>
      </div>

      {/* Coordinates readout */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-100">
        <span className="flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-slate-400" />
          <span>Latitude: <strong>{Number(position.lat).toFixed(6)}° N</strong></span>
        </span>
        <span>Longitude: <strong>{Number(position.lng).toFixed(6)}° E</strong></span>
      </div>
    </div>
  );
}
