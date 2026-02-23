const { Vehicle, Trip, Violation, Permit, GPSLog } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { registrationNumber: { [Op.like]: `%${search}%` } },
        { ownerName: { [Op.like]: `%${search}%` } },
        { driverName: { [Op.like]: `%${search}%` } },
      ];
    }

    const vehicles = await Vehicle.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    const total = await Vehicle.count({ where });

    res.json({ vehicles, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id, {
      include: [
        { model: Trip, as: 'trips', limit: 10, order: [['createdAt', 'DESC']] },
        { model: Violation, as: 'violations', limit: 10, order: [['createdAt', 'DESC']] },
        { model: Permit, as: 'permits', limit: 5, order: [['createdAt', 'DESC']] },
        { model: GPSLog, as: 'gpsLogs', limit: 50, order: [['timestamp', 'DESC']] },
      ],
    });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found.' });
    res.json({ vehicle });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ vehicle });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ error: error.message || 'Server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found.' });
    await vehicle.update(req.body);
    res.json({ vehicle });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found.' });
    await vehicle.destroy();
    res.json({ message: 'Vehicle deleted.' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.stopVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found.' });
    await vehicle.update({ ecmStatus: 'stopped', status: 'stopped' });
    const io = req.app.get('io');
    if (io) io.emit('vehicleStopped', { vehicleId: vehicle.id, registrationNumber: vehicle.registrationNumber });
    res.json({ message: `Vehicle ${vehicle.registrationNumber} stopped via ECM.`, vehicle });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.resumeVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found.' });
    await vehicle.update({ ecmStatus: 'normal', status: 'active' });
    const io = req.app.get('io');
    if (io) io.emit('vehicleResumed', { vehicleId: vehicle.id, registrationNumber: vehicle.registrationNumber });
    res.json({ message: `Vehicle ${vehicle.registrationNumber} resumed.`, vehicle });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};
