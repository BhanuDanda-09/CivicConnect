// ==============================================================================
// Geo Controller (geoController.js)
// Real-time India-Wide Forward & Reverse Geocoding via OpenStreetMap Nominatim
// with in-memory caching, rate-limiting compliance, and resilient offline fallback
// ==============================================================================

const https = require('https');

// In-memory cache to respect OSM Nominatim rate limits (TTL: 1 hour)
const searchCache = new Map();
const reverseCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000;

// Curated India fallback database for instant offline resolution & high-speed matching
const INDIA_OFFLINE_DATABASE = [
  // Telangana
  { name: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', lat: 17.3850, lng: 78.4867, type: 'city', pincode: '500001' },
  { name: 'Warangal', state: 'Telangana', district: 'Warangal', lat: 17.9689, lng: 79.5941, type: 'city', pincode: '506002' },
  { name: 'Karimnagar', state: 'Telangana', district: 'Karimnagar', lat: 18.4386, lng: 79.1288, type: 'city', pincode: '505001' },
  { name: 'Nizamabad', state: 'Telangana', district: 'Nizamabad', lat: 18.6725, lng: 78.0941, type: 'city', pincode: '503001' },
  { name: 'Khammam', state: 'Telangana', district: 'Khammam', lat: 17.2473, lng: 80.1514, type: 'city', pincode: '507001' },
  // Andhra Pradesh
  { name: 'Vijayawada', state: 'Andhra Pradesh', district: 'NTR (Vijayawada)', lat: 16.5062, lng: 80.6480, type: 'city', pincode: '520001' },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', district: 'Visakhapatnam', lat: 17.6868, lng: 83.2185, type: 'city', pincode: '530001' },
  { name: 'Guntur', state: 'Andhra Pradesh', district: 'Guntur', lat: 16.3067, lng: 80.4365, type: 'city', pincode: '522002' },
  { name: 'Tirupati', state: 'Andhra Pradesh', district: 'Tirupati', lat: 13.6288, lng: 79.4192, type: 'city', pincode: '517501' },
  { name: 'Kurnool', state: 'Andhra Pradesh', district: 'Kurnool', lat: 15.8281, lng: 78.0373, type: 'city', pincode: '518001' },
  // Karnataka
  { name: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', lat: 12.9716, lng: 77.5946, type: 'city', pincode: '560001' },
  { name: 'Mysuru', state: 'Karnataka', district: 'Mysuru', lat: 12.2958, lng: 76.6394, type: 'city', pincode: '570001' },
  { name: 'Mangaluru', state: 'Karnataka', district: 'Dakshina Kannada (Mangaluru)', lat: 12.9141, lng: 74.8560, type: 'city', pincode: '575001' },
  { name: 'Hubballi', state: 'Karnataka', district: 'Dharwad (Hubballi)', lat: 15.3647, lng: 75.1240, type: 'city', pincode: '580020' },
  // Tamil Nadu
  { name: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', lat: 13.0827, lng: 80.2707, type: 'city', pincode: '600001' },
  { name: 'Coimbatore', state: 'Tamil Nadu', district: 'Coimbatore', lat: 11.0168, lng: 76.9558, type: 'city', pincode: '641001' },
  { name: 'Madurai', state: 'Tamil Nadu', district: 'Madurai', lat: 9.9252, lng: 78.1198, type: 'city', pincode: '625001' },
  // Maharashtra
  { name: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', lat: 19.0760, lng: 72.8777, type: 'city', pincode: '400001' },
  { name: 'Pune', state: 'Maharashtra', district: 'Pune', lat: 18.5204, lng: 73.8567, type: 'city', pincode: '411001' },
  { name: 'Nagpur', state: 'Maharashtra', district: 'Nagpur', lat: 21.1458, lng: 79.0882, type: 'city', pincode: '440001' },
  { name: 'Nashik', state: 'Maharashtra', district: 'Nashik', lat: 19.9975, lng: 73.7898, type: 'city', pincode: '422001' },
  // Delhi NCT
  { name: 'New Delhi', state: 'Delhi (NCT)', district: 'New Delhi', lat: 28.6139, lng: 77.2090, type: 'city', pincode: '110001' },
  { name: 'Delhi', state: 'Delhi (NCT)', district: 'Central Delhi', lat: 28.6692, lng: 77.2280, type: 'city', pincode: '110006' },
  // Rajasthan
  { name: 'Jaipur', state: 'Rajasthan', district: 'Jaipur', lat: 26.9124, lng: 75.7873, type: 'city', pincode: '302001' },
  { name: 'Jodhpur', state: 'Rajasthan', district: 'Jodhpur', lat: 26.2389, lng: 73.0243, type: 'city', pincode: '342001' },
  { name: 'Udaipur', state: 'Rajasthan', district: 'Udaipur', lat: 24.5854, lng: 73.7125, type: 'city', pincode: '313001' },
  // West Bengal
  { name: 'Kolkata', state: 'West Bengal', district: 'Kolkata', lat: 22.5726, lng: 88.3639, type: 'city', pincode: '700001' },
  { name: 'Siliguri', state: 'West Bengal', district: 'Darjeeling', lat: 26.7271, lng: 88.3953, type: 'city', pincode: '734001' },
  // Jammu & Kashmir
  { name: 'Srinagar', state: 'Jammu and Kashmir', district: 'Srinagar', lat: 34.0837, lng: 74.7973, type: 'city', pincode: '190001' },
  { name: 'Jammu', state: 'Jammu and Kashmir', district: 'Jammu', lat: 32.7266, lng: 74.8570, type: 'city', pincode: '180001' },
  // Andaman and Nicobar Islands
  { name: 'Port Blair', state: 'Andaman and Nicobar Islands', district: 'South Andaman (Port Blair)', lat: 11.6234, lng: 92.7265, type: 'city', pincode: '744101' },
  // Gujarat
  { name: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', lat: 23.0225, lng: 72.5714, type: 'city', pincode: '380001' },
  { name: 'Surat', state: 'Gujarat', district: 'Surat', lat: 21.1702, lng: 72.8311, type: 'city', pincode: '395001' },
  // Kerala
  { name: 'Kochi', state: 'Kerala', district: 'Ernakulam (Kochi)', lat: 9.9312, lng: 76.2673, type: 'city', pincode: '682001' },
  { name: 'Thiruvananthapuram', state: 'Kerala', district: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366, type: 'city', pincode: '695001' },
  // Uttar Pradesh
  { name: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', lat: 26.8467, lng: 80.9462, type: 'city', pincode: '226001' },
  { name: 'Varanasi', state: 'Uttar Pradesh', district: 'Varanasi', lat: 25.3176, lng: 82.9739, type: 'city', pincode: '221001' },
  { name: 'Noida', state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar (Noida)', lat: 28.5355, lng: 77.3910, type: 'city', pincode: '201301' },
  // Bihar
  { name: 'Patna', state: 'Bihar', district: 'Patna', lat: 25.6127, lng: 85.1589, type: 'city', pincode: '800001' },
  // Punjab & Haryana
  { name: 'Chandigarh', state: 'Chandigarh', district: 'Chandigarh', lat: 30.7333, lng: 76.7794, type: 'city', pincode: '160017' },
  { name: 'Amritsar', state: 'Punjab', district: 'Amritsar', lat: 31.6340, lng: 74.8723, type: 'city', pincode: '143001' },
  // Madhya Pradesh
  { name: 'Bhopal', state: 'Madhya Pradesh', district: 'Bhopal', lat: 23.2599, lng: 77.4126, type: 'city', pincode: '462001' },
  { name: 'Indore', state: 'Madhya Pradesh', district: 'Indore', lat: 22.7196, lng: 75.8577, type: 'city', pincode: '452001' },
  // Odisha
  { name: 'Bhubaneswar', state: 'Odisha', district: 'Khordha (Bhubaneswar)', lat: 20.2961, lng: 85.8245, type: 'city', pincode: '751001' },
  // Assam
  { name: 'Guwahati', state: 'Assam', district: 'Kamrup Metropolitan (Guwahati)', lat: 26.1445, lng: 91.7362, type: 'city', pincode: '781001' },
  // Goa
  { name: 'Panaji', state: 'Goa', district: 'North Goa (Panaji)', lat: 15.4909, lng: 73.8278, type: 'city', pincode: '403001' },
];

/**
 * Normalizes OpenStreetMap Nominatim item into standard CivicConnect location shape
 */
function normalizeNominatimItem(item) {
  const addr = item.address || {};
  const state = addr.state || addr['state_district'] || '';
  const district =
    addr.district ||
    addr.state_district ||
    addr.county ||
    addr.city_district ||
    addr.city ||
    '';
  const city =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.suburb ||
    addr.hamlet ||
    district ||
    '';
  const street =
    addr.road ||
    addr.street ||
    addr.neighbourhood ||
    addr.suburb ||
    addr.pedestrian ||
    addr.residential ||
    item.name ||
    '';
  const pincode = addr.postcode || '';

  return {
    id: item.place_id ? String(item.place_id) : `geo_${item.lat}_${item.lon}`,
    name: item.name || city || state,
    displayName: item.display_name,
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
    coordinates: [parseFloat(item.lon), parseFloat(item.lat)], // GeoJSON format [lng, lat]
    type: item.type || 'place',
    importance: item.importance || 0.5,
    address: {
      country: 'India',
      state,
      district,
      city,
      street,
      pincode,
      formattedAddress: item.display_name,
    },
  };
}

/**
 * Searches local offline India database for instant matching
 */
function searchOfflineDatabase(query) {
  const q = query.toLowerCase().trim();
  const matched = [];

  for (const item of INDIA_OFFLINE_DATABASE) {
    const nameMatch = item.name.toLowerCase().includes(q);
    const stateMatch = item.state.toLowerCase().includes(q);
    const distMatch = item.district.toLowerCase().includes(q);
    const pinMatch = item.pincode && item.pincode.startsWith(q);

    if (nameMatch || stateMatch || distMatch || pinMatch) {
      matched.push({
        id: `offline_${item.name.toLowerCase().replace(/\s+/g, '_')}`,
        name: item.name,
        displayName: `${item.name}, ${item.district}, ${item.state}, India${item.pincode ? ` - ${item.pincode}` : ''}`,
        latitude: item.lat,
        longitude: item.lng,
        coordinates: [item.lng, item.lat],
        type: item.type,
        importance: nameMatch ? 0.9 : 0.7,
        address: {
          country: 'India',
          state: item.state,
          district: item.district,
          city: item.name,
          street: '',
          pincode: item.pincode,
          formattedAddress: `${item.name}, ${item.district}, ${item.state}, India${item.pincode ? ` - ${item.pincode}` : ''}`,
        },
      });
    }
  }

  return matched;
}

/**
 * Finds closest place in offline database for reverse geocode fallback
 */
function findClosestOfflinePlace(lat, lng) {
  let closest = INDIA_OFFLINE_DATABASE[0];
  let minDistance = Infinity;

  for (const item of INDIA_OFFLINE_DATABASE) {
    const dLat = item.lat - lat;
    const dLng = item.lng - lng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = item;
    }
  }

  return closest;
}

/**
 * GET /api/geo/search?q=...&limit=...
 * Forward Geocoding across all 28 Indian States & 8 Union Territories
 */
exports.searchLocations = async (req, res) => {
  const query = (req.query.q || '').trim();
  const limit = Math.min(parseInt(req.query.limit, 10) || 8, 15);

  if (!query || query.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters long.',
    });
  }

  const cacheKey = `${query.toLowerCase()}__${limit}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.json({
      success: true,
      source: 'cache',
      count: cached.data.length,
      data: cached.data,
    });
  }

  try {
    // Query OpenStreetMap Nominatim restricted to India (countrycodes=in)
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&addressdetails=1&countrycodes=in&limit=${limit}`;

    const nominatimRes = await fetch(url, {
      headers: {
        'User-Agent': 'CivicConnect-MunicipalPortal/1.0 (contact: support@civicconnect.org)',
        'Accept-Language': 'en',
      },
      signal: AbortSignal.timeout(4500),
    });

    if (nominatimRes.ok) {
      const data = await nominatimRes.json();
      if (Array.isArray(data) && data.length > 0) {
        const normalized = data.map(normalizeNominatimItem);

        // Update in-memory cache
        searchCache.set(cacheKey, { timestamp: Date.now(), data: normalized });

        return res.json({
          success: true,
          source: 'nominatim',
          count: normalized.length,
          data: normalized,
        });
      }
    }
  } catch (err) {
    // Proceed to offline fallback on network timeout or error
    console.warn('[GeoController Search Warning]:', err.message);
  }

  // Fallback to local offline Indian geographic database
  const offlineResults = searchOfflineDatabase(query).slice(0, limit);

  return res.json({
    success: true,
    source: 'offline_fallback',
    count: offlineResults.length,
    data: offlineResults,
  });
};

/**
 * GET /api/geo/reverse?lat=...&lng=...
 * Reverse Geocoding: resolves latitude & longitude to Indian address
 */
exports.reverseGeocode = async (req, res) => {
  const latStr = req.query.lat !== undefined ? req.query.lat : req.query.latitude;
  const lngStr = req.query.lng !== undefined ? req.query.lng : req.query.lon || req.query.longitude;

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({
      success: false,
      message: 'Valid latitude (-90 to 90) and longitude (-180 to 180) are required.',
    });
  }

  const roundedLat = lat.toFixed(5);
  const roundedLng = lng.toFixed(5);
  const cacheKey = `${roundedLat},${roundedLng}`;

  const cached = reverseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.json({
      success: true,
      source: 'cache',
      data: cached.data,
    });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const nominatimRes = await fetch(url, {
      headers: {
        'User-Agent': 'CivicConnect-MunicipalPortal/1.0 (contact: support@civicconnect.org)',
        'Accept-Language': 'en',
      },
      signal: AbortSignal.timeout(4500),
    });

    if (nominatimRes.ok) {
      const data = await nominatimRes.json();
      if (data && data.address) {
        const normalized = normalizeNominatimItem(data);
        normalized.latitude = lat;
        normalized.longitude = lng;
        normalized.coordinates = [lng, lat];

        reverseCache.set(cacheKey, { timestamp: Date.now(), data: normalized });

        return res.json({
          success: true,
          source: 'nominatim',
          data: normalized,
        });
      }
    }
  } catch (err) {
    console.warn('[GeoController Reverse Warning]:', err.message);
  }

  // Offline fallback to nearest city/district
  const closest = findClosestOfflinePlace(lat, lng);
  const fallbackResult = {
    id: `fallback_${roundedLat}_${roundedLng}`,
    name: closest.name,
    displayName: `${closest.name}, ${closest.district}, ${closest.state}, India (Lat: ${roundedLat}, Lng: ${roundedLng})`,
    latitude: lat,
    longitude: lng,
    coordinates: [lng, lat],
    type: 'coordinate_pin',
    importance: 0.6,
    address: {
      country: 'India',
      state: closest.state,
      district: closest.district,
      city: closest.name,
      street: `Incident Location near ${closest.name}`,
      pincode: closest.pincode || '',
      formattedAddress: `Location near ${closest.name}, ${closest.district}, ${closest.state}, India`,
    },
  };

  return res.json({
    success: true,
    source: 'offline_fallback',
    data: fallbackResult,
  });
};

