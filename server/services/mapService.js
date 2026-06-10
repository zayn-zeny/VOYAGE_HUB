const axios = require('axios');
const logger = require('../middleware/logger');

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const OVERPASS_BASE = 'https://overpass-api.de/api/interpreter';
const OSRM_BASE = 'https://router.project-osrm.org';

const headers = {
  'User-Agent': 'VoyageHub/1.0 (travel-planner-app)',
  'Accept-Language': 'en',
};

// Forward geocode - search by query
const geocode = async (query) => {
  try {
    const { data } = await axios.get(`${NOMINATIM_BASE}/search`, {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 5,
      },
      headers,
    });

    return data.map((item) => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type,
      country: item.address?.country || '',
      city: item.address?.city || item.address?.town || item.address?.village || '',
      importance: item.importance,
    }));
  } catch (err) {
    logger.error('Geocode error:', err.message);
    throw new Error('Geocoding failed');
  }
};

// Reverse geocode - coordinates to address
const reverseGeocode = async (lat, lng) => {
  try {
    const { data } = await axios.get(`${NOMINATIM_BASE}/reverse`, {
      params: {
        lat,
        lon: lng,
        format: 'json',
        addressdetails: 1,
      },
      headers,
    });

    return {
      name: data.display_name,
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lon),
      address: data.address,
    };
  } catch (err) {
    logger.error('Reverse geocode error:', err.message);
    throw new Error('Reverse geocoding failed');
  }
};

// Nearby places using Overpass API
const getNearbyPlaces = async (lat, lng, category = 'tourism', radius = 2000) => {
  const categoryMap = {
    food: '["amenity"~"restaurant|cafe|fast_food|bar"]',
    attractions: '["tourism"~"attraction|museum|gallery|viewpoint"]',
    parks: '["leisure"~"park|garden|playground"]',
    hotels: '["tourism"~"hotel|hostel|motel|guest_house"]',
    transport: '["amenity"~"bus_station|taxi"]["railway"~"station"]',
    tourism: '["tourism"]',
  };

  const osmFilter = categoryMap[category] || categoryMap.tourism;

  const query = `
    [out:json][timeout:15];
    (
      node${osmFilter}(around:${radius},${lat},${lng});
      way${osmFilter}(around:${radius},${lat},${lng});
    );
    out center body 20;
  `;

  try {
    const { data } = await axios.post(OVERPASS_BASE, `data=${encodeURIComponent(query)}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...headers },
    });

    return data.elements
      .filter((el) => el.tags?.name)
      .map((el) => ({
        id: el.id,
        name: el.tags.name,
        lat: el.lat || el.center?.lat,
        lng: el.lon || el.center?.lon,
        type: el.tags.tourism || el.tags.amenity || el.tags.leisure || 'place',
        category,
        tags: {
          cuisine: el.tags.cuisine || '',
          website: el.tags.website || '',
          phone: el.tags.phone || '',
          openingHours: el.tags.opening_hours || '',
        },
      }));
  } catch (err) {
    logger.error('Overpass API error:', err.message);
    throw new Error('Nearby places search failed');
  }
};

// Route between two points using OSRM
const getRoute = async (fromLat, fromLng, toLat, toLng) => {
  try {
    const { data } = await axios.get(
      `${OSRM_BASE}/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}`,
      {
        params: {
          overview: 'full',
          geometries: 'geojson',
          steps: true,
        },
      }
    );

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    const route = data.routes[0];
    return {
      distance: route.distance, // meters
      duration: route.duration, // seconds
      geometry: route.geometry,
      steps: route.legs[0]?.steps?.map((step) => ({
        instruction: step.maneuver.type,
        distance: step.distance,
        duration: step.duration,
        name: step.name,
      })),
    };
  } catch (err) {
    logger.error('OSRM routing error:', err.message);
    throw new Error('Route calculation failed');
  }
};

module.exports = { geocode, reverseGeocode, getNearbyPlaces, getRoute };
