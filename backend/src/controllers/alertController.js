const { Alert, Vehicle } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { severity, isResolved } = req.query;
    const where = {};
    if (severity) where.severity = severity;
    if (isResolved !== undefined) where.isResolved = isResolved === 'true';

    const alerts = await Alert.findAll({
      where,
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'registrationNumber', 'ownerName'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    res.json({ alerts });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.resolve = async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found.' });

    await alert.update({
      isResolved: true,
      resolvedBy: req.user?.name || 'Admin',
      resolvedAt: new Date(),
      notes: req.body.notes || 'Resolved',
    });

    res.json({ message: 'Alert resolved.', alert });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};
