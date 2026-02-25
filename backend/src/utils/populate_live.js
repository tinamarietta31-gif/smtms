const axios = require('axios');
require('dotenv').config();

const API_URL = 'https://smtms-api.onrender.com/api';

// You must manually put your live login token here to bypass authorization middleware
const ADMIN_TOKEN = process.env.TEMP_ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
    console.error("FATAL: Please set TEMP_ADMIN_TOKEN inside backend/.env before running this script.");
    process.exit(1);
}

const api = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
});

const newVehicles = [
    { registrationNumber: 'TN12FF6666', ownerName: 'Highways Carrier', vehicleType: 'truck', manufacturer: 'Mahindra', model: 'Blazo X 49', maxLoadCapacity: 49, hasBuiltInGPS: true },
    { registrationNumber: 'TN13GG7777', ownerName: 'Star Logistics', vehicleType: 'tipper', manufacturer: 'Tata', model: 'Prima 2830.K', maxLoadCapacity: 28, hasBuiltInGPS: true },
    { registrationNumber: 'TN14HH8888', ownerName: 'Blue Express', vehicleType: 'truck', manufacturer: 'Eicher', model: 'Pro 8028', maxLoadCapacity: 28, hasBuiltInGPS: true },
    { registrationNumber: 'TN15II9999', ownerName: 'Heavy Lifters', vehicleType: 'dumper', manufacturer: 'Volvo', model: 'FMX 460', maxLoadCapacity: 35, hasBuiltInGPS: true },
    { registrationNumber: 'TN16JJ0000', ownerName: 'Fast Tracks', vehicleType: 'trailer', manufacturer: 'Ashok Leyland', model: '4620 Tractor', maxLoadCapacity: 46, hasBuiltInGPS: true },
];

async function seedLiveDatabase() {
    try {
        console.log(`📡 Connecting to live API: ${API_URL}`);
        const createdVehicles = [];

        // 1. Create Vehicles
        for (const data of newVehicles) {
            console.log(`🚚 Creating vehicle: ${data.registrationNumber}`);
            const res = await api.post('/vehicles', data);
            createdVehicles.push(res.data.vehicle);
        }

        console.log(`✅ Successfully added ${createdVehicles.length} new vehicles!`);

        // Wait to ensure database commits
        await new Promise(r => setTimeout(r, 2000));

        // 2. Create Active Trips for the Simulator to pick up
        // Note: The simulator automatically picks up any Trip that has status 'ongoing'
        // and physically starts driving them if they have start/end coordinates.
        console.log(`🗺️ Generating live route tasks...`);

        const newTrips = [
            { vehicleId: createdVehicles[0].id, startLatitude: 11.0168, startLongitude: 76.9558, endLatitude: 13.0827, endLongitude: 80.2707 }, // Coimbatore -> Chennai
            { vehicleId: createdVehicles[1].id, startLatitude: 10.7905, startLongitude: 78.7047, endLatitude: 9.9252, endLongitude: 78.1198 }, // Trichy -> Madurai
            { vehicleId: createdVehicles[2].id, startLatitude: 8.7139, startLongitude: 77.7567, endLatitude: 12.9716, endLongitude: 80.1946 }, // Tirunelveli -> Chennai 
            { vehicleId: createdVehicles[3].id, startLatitude: 11.6643, startLongitude: 78.1460, endLatitude: 10.3673, endLongitude: 77.9803 }, // Salem -> Dindigul
            { vehicleId: createdVehicles[4].id, startLatitude: 12.6269, startLongitude: 80.1927, endLatitude: 12.8342, endLongitude: 79.7036 }   // Mamallapuram -> Kancheepuram (Short Run)
        ];

        for (const trip of newTrips) {
            console.log(`📍 Stating route dispatch for vehicle ID: ${trip.vehicleId}`);
            // Force the backend to accept these as starting points to wake up the simulator
            await api.post('/trips', {
                ...trip,
                startTime: new Date(),
                status: 'ongoing',
                loadWeight: Math.floor(Math.random() * 20) + 15
            });
        }

        console.log(`\n🎉 BOOM! Success.`);
        console.log(`The vehicles have been dispatched to the live database and should instantly begin driving on the Live Map.`);

    } catch (error) {
        console.error("❌ Live Injection Failed:");
        console.error(error.response?.data?.error || error.message);
    }
}

seedLiveDatabase();
