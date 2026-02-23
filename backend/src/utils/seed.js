require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { sequelize, User, Vehicle, Permit, Trip, Violation, Alert, Geofence, GPSLog, Infrastructure, InfraLog } = require('../models');

const seed = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.sync({ force: true });
    console.log('Tables created.');

    // Create admin user
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@smtms.gov.in',
      password: 'admin123',
      role: 'super_admin',
      phone: '9876543210',
    });

    const officer = await User.create({
      name: 'Field Officer 1',
      email: 'officer1@smtms.gov.in',
      password: 'officer123',
      role: 'officer',
      phone: '9876543211',
    });

    console.log('Users created.');

    // Create vehicles
    const vehicles = await Vehicle.bulkCreate([
      {
        registrationNumber: 'TN01AB1234',
        ownerName: 'Ravi Kumar',
        ownerPhone: '9876543001',
        ownerEmail: 'ravi@example.com',
        driverName: 'Suresh M',
        driverPhone: '9876543101',
        driverLicense: 'TN0120210001234',
        vehicleType: 'tipper',
        manufacturer: 'Bharat Benz',
        model: '1623C',
        year: 2023,
        maxLoadCapacity: 16,
        hasBuiltInGPS: true,
        currentLatitude: 13.0827,
        currentLongitude: 80.2707,
        currentSpeed: 0,
        isGPSActive: true,
        isEngineRunning: true,
        status: 'active',
        lastSeenAt: new Date(),
      },
      {
        registrationNumber: 'TN02CD5678',
        ownerName: 'Murugan S',
        ownerPhone: '9876543002',
        ownerEmail: 'murugan@example.com',
        driverName: 'Karthik R',
        driverPhone: '9876543102',
        driverLicense: 'TN0220210005678',
        vehicleType: 'truck',
        manufacturer: 'Tata',
        model: 'Signa 4825.TK',
        year: 2022,
        maxLoadCapacity: 25,
        hasBuiltInGPS: false,
        gpsDeviceId: 'GPS-DEV-002',
        currentLatitude: 12.9716,
        currentLongitude: 80.1946,
        currentSpeed: 45,
        isGPSActive: true,
        isEngineRunning: true,
        status: 'active',
        lastSeenAt: new Date(),
      },
      {
        registrationNumber: 'TN03EF9012',
        ownerName: 'Kannan P',
        ownerPhone: '9876543003',
        ownerEmail: 'kannan@example.com',
        driverName: 'Vignesh K',
        driverPhone: '9876543103',
        driverLicense: 'TN0320210009012',
        vehicleType: 'dumper',
        manufacturer: 'Ashok Leyland',
        model: '2820 6x4',
        year: 2021,
        maxLoadCapacity: 20,
        hasBuiltInGPS: false,
        gpsDeviceId: 'GPS-DEV-003',
        currentLatitude: 13.1500,
        currentLongitude: 80.2100,
        currentSpeed: 0,
        isGPSActive: false,
        isEngineRunning: false,
        status: 'active',
        lastSeenAt: new Date(Date.now() - 3600000),
      },
      {
        registrationNumber: 'TN04GH3456',
        ownerName: 'Senthil V',
        ownerPhone: '9876543004',
        ownerEmail: 'senthil@example.com',
        driverName: 'Arun D',
        driverPhone: '9876543104',
        driverLicense: 'TN0420210003456',
        vehicleType: 'tipper',
        manufacturer: 'Bharat Benz',
        model: '2828C',
        year: 2024,
        maxLoadCapacity: 28,
        hasBuiltInGPS: true,
        currentLatitude: 13.0400,
        currentLongitude: 80.2300,
        currentSpeed: 30,
        isGPSActive: true,
        isEngineRunning: true,
        status: 'active',
        lastSeenAt: new Date(),
      },
      {
        registrationNumber: 'TN05IJ7890',
        ownerName: 'Prakash M',
        ownerPhone: '9876543005',
        ownerEmail: 'prakash@example.com',
        driverName: 'Dinesh S',
        driverPhone: '9876543105',
        driverLicense: 'TN0520210007890',
        vehicleType: 'truck',
        manufacturer: 'Eicher',
        model: 'Pro 6049',
        year: 2022,
        maxLoadCapacity: 22,
        hasBuiltInGPS: false,
        gpsDeviceId: 'GPS-DEV-005',
        currentLatitude: 12.9200,
        currentLongitude: 80.1500,
        currentSpeed: 60,
        isGPSActive: true,
        isEngineRunning: true,
        isRemoteStopped: false,
        status: 'active',
        lastSeenAt: new Date(),
      },
    ]);

    console.log('Vehicles created.');

    // Create geofences
    await Geofence.bulkCreate([
      {
        name: 'Authorized Mining Zone A - Kancheepuram',
        type: 'authorized_zone',
        centerLatitude: 12.8342,
        centerLongitude: 79.7036,
        radiusKm: 3,
        createdBy: admin.id,
      },
      {
        name: 'Authorized Mining Zone B - Thiruvallur',
        type: 'authorized_zone',
        centerLatitude: 13.1431,
        centerLongitude: 79.9085,
        radiusKm: 2.5,
        createdBy: admin.id,
      },
      {
        name: 'Restricted Forest Zone - Mamallapuram',
        type: 'restricted_zone',
        centerLatitude: 12.6269,
        centerLongitude: 80.1927,
        radiusKm: 5,
        createdBy: admin.id,
      },
      {
        name: 'Delivery Zone - Chennai Port',
        type: 'delivery_zone',
        centerLatitude: 13.0878,
        centerLongitude: 80.2875,
        radiusKm: 1,
        createdBy: admin.id,
      },
      {
        name: 'Checkpoint - Tambaram Toll',
        type: 'checkpoint',
        centerLatitude: 12.9249,
        centerLongitude: 80.1000,
        radiusKm: 0.5,
        createdBy: admin.id,
      },
    ]);

    console.log('Geofences created.');

    // Create permits
    const permits = await Permit.bulkCreate([
      {
        vehicleId: vehicles[0].id,
        permitNumber: 'PRM-2024-001',
        authorizedZone: 'Mining Zone A - Kancheepuram',
        zoneCenterLat: 12.8342,
        zoneCenterLng: 79.7036,
        zoneRadiusKm: 3,
        destinationLat: 13.0878,
        destinationLng: 80.2875,
        destinationName: 'Chennai Port',
        maxLoadPerTrip: 16,
        maxTripsPerDay: 4,
        totalAllowedVolume: 300,
        usedVolume: 80,
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2025-12-31'),
        status: 'active',
        issuedBy: admin.id,
      },
      {
        vehicleId: vehicles[1].id,
        permitNumber: 'PRM-2024-002',
        authorizedZone: 'Mining Zone B - Thiruvallur',
        zoneCenterLat: 13.1431,
        zoneCenterLng: 79.9085,
        zoneRadiusKm: 2.5,
        destinationLat: 13.0878,
        destinationLng: 80.2875,
        destinationName: 'Chennai Port',
        maxLoadPerTrip: 25,
        maxTripsPerDay: 3,
        totalAllowedVolume: 500,
        usedVolume: 200,
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2025-06-30'),
        status: 'active',
        issuedBy: admin.id,
      },
      {
        vehicleId: vehicles[3].id,
        permitNumber: 'PRM-2024-003',
        authorizedZone: 'Mining Zone A - Kancheepuram',
        zoneCenterLat: 12.8342,
        zoneCenterLng: 79.7036,
        zoneRadiusKm: 3,
        destinationLat: 13.0878,
        destinationLng: 80.2875,
        destinationName: 'Chennai Port',
        maxLoadPerTrip: 28,
        maxTripsPerDay: 5,
        totalAllowedVolume: 700,
        usedVolume: 0,
        validFrom: new Date('2024-06-01'),
        validTo: new Date('2025-12-31'),
        status: 'active',
        issuedBy: admin.id,
      },
    ]);

    console.log('Permits created.');

    // Create sample trips
    await Trip.bulkCreate([
      {
        vehicleId: vehicles[0].id,
        permitId: permits[0].id,
        startLatitude: 12.8342,
        startLongitude: 79.7036,
        endLatitude: 13.0878,
        endLongitude: 80.2875,
        startTime: new Date(Date.now() - 7200000),
        endTime: new Date(Date.now() - 3600000),
        loadWeight: 14,
        distance: 75.5,
        status: 'completed',
        isAuthorized: true,
      },
      {
        vehicleId: vehicles[1].id,
        permitId: permits[1].id,
        startLatitude: 13.1431,
        startLongitude: 79.9085,
        startTime: new Date(Date.now() - 1800000),
        loadWeight: 22,
        status: 'ongoing',
        isAuthorized: true,
      },
      {
        vehicleId: vehicles[2].id,
        permitId: null,
        startLatitude: 12.6269,
        startLongitude: 80.1927,
        startTime: new Date(Date.now() - 3600000),
        loadWeight: 18,
        status: 'unauthorized',
        isAuthorized: false,
        flagReason: 'No permit associated. Operating in restricted forest zone.',
      },
      {
        vehicleId: vehicles[4].id,
        permitId: null,
        startLatitude: 12.9200,
        startLongitude: 80.1500,
        startTime: new Date(Date.now() - 900000),
        loadWeight: 25,
        status: 'flagged',
        isAuthorized: false,
        flagReason: 'No permit. Overloaded beyond capacity.',
      },
    ]);

    console.log('Trips created.');

    // Create violations
    await Violation.bulkCreate([
      {
        vehicleId: vehicles[2].id,
        tripId: 3,
        type: 'unauthorized_zone',
        severity: 'critical',
        description: 'Vehicle TN03EF9012 detected in restricted forest zone without permit.',
        latitude: 12.6269,
        longitude: 80.1927,
        detectedBy: 'system',
        status: 'detected',
      },
      {
        vehicleId: vehicles[2].id,
        tripId: 3,
        type: 'gps_tampering',
        severity: 'critical',
        description: 'GPS signal lost for vehicle TN03EF9012. Last seen near restricted zone.',
        latitude: 13.1500,
        longitude: 80.2100,
        detectedBy: 'system',
        status: 'detected',
      },
      {
        vehicleId: vehicles[4].id,
        tripId: 4,
        type: 'overloading',
        severity: 'high',
        description: 'Vehicle TN05IJ7890 carrying 25T against capacity of 22T.',
        latitude: 12.9200,
        longitude: 80.1500,
        detectedBy: 'system',
        status: 'detected',
      },
      {
        vehicleId: vehicles[4].id,
        type: 'excess_trips',
        severity: 'medium',
        description: 'Vehicle TN05IJ7890 exceeded daily trip limit in the last week.',
        detectedBy: 'ml_prediction',
        status: 'reviewed',
      },
      {
        vehicleId: vehicles[1].id,
        type: 'speed_violation',
        severity: 'low',
        description: 'Vehicle TN02CD5678 exceeded 60 km/h speed limit in mining zone.',
        latitude: 13.1431,
        longitude: 79.9085,
        detectedBy: 'system',
        challanGenerated: true,
        challanNumber: 'ECH-2024-001',
        challanAmount: 10000,
        status: 'challan_issued',
      },
    ]);

    console.log('Violations created.');

    // Create alerts
    await Alert.bulkCreate([
      {
        vehicleId: vehicles[2].id,
        type: 'gps_offline',
        severity: 'critical',
        message: 'GPS signal lost for TN03EF9012. Possible tampering detected.',
        latitude: 13.1500,
        longitude: 80.2100,
      },
      {
        vehicleId: vehicles[2].id,
        type: 'geofence_breach',
        severity: 'danger',
        message: 'TN03EF9012 entered restricted forest zone near Mamallapuram.',
        latitude: 12.6269,
        longitude: 80.1927,
      },
      {
        vehicleId: vehicles[4].id,
        type: 'overload',
        severity: 'warning',
        message: 'TN05IJ7890 overloaded: 25T (limit: 22T).',
        latitude: 12.9200,
        longitude: 80.1500,
      },
      {
        vehicleId: vehicles[4].id,
        type: 'suspicious_pattern',
        severity: 'warning',
        message: 'ML model flagged TN05IJ7890 for suspicious trip patterns.',
      },
      {
        vehicleId: vehicles[1].id,
        type: 'speed_limit',
        severity: 'info',
        message: 'TN02CD5678 exceeded speed limit in mining zone.',
        latitude: 13.1431,
        longitude: 79.9085,
        isResolved: true,
        resolvedBy: admin.id,
        resolvedAt: new Date(),
      },
    ]);

    console.log('Alerts created.');

    // Create GPS logs for trail
    const now = Date.now();
    const gpsLogs = [];
    for (let i = 0; i < 50; i++) {
      gpsLogs.push({
        vehicleId: vehicles[0].id,
        latitude: 12.8342 + (13.0878 - 12.8342) * (i / 50),
        longitude: 79.7036 + (80.2875 - 79.7036) * (i / 50),
        speed: 30 + Math.random() * 30,
        heading: 45,
        source: 'built_in_gps',
        timestamp: new Date(now - (50 - i) * 120000),
      });
    }
    for (let i = 0; i < 30; i++) {
      gpsLogs.push({
        vehicleId: vehicles[1].id,
        latitude: 13.1431 + (13.0878 - 13.1431) * (i / 30),
        longitude: 79.9085 + (80.2875 - 79.9085) * (i / 30),
        speed: 40 + Math.random() * 20,
        heading: 90,
        source: 'gps_device',
        timestamp: new Date(now - (30 - i) * 120000),
      });
    }

    await GPSLog.bulkCreate(gpsLogs);
    console.log('GPS logs created.');

    // Seed Chennai infrastructure
    const infraData = [
      // TOLL PLAZAS
      { name: 'Vandalur Toll Plaza', type: 'toll_plaza', latitude: 12.8923, longitude: 80.0812, address: 'GST Road, Vandalur', road: 'NH-45 (GST Road)', zone: 'South Chennai', hasANPR: true, hasCCTV: true },
      { name: 'Paranur Toll Plaza', type: 'toll_plaza', latitude: 12.7520, longitude: 80.0175, address: 'NH-45, Paranur', road: 'NH-45 (GST Road)', zone: 'Chengalpattu', hasANPR: true, hasCCTV: true },
      { name: 'Maduravoyal Toll Plaza', type: 'toll_plaza', latitude: 13.0604, longitude: 80.1626, address: 'Chennai-Bangalore Highway', road: 'NH-4 (Chennai-Bangalore Highway)', zone: 'West Chennai', hasANPR: true, hasCCTV: true },
      { name: 'Sriperumbudur Toll Plaza', type: 'toll_plaza', latitude: 12.9672, longitude: 79.9408, address: 'NH-4, Sriperumbudur', road: 'NH-4 (Chennai-Bangalore Highway)', zone: 'Kancheepuram', hasANPR: true, hasCCTV: true },
      { name: 'Athur Toll Plaza', type: 'toll_plaza', latitude: 13.1245, longitude: 80.0032, address: 'NH-205, Athur', road: 'NH-205 (Tiruvallur Road)', zone: 'Tiruvallur', hasANPR: true, hasCCTV: true },
      { name: 'Red Hills Toll Plaza', type: 'toll_plaza', latitude: 13.1910, longitude: 80.1860, address: 'NH-5, Red Hills', road: 'NH-5 (Grand Northern Trunk Road)', zone: 'North Chennai', hasANPR: true, hasCCTV: true },
      { name: 'Gummidipoondi Toll Plaza', type: 'toll_plaza', latitude: 13.3975, longitude: 80.1098, address: 'NH-5, Gummidipoondi', road: 'NH-5 (Chennai-Kolkata Highway)', zone: 'Tiruvallur', hasANPR: true, hasCCTV: true },
      { name: 'Perungalathur Toll Plaza', type: 'toll_plaza', latitude: 12.9070, longitude: 80.0950, address: 'Outer Ring Road, Perungalathur', road: 'ORR (Outer Ring Road)', zone: 'South Chennai', hasANPR: true, hasCCTV: true },
      { name: 'Nemilichery Toll Plaza', type: 'toll_plaza', latitude: 13.1520, longitude: 80.2100, address: 'Outer Ring Road, Nemilichery', road: 'ORR (Outer Ring Road)', zone: 'North Chennai', hasANPR: true, hasCCTV: true },
      { name: 'Mahabalipuram Toll Plaza', type: 'toll_plaza', latitude: 12.6269, longitude: 80.1927, address: 'ECR, Mahabalipuram', road: 'ECR (East Coast Road)', zone: 'Chengalpattu', hasANPR: true, hasCCTV: true },
      // TRAFFIC SIGNALS
      { name: 'Koyambedu Signal', type: 'traffic_signal', latitude: 13.0694, longitude: 80.1948, address: 'Koyambedu Junction', road: 'Jawaharlal Nehru Road', zone: 'Central Chennai', hasANPR: true, hasCCTV: true },
      { name: 'Guindy Signal', type: 'traffic_signal', latitude: 13.0067, longitude: 80.2206, address: 'Guindy Junction', road: 'Anna Salai / Mount Road', zone: 'South Chennai', hasANPR: true, hasCCTV: true },
      { name: 'Kathipara Signal', type: 'traffic_signal', latitude: 13.0073, longitude: 80.2017, address: 'Kathipara Junction', road: 'GST Road / Inner Ring Road', zone: 'South Chennai', hasANPR: true, hasCCTV: true },
      { name: 'Tambaram Signal', type: 'traffic_signal', latitude: 12.9249, longitude: 80.1278, address: 'Tambaram Junction', road: 'GST Road', zone: 'South Chennai', hasANPR: true, hasCCTV: true },
      { name: 'Porur Signal', type: 'traffic_signal', latitude: 13.0382, longitude: 80.1584, address: 'Porur Junction', road: 'Mount-Poonamallee Road', zone: 'West Chennai', hasANPR: true, hasCCTV: true },
      { name: 'Vadapalani Signal', type: 'traffic_signal', latitude: 13.0499, longitude: 80.2121, address: 'Vadapalani Junction', road: 'Arcot Road', zone: 'Central Chennai', hasANPR: true, hasCCTV: true },
      { name: 'Ambattur Signal', type: 'traffic_signal', latitude: 13.0987, longitude: 80.1620, address: 'Ambattur Junction', road: 'CTH Road', zone: 'North Chennai', hasANPR: true, hasCCTV: true },
      { name: 'Anna Nagar Signal', type: 'traffic_signal', latitude: 13.0850, longitude: 80.2101, address: 'Anna Nagar Roundtana', road: '2nd Avenue', zone: 'Central Chennai', hasANPR: true, hasCCTV: true },
      { name: 'Adyar Signal', type: 'traffic_signal', latitude: 13.0063, longitude: 80.2574, address: 'Adyar Junction', road: 'Adyar Bridge Road', zone: 'South Chennai', hasANPR: true, hasCCTV: true },
      { name: 'Sholinganallur Signal', type: 'traffic_signal', latitude: 12.9010, longitude: 80.2279, address: 'Sholinganallur Junction', road: 'OMR / Rajiv Gandhi Salai', zone: 'South Chennai', hasANPR: true, hasCCTV: true },
      { name: 'Poonamallee Signal', type: 'traffic_signal', latitude: 13.0470, longitude: 80.1020, address: 'Poonamallee Junction', road: 'NH-4 / Trunk Road', zone: 'West Chennai', hasANPR: true, hasCCTV: true },
      { name: 'Ennore Signal', type: 'traffic_signal', latitude: 13.2130, longitude: 80.3210, address: 'Ennore Junction', road: 'Ennore Expressway', zone: 'North Chennai', hasANPR: true, hasCCTV: true },
      { name: 'Redhills Signal', type: 'traffic_signal', latitude: 13.1900, longitude: 80.1850, address: 'Red Hills Junction', road: 'Grand Northern Trunk Road', zone: 'North Chennai', hasANPR: true, hasCCTV: true },
      { name: 'Madhavaram Signal', type: 'traffic_signal', latitude: 13.1485, longitude: 80.2330, address: 'Madhavaram Junction', road: 'Grand Northern Trunk Road', zone: 'North Chennai', hasANPR: true, hasCCTV: true },
      // CHECKPOINTS
      { name: 'Vandalur Checkpoint (Mining)', type: 'checkpoint', latitude: 12.8860, longitude: 80.0790, address: 'GST Road near Vandalur Zoo', road: 'NH-45', zone: 'South Chennai', hasANPR: true, hasCCTV: true },
      { name: 'Tambaram RTO Checkpoint', type: 'checkpoint', latitude: 12.9280, longitude: 80.1180, address: 'Near Tambaram RTO', road: 'GST Road', zone: 'South Chennai', hasANPR: true, hasCCTV: true },
      { name: 'Sriperumbudur Mining Checkpoint', type: 'checkpoint', latitude: 12.9650, longitude: 79.9500, address: 'NH-4 near Sriperumbudur', road: 'NH-4', zone: 'Kancheepuram', hasANPR: true, hasCCTV: true },
      { name: 'Poonamallee Weighbridge', type: 'weighbridge', latitude: 13.0500, longitude: 80.0950, address: 'Near Poonamallee Bus Stand', road: 'Trunk Road', zone: 'West Chennai', hasANPR: true, hasCCTV: true },
      { name: 'Gummidipoondi Weighbridge', type: 'weighbridge', latitude: 13.4010, longitude: 80.1050, address: 'NH-5, Gummidipoondi', road: 'NH-5', zone: 'Tiruvallur', hasANPR: true, hasCCTV: true },
      { name: 'Chennai Port Checkpoint', type: 'checkpoint', latitude: 13.0878, longitude: 80.2875, address: 'Chennai Port Trust Gate', road: 'Rajaji Salai', zone: 'Central Chennai', hasANPR: true, hasCCTV: true },
    ];
    const infraRecords = await Infrastructure.bulkCreate(infraData);
    console.log('Chennai infrastructure created (' + infraRecords.length + ' points).');

    // Sample ANPR/Toll detection logs with GPS cross-verification
    const infraLogs = [
      // Vehicle 1 (TN01AB1234) — matched at Vandalur Toll
      {
        vehicleId: vehicles[0].id,
        infrastructureId: infraRecords[0].id,
        detectedAt: new Date(now - 5400000),
        source: 'toll_record',
        registrationNumber: 'TN01AB1234',
        gpsLatitude: 12.8930,
        gpsLongitude: 80.0818,
        gpsMatchStatus: 'matched',
        distanceFromInfra: 0.08,
        isSuspicious: false,
        notes: 'GPS confirmed: vehicle was 0.08 km from Vandalur Toll Plaza.',
      },
      // Vehicle 2 (TN02CD5678) — matched at Koyambedu Signal
      {
        vehicleId: vehicles[1].id,
        infrastructureId: infraRecords[10].id,
        detectedAt: new Date(now - 3600000),
        source: 'anpr',
        registrationNumber: 'TN02CD5678',
        gpsLatitude: 13.0690,
        gpsLongitude: 80.1952,
        gpsMatchStatus: 'matched',
        distanceFromInfra: 0.05,
        isSuspicious: false,
        notes: 'GPS confirmed: vehicle was 0.05 km from Koyambedu Signal.',
      },
      // Vehicle 3 (TN03EF9012) — GPS MISMATCH at Tambaram Signal!
      {
        vehicleId: vehicles[2].id,
        infrastructureId: infraRecords[13].id,
        detectedAt: new Date(now - 2700000),
        source: 'anpr',
        registrationNumber: 'TN03EF9012',
        gpsLatitude: 13.1500,
        gpsLongitude: 80.2100,
        gpsMatchStatus: 'mismatch',
        distanceFromInfra: 25.7,
        isSuspicious: true,
        notes: 'GPS MISMATCH: Vehicle detected at Tambaram Signal via ANPR, but GPS shows 25.70 km away at (13.1500, 80.2100). Possible GPS spoofing.',
      },
      // Vehicle 3 — GPS OFFLINE at Vandalur Checkpoint
      {
        vehicleId: vehicles[2].id,
        infrastructureId: infraRecords[24].id,
        detectedAt: new Date(now - 1800000),
        source: 'anpr',
        registrationNumber: 'TN03EF9012',
        gpsLatitude: null,
        gpsLongitude: null,
        gpsMatchStatus: 'gps_offline',
        distanceFromInfra: null,
        isSuspicious: true,
        notes: 'Vehicle TN03EF9012 detected at Vandalur Checkpoint (Mining) via ANPR, but NO GPS data found within ±10 min. Possible GPS tampering.',
      },
      // Vehicle 4 (TN04GH3456) — matched at Maduravoyal Toll
      {
        vehicleId: vehicles[3].id,
        infrastructureId: infraRecords[2].id,
        detectedAt: new Date(now - 1200000),
        source: 'toll_record',
        registrationNumber: 'TN04GH3456',
        gpsLatitude: 13.0610,
        gpsLongitude: 80.1630,
        gpsMatchStatus: 'matched',
        distanceFromInfra: 0.12,
        isSuspicious: false,
        notes: 'GPS confirmed: vehicle was 0.12 km from Maduravoyal Toll Plaza.',
      },
      // Vehicle 5 (TN05IJ7890) — GPS MISMATCH at Porur Signal
      {
        vehicleId: vehicles[4].id,
        infrastructureId: infraRecords[14].id,
        detectedAt: new Date(now - 600000),
        source: 'anpr',
        registrationNumber: 'TN05IJ7890',
        gpsLatitude: 12.9200,
        gpsLongitude: 80.1500,
        gpsMatchStatus: 'mismatch',
        distanceFromInfra: 13.1,
        isSuspicious: true,
        notes: 'GPS MISMATCH: Vehicle detected at Porur Signal via ANPR, but GPS shows 13.10 km away. Possible GPS spoofing.',
      },
      // Vehicle 5 — detected at Poonamallee Weighbridge
      {
        vehicleId: vehicles[4].id,
        infrastructureId: infraRecords[27].id,
        detectedAt: new Date(now - 300000),
        source: 'anpr',
        registrationNumber: 'TN05IJ7890',
        gpsLatitude: 12.9200,
        gpsLongitude: 80.1500,
        gpsMatchStatus: 'mismatch',
        distanceFromInfra: 14.8,
        isSuspicious: true,
        notes: 'GPS MISMATCH: Vehicle detected at Poonamallee Weighbridge, but GPS shows 14.80 km away.',
      },
    ];
    await InfraLog.bulkCreate(infraLogs);
    console.log('Infrastructure detection logs created.');

    console.log('\n==========================================');
    console.log('  Seed completed successfully!');
    console.log('  Admin: admin@smtms.gov.in / admin123');
    console.log('  Officer: officer1@smtms.gov.in / officer123');
    console.log('==========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
