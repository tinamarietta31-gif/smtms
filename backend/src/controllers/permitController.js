const { Permit, Vehicle, Trip } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const permits = await Permit.findAll({
      where,
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'registrationNumber', 'ownerName'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    res.json({ permits });
  } catch (error) {
    console.error('Get permits error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const permit = await Permit.findByPk(req.params.id, {
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Trip, as: 'trips' },
      ],
    });
    if (!permit) return res.status(404).json({ error: 'Permit not found.' });
    res.json({ permit });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const permit = await Permit.create(req.body);
    res.status(201).json({ permit });
  } catch (error) {
    console.error('Create permit error:', error);
    res.status(500).json({ error: error.message || 'Server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const permit = await Permit.findByPk(req.params.id);
    if (!permit) return res.status(404).json({ error: 'Permit not found.' });
    await permit.update(req.body);
    res.json({ permit });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.revoke = async (req, res) => {
  try {
    const permit = await Permit.findByPk(req.params.id);
    if (!permit) return res.status(404).json({ error: 'Permit not found.' });
    await permit.update({ status: 'revoked' });
    res.json({ message: 'Permit revoked successfully', permit });
  } catch (error) {
    console.error('Revoke permit error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};
