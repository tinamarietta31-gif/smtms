const { Vehicle, Trip, Violation, Alert, Permit } = require('../models');
const { Op } = require('sequelize');

exports.getDashboard = async (req, res) => {
  try {
    const totalVehicles = await Vehicle.count();
    const activeVehicles = await Vehicle.count({ where: { status: 'active' } });
    const totalTrips = await Trip.count();
    const activeTrips = await Trip.count({ where: { status: 'in_progress' } });
    const totalViolations = await Violation.count();
    const openViolations = await Violation.count({ where: { status: 'open' } });
    const totalAlerts = await Alert.count();
    const unresolvedAlerts = await Alert.count({ where: { isResolved: false } });
    const totalPermits = await Permit.count();
    const activePermits = await Permit.count({ where: { status: 'active' } });

    const recentViolations = await Violation.findAll({
      include: [{ model: Vehicle, as: 'vehicle', attributes: ['registrationNumber', 'ownerName'] }],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    const recentAlerts = await Alert.findAll({
      include: [{ model: Vehicle, as: 'vehicle', attributes: ['registrationNumber'] }],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    const recentTrips = await Trip.findAll({
      include: [{ model: Vehicle, as: 'vehicle', attributes: ['registrationNumber'] }],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    res.json({
      stats: {
        totalVehicles, activeVehicles,
        totalTrips, activeTrips,
        totalViolations, openViolations,
        totalAlerts, unresolvedAlerts,
        totalPermits, activePermits,
      },
      recentViolations,
      recentAlerts,
      recentTrips,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.getPredictions = async (req, res) => {
  try {
    const allVehicles = await Vehicle.findAll({
      include: [{ model: Violation, as: 'violations', required: false }],
    });

    const predictions = allVehicles
      .map((v) => {
        const violations = v.violations || [];
        const recentCount = violations.filter(
          (viol) => new Date(viol.createdAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length;
        return {
          vehicleId: v.id,
          registrationNumber: v.registrationNumber,
          ownerName: v.ownerName,
          riskLevel: recentCount >= 5 ? 'high' : recentCount >= 3 ? 'medium' : recentCount >= 1 ? 'low' : null,
          violationCount: recentCount,
          totalViolations: violations.length,
          prediction: recentCount >= 3
            ? 'Likely to commit violation based on historical pattern'
            : 'Monitoring recommended',
        };
      })
      .filter((p) => p.riskLevel !== null)
      .sort((a, b) => b.violationCount - a.violationCount)
      .slice(0, 10);

    res.json({ predictions });
  } catch (error) {
    console.error('Predictions error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};
