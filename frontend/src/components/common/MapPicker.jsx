import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Crosshair } from 'lucide-react';

// Fix for default Leaflet marker icon with bundlers
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function LocationMarker({ position, setPosition, onLocationChange }) {
  useMapEvents({
    click(e) {
      const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
      setPosition(newPos);
      if (onLocationChange) onLocationChange(newPos);
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} icon={customIcon} /> : null;
}

export default function MapPicker({
  initialLat = 18.5204,
  initialLng = 73.8567,
  onLocationSelect,
  readOnly = false,
  height = '320px'
}) {
  const [position, setPosition] = useState({ lat: initialLat, lng: initialLng });
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition({ lat: initialLat, lng: initialLng });
    }
  }, [initialLat, initialLng]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setPosition(newPos);
        if (onLocationSelect) onLocationSelect(newPos);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        alert('Could not retrieve current location. Using default city center.');
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-1 font-medium">
          <MapPin className="w-3.5 h-3.5 text-sky-600" />
          {readOnly ? 'Pinned Location' : 'Click on the map to pin exact problem coordinates:'}
        </span>
        {!readOnly && (
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{isLocating ? 'Locating...' : 'Use My Current GPS'}</span>
          </button>
        )}
      </div>

      <div
        className="rounded-xl overflow-hidden border border-slate-200 shadow-inner relative z-10"
        style={{ height }}
      >
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={14}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
        <span>Lat: {position.lat.toFixed(6)}</span>
        <span>Lng: {position.lng.toFixed(6)}</span>
      </div>
    </div>
  );
}
