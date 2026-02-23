const { Violation, Vehicle, Trip } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { type, severity, status } = req.query;
    const where = {};
    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (status) where.status = status;

    const violations = await Violation.findAll({
      where,
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'registrationNumber', 'ownerName', 'driverName'] },
        { model: Trip, as: 'trip', attributes: ['id', 'tripNumber', 'status'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    res.json({ violations });
  } catch (error) {
    console.error('Get violations error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const violation = await Violation.findByPk(req.params.id, {
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Trip, as: 'trip' },
      ],
    });
    if (!violation) return res.status(404).json({ error: 'Violation not found.' });
    res.json({ violation });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const violation = await Violation.create(req.body);
    res.status(201).json({ violation });
  } catch (error) {
    console.error('Create violation error:', error);
    res.status(500).json({ error: error.message || 'Server error.' });
  }
};

exports.generateChallan = async (req, res) => {
  try {
    const violation = await Violation.findByPk(req.params.id);
    if (!violation) return res.status(404).json({ error: 'Violation not found.' });

    const challanNumber = `CH-${Date.now()}-${violation.id}`;
    await violation.update({
      challanNumber,
      challanGenerated: true,
      challanStatus: 'issued',
      status: 'challan_issued',
      challanAmount: violation.challanAmount || (violation.severity === 'critical' ? 50000 : violation.severity === 'high' ? 25000 : 10000),
    });

    res.json({ message: 'e-Challan generated.', challan: violation });
  } catch (error) {
    console.error('Generate challan error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.resolve = async (req, res) => {
  try {
    const violation = await Violation.findByPk(req.params.id);
    if (!violation) return res.status(404).json({ error: 'Violation not found.' });

    await violation.update({
      status: 'resolved',
      resolvedBy: req.user?.id || 'admin',
      resolvedAt: new Date(),
    });

    res.json({ message: 'Violation resolved successfully.', violation });
  } catch (error) {
    console.error('Resolve violation error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};
