const { Vehicle } = require('../models');
const axios = require('axios');

// In-memory store to keep track of each vehicle's current road route and its progress
const vehicleRoutes = {};

// Helper to decode OSRM polyline
const decodePolyline = (str, precision) => {
    let index = 0, lat = 0, lng = 0, coordinates = [], shift = 0, result = 0, byte = null, latitude_change, longitude_change, factor = Math.pow(10, precision || 5);
    while (index < str.length) {
        byte = null; shift = 0; result = 0;
        do { byte = str.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
        latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
        shift = result = 0;
        do { byte = str.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
        longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += latitude_change; lng += longitude_change;
        coordinates.push([lat / factor, lng / factor]);
    }
    return coordinates;
};

// Generates a random coordinate within a roughly 50km radius of a start point in Tamil Nadu
const getRandomDestination = (lat, lon) => {
    const r = 50 / 111.3; // roughly 50km
    const u = Math.random();
    const v = Math.random();
    const w = r * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);
    const newLon = x / Math.cos(lat * Math.PI / 180);
    return { lat: lat + y, lon: lon + newLon };
};

// Fetches a real road route from point A to point B using OSRM
const fetchRoute = async (startLat, startLon, endLat, endLon) => {
    try {
        const url = `http://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full`;
        const response = await axios.get(url, { headers: { 'User-Agent': 'SMTMS-Sim/1.0' } });
        if (response.data && response.data.routes && response.data.routes.length > 0) {
            const encodedPolyline = response.data.routes[0].geometry;
            return decodePolyline(encodedPolyline);
        }
    } catch (e) {
        console.error('OSRM fetch error (possibly rate limited):', e.message);
    }
    return null;
};

const startSimulation = (io) => {
    console.log('Starting Realtime Vehicle OSRM Simulator...');

    setInterval(async () => {
        try {
            // Find all vehicles that are actively driving
            const vehicles = await Vehicle.findAll({
                where: { status: 'active', isGPSActive: true, ecmStatus: 'normal' }
            });

            const updates = vehicles.map(async (v) => {
                if (!v.currentLatitude || !v.currentLongitude) return null;

                // If the vehicle doesn't have an active route yet, or reached the end, generate a new one
                if (!vehicleRoutes[v.id] || vehicleRoutes[v.id].currentIndex >= vehicleRoutes[v.id].path.length) {
                    const dest = getRandomDestination(v.currentLatitude, v.currentLongitude);
                    const path = await fetchRoute(v.currentLatitude, v.currentLongitude, dest.lat, dest.lon);

                    if (path && path.length > 0) {
                        vehicleRoutes[v.id] = { path, currentIndex: 0 };
                    } else {
                        return null; // Keep waiting until we can fetch a valid road route
                    }
                }

                // Advance the vehicle to the next node in the physical road network
                const routeInfo = vehicleRoutes[v.id];
                const nextPoint = routeInfo.path[routeInfo.currentIndex];

                v.currentLatitude = nextPoint[0];
                v.currentLongitude = nextPoint[1];

                // Jump 2-5 nodes ahead based on random speed to simulate faster traveling
                routeInfo.currentIndex += Math.floor(Math.random() * 4) + 1;

                // Fluctuate speed between 30 and 70 km/h
                v.currentSpeed = Math.floor(Math.random() * (70 - 30 + 1)) + 30;

                await v.save();

                return {
                    id: v.id,
                    registrationNumber: v.registrationNumber,
                    currentLatitude: v.currentLatitude,
                    currentLongitude: v.currentLongitude,
                    currentSpeed: v.currentSpeed,
                    status: v.status,
                    isGPSActive: v.isGPSActive,
                    driverName: v.driverName,
                    ownerName: v.ownerName,
                    manufacturer: v.manufacturer,
                    model: v.model,
                    currentLoad: v.currentLoad,
                    maxLoadCapacity: v.maxLoadCapacity,
                    ecmStatus: v.ecmStatus,
                };
            });

            const updatedVehicles = (await Promise.all(updates)).filter(v => v !== null);

            if (updatedVehicles.length > 0) {
                // Broadcast exactly snapped positions to clients
                io.emit('vehiclesUpdate', updatedVehicles);
            }
        } catch (error) {
            console.error('Simulation error:', error);
        }
    }, 2500); // 2.5 second ticks
};

module.exports = { startSimulation };
