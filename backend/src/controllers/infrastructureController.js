const { Infrastructure, InfraLog, Vehicle, GPSLog } = require('../models');
const { Op } = require('sequelize');

// Haversine formula to calculate distance between two GPS points in km
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ========== REAL CHENNAI INFRASTRUCTURE DATA ==========
const CHENNAI_INFRASTRUCTURE = [
  // ===== TOLL PLAZAS =====
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

  // ===== TRAFFIC SIGNALS (Major Junctions) =====
  { name: 'Koyambedu Signal', type: 'traffic_signal', latitude: 13.0694, longitude: 80.1948, address: 'Koyambedu Junction', road: 'Jawaharlal Nehru Road', zone: 'Central Chennai', hasANPR: true, hasCCTV: true },
  { name: 'Guindy Signal', type: 'traffic_signal', latitude: 13.0067, longitude: 80.2206, address: 'Guindy Junction', road: 'Anna Salai / Mount Road', zone: 'South Chennai', hasANPR: true, hasCCTV: true },
  { name: 'Kathipara Signal', type: 'traffic_signal', latitude: 13.0073, longitude: 80.2017, address: 'Kathipara Junction', road: 'GST Road / Inner Ring Road', zone: 'South Chennai', hasANPR: true, hasCCTV: true },
  { name: 'Tambaram Signal', type: 'traffic_signal', latitude: 12.9249, longitude: 80.1278, address: 'Tambaram Junction', road: 'GST Road', zone: 'South Chennai', hasANPR: true, hasCCTV: true },
  { name: 'Chrompet Signal', type: 'traffic_signal', latitude: 12.9516, longitude: 80.1412, address: 'Chrompet Junction', road: 'GST Road', zone: 'South Chennai', hasANPR: false, hasCCTV: true },
  { name: 'Porur Signal', type: 'traffic_signal', latitude: 13.0382, longitude: 80.1584, address: 'Porur Junction', road: 'Mount-Poonamallee Road', zone: 'West Chennai', hasANPR: true, hasCCTV: true },
  { name: 'Vadapalani Signal', type: 'traffic_signal', latitude: 13.0499, longitude: 80.2121, address: 'Vadapalani Junction', road: 'Arcot Road', zone: 'Central Chennai', hasANPR: true, hasCCTV: true },
  { name: 'Alandur Signal', type: 'traffic_signal', latitude: 13.0020, longitude: 80.2050, address: 'Alandur Junction', road: 'GST Road', zone: 'South Chennai', hasANPR: false, hasCCTV: true },
  { name: 'Ambattur Signal', type: 'traffic_signal', latitude: 13.0987, longitude: 80.1620, address: 'Ambattur Junction', road: 'CTH Road', zone: 'North Chennai', hasANPR: true, hasCCTV: true },
  { name: 'Avadi Signal', type: 'traffic_signal', latitude: 13.1145, longitude: 80.1028, address: 'Avadi Junction', road: 'Chennai-Tiruvallur Road', zone: 'West Chennai', hasANPR: false, hasCCTV: true },
  { name: 'Perambur Signal', type: 'traffic_signal', latitude: 13.1127, longitude: 80.2359, address: 'Perambur Junction', road: 'Perambur High Road', zone: 'North Chennai', hasANPR: true, hasCCTV: true },
  { name: 'Villivakkam Signal', type: 'traffic_signal', latitude: 13.1070, longitude: 80.2130, address: 'Villivakkam Junction', road: 'Villivakkam Main Road', zone: 'North Chennai', hasANPR: false, hasCCTV: true },
  { name: 'Anna Nagar Signal', type: 'traffic_signal', latitude: 13.0850, longitude: 80.2101, address: 'Anna Nagar Roundtana', road: '2nd Avenue', zone: 'Central Chennai', hasANPR: true, hasCCTV: true },
  { name: 'Ashok Nagar Signal', type: 'traffic_signal', latitude: 13.0377, longitude: 80.2121, address: 'Ashok Nagar Junction', road: 'LB Road / 100 Feet Road', zone: 'South Chennai', hasANPR: false, hasCCTV: true },
  { name: 'T Nagar Signal', type: 'traffic_signal', latitude: 13.0418, longitude: 80.2341, address: 'Panagal Park Junction', road: 'Usman Road', zone: 'Central Chennai', hasANPR: true, hasCCTV: true },
  { name: 'Adyar Signal', type: 'traffic_signal', latitude: 13.0063, longitude: 80.2574, address: 'Adyar Junction', road: 'Adyar Bridge Road', zone: 'South Chennai', hasANPR: true, hasCCTV: true },
  { name: 'Thiruvanmiyur Signal', type: 'traffic_signal', latitude: 12.9830, longitude: 80.2594, address: 'Thiruvanmiyur Junction', road: 'ECR / Rajiv Gandhi Salai', zone: 'South Chennai', hasANPR: true, hasCCTV: true },
  { name: 'Sholinganallur Signal', type: 'traffic_signal', latitude: 12.9010, longitude: 80.2279, address: 'Sholinganallur Junction', road: 'OMR / Rajiv Gandhi Salai', zone: 'South Chennai', hasANPR: true, hasCCTV: true },
  { name: 'Medavakkam Signal', type: 'traffic_signal', latitude: 12.9188, longitude: 80.1920, address: 'Medavakkam Junction', road: 'Medavakkam Main Road', zone: 'South Chennai', hasANPR: false, hasCCTV: true },
  { name: 'Pallavaram Signal', type: 'traffic_signal', latitude: 12.9675, longitude: 80.1515, address: 'Pallavaram Junction', road: 'GST Road', zone: 'South Chennai', hasANPR: true, hasCCTV: true },
  { name: 'Poonamallee Signal', type: 'traffic_signal', latitude: 13.0470, longitude: 80.1020, address: 'Poonamallee Junction', road: 'NH-4 / Trunk Road', zone: 'West Chennai', hasANPR: true, hasCCTV: true },
  { name: 'Ennore Signal', type: 'traffic_signal', latitude: 13.2130, longitude: 80.3210, address: 'Ennore Junction', road: 'Ennore Expressway', zone: 'North Chennai', hasANPR: true, hasCCTV: true },
  { name: 'Redhills Signal', type: 'traffic_signal', latitude: 13.1900, longitude: 80.1850, address: 'Red Hills Junction', road: 'Grand Northern Trunk Road', zone: 'North Chennai', hasANPR: true, hasCCTV: true },
  { name: 'Thirumullaivoyal Signal', type: 'traffic_signal', latitude: 13.1307, longitude: 80.1361, address: 'Thirumullaivoyal Junction', road: 'Chennai-Tiruvallur Road', zone: 'North Chennai', hasANPR: false, hasCCTV: true },
  { name: 'Madhavaram Signal', type: 'traffic_signal', latitude: 13.1485, longitude: 80.2330, address: 'Madhavaram Junction', road: 'Grand Northern Trunk Road', zone: 'North Chennai', hasANPR: true, hasCCTV: true },

  // ===== CHECKPOINTS / WEIGHBRIDGES =====
  { name: 'Vandalur Checkpoint (Mining)', type: 'checkpoint', latitude: 12.8860, longitude: 80.0790, address: 'GST Road near Vandalur Zoo', road: 'NH-45', zone: 'South Chennai', hasANPR: true, hasCCTV: true },
  { name: 'Tambaram RTO Checkpoint', type: 'checkpoint', latitude: 12.9280, longitude: 80.1180, address: 'Near Tambaram RTO', road: 'GST Road', zone: 'South Chennai', hasANPR: true, hasCCTV: true },
  { name: 'Sriperumbudur Mining Checkpoint', type: 'checkpoint', latitude: 12.9650, longitude: 79.9500, address: 'NH-4 near Sriperumbudur', road: 'NH-4', zone: 'Kancheepuram', hasANPR: true, hasCCTV: true },
  { name: 'Poonamallee Weighbridge', type: 'weighbridge', latitude: 13.0500, longitude: 80.0950, address: 'Near Poonamallee Bus Stand', road: 'Trunk Road', zone: 'West Chennai', hasANPR: true, hasCCTV: true },
  { name: 'Gummidipoondi Weighbridge', type: 'weighbridge', latitude: 13.4010, longitude: 80.1050, address: 'NH-5, Gummidipoondi', road: 'NH-5', zone: 'Tiruvallur', hasANPR: true, hasCCTV: true },
  { name: 'Maraimalai Nagar Checkpoint', type: 'checkpoint', latitude: 12.7940, longitude: 80.0250, address: 'GST Road, Maraimalai Nagar', road: 'NH-45', zone: 'Chengalpattu', hasANPR: true, hasCCTV: true },
  { name: 'Ennore Port Checkpoint', type: 'checkpoint', latitude: 13.2250, longitude: 80.3200, address: 'Ennore Port Entrance', road: 'Ennore Expressway', zone: 'North Chennai', hasANPR: true, hasCCTV: true },
  { name: 'Chennai Port Checkpoint', type: 'checkpoint', latitude: 13.0878, longitude: 80.2875, address: 'Chennai Port Trust Gate', road: 'Rajaji Salai', zone: 'Central Chennai', hasANPR: true, hasCCTV: true },

  // ===== CCTV JUNCTIONS (Heavy Vehicle Monitoring) =====
  { name: 'OMR Thoraipakkam CCTV', type: 'cctv_junction', latitude: 12.9340, longitude: 80.2330, address: 'OMR, Thoraipakkam', road: 'OMR / Rajiv Gandhi Salai', zone: 'South Chennai', hasANPR: true, hasCCTV: true },
  { name: 'ECR Akkarai CCTV', type: 'cctv_junction', latitude: 12.9130, longitude: 80.2560, address: 'ECR, Akkarai', road: 'East Coast Road', zone: 'South Chennai', hasANPR: false, hasCCTV: true },
  { name: 'Outer Ring Road Mudichur CCTV', type: 'cctv_junction', latitude: 12.9150, longitude: 80.0650, address: 'ORR, Mudichur', road: 'Outer Ring Road', zone: 'South Chennai', hasANPR: true, hasCCTV: true },
  { name: 'Ennore Expressway CCTV', type: 'cctv_junction', latitude: 13.2000, longitude: 80.3050, address: 'Ennore Expressway', road: 'Ennore Expressway', zone: 'North Chennai', hasANPR: true, hasCCTV: true },
  { name: 'Minjur CCTV Junction', type: 'cctv_junction', latitude: 13.2780, longitude: 80.2580, address: 'Minjur', road: 'Ennore-Minjur Road', zone: 'North Chennai', hasANPR: false, hasCCTV: true },
];

