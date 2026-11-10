// ==============================================================================
// Interactive Civic Complaint Map Component (ComplaintMap.jsx)
// OpenStreetMap + Leaflet with Multi-Marker Clustering, Filtering & GPS Directions
// ==============================================================================

import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, ExternalLink, Filter, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

// Priority-based colored markers using custom SVG DivIcons
const createMarkerIcon = (priority = 'MEDIUM') => {
  let color = '#0284c7'; // sky-600
  if (priority === 'EMERGENCY' || priority === 'URGENT') color = '#dc2626'; // red-600
  else if (priority === 'HIGH') color = '#ea580c'; // orange-600
  else if (priority === 'LOW') color = '#16a34a'; // green-600

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
    <path fill="${color}" stroke="#ffffff" stroke-width="1.8" d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12z"/>
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

/**
 * Robust coordinate resolver to prevent Latitude / Longitude swapping:
 * - MongoDB GeoJSON stores: [longitude, latitude]
 * - Leaflet expects: [latitude, longitude]
 * - In India: Lat is ~8° to 38° N, Long is ~68° to 98° E
 */
function resolveCoordinates(loc) {
  let lat = null;
  let lng = null;

  if (typeof loc.lat === 'number' && typeof loc.lng === 'number') {
    lat = loc.lat;
    lng = loc.lng;
  } else if (Array.isArray(loc.coordinates) && loc.coordinates.length === 2) {
    const [c0, c1] = loc.coordinates;
    if (c0 > 60 && c0 < 100 && c1 > 5 && c1 < 40) {
      // GeoJSON [longitude, latitude] detected
      lng = c0;
      lat = c1;
    } else if (c0 > 5 && c0 < 40 && c1 > 60 && c1 < 100) {
      // Leaflet [latitude, longitude]
      lat = c0;
      lng = c1;
    } else {
      lat = c0;
      lng = c1;
    }
  }

  // Validate range: lat between -90 and 90, lng between -180 and 180
  if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
    return { lat, lng };
  }
  return null;
}

// Sub-component to re-center the map view smoothly when active markers change
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

const INDIA_DEFAULT_CENTER = [20.5937, 78.9629];

export default function ComplaintMap({
  locations = [],
  height = '440px',
  center = INDIA_DEFAULT_CENTER,
  zoom = 5,
  title = 'Geospatial Incident Map',
  subtitle = 'Real-time GPS distribution of reported civic issues across municipal wards',
  role = 'admin',
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const markerIcons = useMemo(
    () => ({
      EMERGENCY: createMarkerIcon('EMERGENCY'),
      URGENT: createMarkerIcon('EMERGENCY'),
      HIGH: createMarkerIcon('HIGH'),
      MEDIUM: createMarkerIcon('MEDIUM'),
      LOW: createMarkerIcon('LOW'),
    }),
    []
  );

  // Parse and sanitize valid coordinate locations
  const parsedLocations = useMemo(() => {
    return locations
      .map((loc) => {
        const coords = resolveCoordinates(loc);
        if (!coords) return null;
        return {
          ...loc,
          resolvedLat: coords.lat,
          resolvedLng: coords.lng,
        };
      })
      .filter(Boolean);
  }, [locations]);

  // Apply optional interactive status and priority filters
  const filteredLocations = useMemo(() => {
    return parsedLocations.filter((loc) => {
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'OPEN' && ['SUBMITTED', 'UNDER_VERIFICATION', 'VERIFIED'].includes(loc.status)) ||
        (statusFilter === 'IN_PROGRESS' && ['ASSIGNED', 'IN_PROGRESS'].includes(loc.status)) ||
        (statusFilter === 'RESOLVED' && ['RESOLVED', 'CITIZEN_FEEDBACK'].includes(loc.status));

      const matchPriority = priorityFilter === 'ALL' || loc.priority === priorityFilter;

      return matchStatus && matchPriority;
    });
  }, [parsedLocations, statusFilter, priorityFilter]);

  // Calculate dynamic map center: focuses on points or defaults to India center
  const mapCenter = useMemo(() => {
    if (filteredLocations.length > 0) {
      const first = filteredLocations[0];
      return [first.resolvedLat, first.resolvedLng];
    }
    return center;
  }, [filteredLocations, center]);

  const mapZoom = useMemo(() => {
    if (filteredLocations.length === 1) return 14;
    if (filteredLocations.length > 1) return 12;
    return zoom;
  }, [filteredLocations, zoom]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4 transition-colors">
      {/* Map Header with Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold border border-transparent dark:border-indigo-900/50">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-transparent dark:border-slate-700">
                  {filteredLocations.length} Geocoded
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-transparent dark:border-slate-700">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'OPEN', label: 'Unresolved' },
              { id: 'IN_PROGRESS', label: 'On Site' },
              { id: 'RESOLVED', label: 'Closed' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase transition-colors cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold focus:outline-none"
          >
            <option value="ALL" className="dark:bg-slate-900">All Priorities</option>
            <option value="EMERGENCY" className="dark:bg-slate-900">Priority: Red</option>
            <option value="HIGH" className="dark:bg-slate-900">Priority: Orange</option>
            <option value="MEDIUM" className="dark:bg-slate-900">Priority: Sky</option>
            <option value="LOW" className="dark:bg-slate-900">Priority: Green</option>
          </select>
        </div>
      </div>

      {/* Priority Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> Emergency
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> High
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span> Medium
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span> Low
          </span>
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
          Powered by OpenStreetMap India Survey
        </span>
      </div>

      {/* Leaflet Map Canvas */}
      <div
        className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner relative z-10"
        style={{ height }}
      >
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeMapView center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredLocations.map((loc) => {
            const icon = markerIcons[loc.priority] || markerIcons.MEDIUM;
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${loc.resolvedLat},${loc.resolvedLng}`;

            return (
              <Marker
                key={loc.id || loc.complaintId || `${loc.resolvedLat}-${loc.resolvedLng}`}
                position={[loc.resolvedLat, loc.resolvedLng]}
                icon={icon}
              >
                <Popup className="civic-custom-popup">
                  <div className="p-1 min-w-[220px] space-y-2">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1">
                      <span className="font-mono text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                        {loc.complaintId || 'Incident'}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          loc.priority === 'EMERGENCY' || loc.priority === 'URGENT'
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

                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                      <span>Status: <strong className="text-slate-700">{loc.status}</strong></span>
                      {loc.ward && <span className="text-slate-400 truncate max-w-[100px]">{loc.ward}</span>}
                    </div>

                    {/* Action Links */}
                    <div className="pt-1 flex items-center justify-between gap-2">
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-600 hover:text-sky-700 bg-sky-50 px-2 py-1 rounded-md transition-colors"
                      >
                        <Navigation className="w-2.5 h-2.5" />
                        <span>GPS Directions</span>
                      </a>

                      <Link
                        to={
                          role === 'worker'
                            ? `/worker/tasks/${loc.id || loc.complaintId}`
                            : `/admin/complaints`
                        }
                        className="font-bold text-[10px] text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-0.5"
                      >
                        <span>Inspect</span>
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
