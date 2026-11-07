// ==============================================================================
// Interactive Civic Complaint Map Component (ComplaintMap.jsx)
// OpenStreetMap + Leaflet with Multi-Marker Clustering & Priority Visuals
// ==============================================================================

import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, AlertCircle, Clock, ShieldCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

// Priority-based colored markers using SVG data URIs
const createMarkerIcon = (priority = 'MEDIUM') => {
  let color = '#0284c7'; // sky-600
  if (priority === 'EMERGENCY') color = '#dc2626'; // red-600
  else if (priority === 'HIGH') color = '#ea580c'; // orange-600
  else if (priority === 'LOW') color = '#16a34a'; // green-600

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
    <path fill="${color}" stroke="#ffffff" stroke-width="1.5" d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12z"/>
    <circle cx="12" cy="12" r="5" fill="#ffffff"/>
  </svg>`;

  return new L.DivIcon({
    className: 'custom-map-pin',
    html: svg,
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -38],
  });
};

const defaultCenter = [18.5204, 73.8567]; // City Central Coordinates

export default function ComplaintMap({
  locations = [],
  height = '420px',
  center = defaultCenter,
  zoom = 13,
  title = 'Geospatial Incident Map',
  subtitle = 'Real-time GPS distribution of reported civic issues across municipal wards',
  role = 'admin',
}) {
  const markerIcons = useMemo(
    () => ({
      EMERGENCY: createMarkerIcon('EMERGENCY'),
      HIGH: createMarkerIcon('HIGH'),
      MEDIUM: createMarkerIcon('MEDIUM'),
      LOW: createMarkerIcon('LOW'),
    }),
    []
  );

  const validLocations = useMemo(() => {
    return locations.filter((loc) => {
      const lat = loc.lat ?? (Array.isArray(loc.coordinates) ? loc.coordinates[0] : null);
      const lng = loc.lng ?? (Array.isArray(loc.coordinates) ? loc.coordinates[1] : null);
      return typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng);
    });
  }, [locations]);

  const mapCenter = useMemo(() => {
    if (validLocations.length > 0) {
      const first = validLocations[0];
      const lat = first.lat ?? first.coordinates[0];
      const lng = first.lng ?? first.coordinates[1];
      return [lat, lng];
    }
    return center;
  }, [validLocations, center]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
              {validLocations.length} Geocoded
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Priority Legend */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> Emergency
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> High
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span> Low
          </span>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div
        className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-10"
        style={{ height }}
      >
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {validLocations.map((loc) => {
            const lat = loc.lat ?? loc.coordinates[0];
            const lng = loc.lng ?? loc.coordinates[1];
            const icon = markerIcons[loc.priority] || markerIcons.MEDIUM;

            return (
              <Marker key={loc.id || loc.complaintId} position={[lat, lng]} icon={icon}>
                <Popup className="civic-custom-popup">
                  <div className="p-1 min-w-[200px] space-y-1.5">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1">
                      <span className="font-mono text-[10px] font-bold text-slate-500">
                        {loc.complaintId}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          loc.priority === 'EMERGENCY'
                            ? 'bg-red-100 text-red-700'
                            : loc.priority === 'HIGH'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-sky-100 text-sky-700'
                        }`}
                      >
                        {loc.priority}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {loc.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {loc.address || loc.location || loc.ward}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-600">
                      <span className="font-medium text-slate-700">Status: {loc.status}</span>
                      <Link
                        to={
                          role === 'worker'
                            ? `/worker/tasks`
                            : `/admin/complaints`
                        }
                        className="font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-0.5"
                      >
                        <span>View</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