exports.getAllInfrastructure = async (req, res) => {
  try {
    const { type, zone, hasANPR } = req.query;
    const where = {};
    if (type) where.type = type;
    if (zone) where.zone = zone;
    if (hasANPR !== undefined) where.hasANPR = hasANPR === 'true';

    const infra = await Infrastructure.findAll({ where, order: [['type', 'ASC'], ['name', 'ASC']] });
    res.json({ infrastructure: infra });
  } catch (error) {
    console.error('Get infrastructure error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.seedInfrastructure = async (req, res) => {
  try {
    const count = await Infrastructure.count();
    if (count > 0) {
      return res.json({ message: `Infrastructure already seeded (${count} records).` });
    }
    await Infrastructure.bulkCreate(CHENNAI_INFRASTRUCTURE);
    res.json({ message: `Seeded ${CHENNAI_INFRASTRUCTURE.length} infrastructure points.` });
  } catch (error) {
    console.error('Seed infra error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.getInfraLogs = async (req, res) => {
  try {
    const { vehicleId, infrastructureId, gpsMatchStatus, isSuspicious } = req.query;
    const where = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (infrastructureId) where.infrastructureId = infrastructureId;
    if (gpsMatchStatus) where.gpsMatchStatus = gpsMatchStatus;
    if (isSuspicious !== undefined) where.isSuspicious = isSuspicious === 'true';

    const logs = await InfraLog.findAll({
      where,
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'registrationNumber', 'ownerName', 'driverName'] },
        { model: Infrastructure, as: 'infrastructure', attributes: ['id', 'name', 'type', 'latitude', 'longitude', 'road'] },
      ],
      order: [['detectedAt', 'DESC']],
      limit: 200,
    });

    res.json({ logs });
  } catch (error) {
    console.error('Get infra logs error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.recordDetection = async (req, res) => {
  try {
    const { vehicleId, infrastructureId, source, registrationNumber, imageUrl, detectedAt } = req.body;

    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found.' });

    const infra = await Infrastructure.findByPk(infrastructureId);
    if (!infra) return res.status(404).json({ error: 'Infrastructure point not found.' });

    // Find closest GPS log within +/- 10 minutes of detection time
    const detectTime = detectedAt ? new Date(detectedAt) : new Date();
    const timeWindow = 10 * 60 * 1000; // 10 min

    const closestGPS = await GPSLog.findOne({
      where: {
        vehicleId,
        timestamp: {
          [Op.between]: [new Date(detectTime - timeWindow), new Date(detectTime.getTime() + timeWindow)],
        },
      },
      order: [['timestamp', 'DESC']],
    });

    let gpsMatchStatus = 'no_data';
    let distanceFromInfra = null;
    let gpsLatitude = null;
    let gpsLongitude = null;
    let isSuspicious = false;
    let notes = '';

    if (!closestGPS) {
      // No GPS data at all — vehicle GPS was likely offline
      gpsMatchStatus = vehicle.isGPSActive ? 'no_data' : 'gps_offline';
      isSuspicious = true;
      notes = `Vehicle ${vehicle.registrationNumber} detected at ${infra.name} via ${source}, but NO GPS data found within ±10 min. Possible GPS tampering.`;
    } else {
      gpsLatitude = closestGPS.latitude;
      gpsLongitude = closestGPS.longitude;
      distanceFromInfra = haversineDistance(closestGPS.latitude, closestGPS.longitude, infra.latitude, infra.longitude);

      if (distanceFromInfra <= 1.0) {
        gpsMatchStatus = 'matched';
        notes = `GPS confirmed: vehicle was ${distanceFromInfra.toFixed(2)} km from ${infra.name}.`;
      } else {
        gpsMatchStatus = 'mismatch';
        isSuspicious = true;
        notes = `GPS MISMATCH: Vehicle detected at ${infra.name} via ${source}, but GPS shows ${distanceFromInfra.toFixed(2)} km away at (${gpsLatitude.toFixed(4)}, ${gpsLongitude.toFixed(4)}). Possible GPS spoofing.`;
      }
    }

    const log = await InfraLog.create({
      vehicleId,
      infrastructureId,
      detectedAt: detectTime,
      source: source || 'anpr',
      registrationNumber: registrationNumber || vehicle.registrationNumber,
      imageUrl,
      gpsLatitude,
      gpsLongitude,
      gpsMatchStatus,
      distanceFromInfra,
      isSuspicious,
      notes,
    });

    // If suspicious, also create an alert
    if (isSuspicious) {
      const { Alert } = require('../models');
      await Alert.create({
        vehicleId,
        type: gpsMatchStatus === 'gps_offline' ? 'gps_offline' : 'gps_mismatch',
        severity: 'danger',
        message: notes,
        latitude: infra.latitude,
        longitude: infra.longitude,
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('newAlert', { vehicleId, type: 'gps_mismatch', message: notes });
      }
    }

    res.status(201).json({ message: 'Detection recorded', log });
  } catch (error) {
    console.error('Record detection error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

// Cross-verify all vehicles against infrastructure — batch analysis
exports.crossVerify = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({ where: { status: 'active' } });
    const allInfra = await Infrastructure.findAll({ where: { isActive: true, hasANPR: true } });
    const results = [];

    for (const vehicle of vehicles) {
      // Get last 24 hours of GPS logs
      const gpsLogs = await GPSLog.findAll({
        where: {
          vehicleId: vehicle.id,
          timestamp: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        order: [['timestamp', 'ASC']],
      });

      if (gpsLogs.length === 0) {
        results.push({
          vehicleId: vehicle.id,
          registrationNumber: vehicle.registrationNumber,
          status: 'no_gps_data',
          message: 'No GPS data in last 24 hours',
          isSuspicious: true,
        });
        continue;
      }

      // Check which infrastructure points the GPS trail passes near
      const passedNear = [];
      for (const infra of allInfra) {
        const closestLog = gpsLogs.reduce((closest, log) => {
          const dist = haversineDistance(log.latitude, log.longitude, infra.latitude, infra.longitude);
          if (!closest || dist < closest.distance) return { log, distance: dist };
          return closest;
        }, null);

        if (closestLog && closestLog.distance <= 2.0) {
          passedNear.push({
            infrastructure: infra.name,
            type: infra.type,
            closestDistance: closestLog.distance.toFixed(2),
            time: closestLog.log.timestamp,
          });
        }
      }

      results.push({
        vehicleId: vehicle.id,
        registrationNumber: vehicle.registrationNumber,
        gpsLogCount: gpsLogs.length,
        passedNearInfraCount: passedNear.length,
        passedNear,
        isSuspicious: false,
      });
    }

    res.json({ results });
  } catch (error) {
    console.error('Cross-verify error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalInfra = await Infrastructure.count();
    const tollPlazas = await Infrastructure.count({ where: { type: 'toll_plaza' } });
    const trafficSignals = await Infrastructure.count({ where: { type: 'traffic_signal' } });
    const checkpoints = await Infrastructure.count({ where: { type: 'checkpoint' } });
    const weighbridges = await Infrastructure.count({ where: { type: 'weighbridge' } });
    const cctvJunctions = await Infrastructure.count({ where: { type: 'cctv_junction' } });
    const anprEnabled = await Infrastructure.count({ where: { hasANPR: true } });
    const totalLogs = await InfraLog.count();
    const suspiciousLogs = await InfraLog.count({ where: { isSuspicious: true } });
    const mismatchLogs = await InfraLog.count({ where: { gpsMatchStatus: 'mismatch' } });

    res.json({
      stats: {
        totalInfra, tollPlazas, trafficSignals, checkpoints, weighbridges, cctvJunctions, anprEnabled,
        totalLogs, suspiciousLogs, mismatchLogs,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};
