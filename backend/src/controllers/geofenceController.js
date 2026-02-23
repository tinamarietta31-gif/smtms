const { Geofence } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const { type } = req.query;
    const where = {};
    if (type) where.type = type;

    const geofences = await Geofence.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json({ geofences });
  } catch (error) {
    console.error('Get geofences error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const geofence = await Geofence.create(req.body);
    res.status(201).json({ geofence });
  } catch (error) {
    console.error('Create geofence error:', error);
    res.status(500).json({ error: error.message || 'Server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const geofence = await Geofence.findByPk(req.params.id);
    if (!geofence) return res.status(404).json({ error: 'Geofence not found.' });
    await geofence.update(req.body);
    res.json({ geofence });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const geofence = await Geofence.findByPk(req.params.id);
    if (!geofence) return res.status(404).json({ error: 'Geofence not found.' });
    await geofence.destroy();
    res.json({ message: 'Geofence deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};
