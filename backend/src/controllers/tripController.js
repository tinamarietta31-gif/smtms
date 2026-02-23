const { Trip, Vehicle, Permit, Violation } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { status, vehicleId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (vehicleId) where.vehicleId = vehicleId;

    const trips = await Trip.findAll({
      where,
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'registrationNumber', 'ownerName', 'driverName'] },
        { model: Permit, as: 'permit', attributes: ['id', 'permitNumber', 'status'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    res.json({ trips });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Permit, as: 'permit' },
        { model: Violation, as: 'violations' },
      ],
    });
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });
    res.json({ trip });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const trip = await Trip.create(req.body);
    res.status(201).json({ trip });
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ error: error.message || 'Server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });
    await trip.update(req.body);
    res.json({ trip });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};
