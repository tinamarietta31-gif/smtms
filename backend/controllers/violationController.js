const Violation = require('../models/Violation');
const Challan = require('../models/Challan');
const Vehicle = require('../models/Vehicle');

// Get all violations (filtered by role)
exports.getAllViolations = async (req, res) => {
  try {
    let query = {};

    if (req.user.role.name !== 'SUPER_ADMIN') {
      query.authority = req.user.authority._id;
      
      // Owners see violations for their vehicles
      if (req.user.role.name === 'OWNER') {
        const vehicles = await Vehicle.find({ owner: req.user._id });
        const vehicleIds = vehicles.map(v => v._id);
        query.vehicle = { $in: vehicleIds };
      }
      
      // Drivers see only their violations
      if (req.user.role.name === 'DRIVER') {
        query.driver = req.user._id;
      }
    }

    const violations = await Violation.find(query)
      .populate('vehicle', 'registrationNumber')
      .populate('driver', 'firstName lastName email')
      .populate('authority', 'name code')
      .populate('challan')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      count: violations.length,
      data: violations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Report violation
exports.reportViolation = async (req, res) => {
  try {
    const { vehicleId, driverId, type, description, severity, location, evidence } = req.body;

    if (!vehicleId || !driverId || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    const violation = new Violation({
      vehicle: vehicleId,
      driver: driverId,
      authority: vehicle.authority,
      type,
      description,
      severity: severity || 'MEDIUM',
      location: {
        type: 'Point',
        coordinates: [location.lon, location.lat],
        address: location.address
      },
      evidence: evidence || [],
      status: 'PENDING'
    });

    await violation.save();
    await violation.populate('vehicle', 'registrationNumber');
    await violation.populate('driver', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Violation reported successfully',
      data: violation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get violation by ID
exports.getViolationById = async (req, res) => {
  try {
    const violation = await Violation.findById(req.params.id)
      .populate('vehicle', 'registrationNumber')
      .populate('driver', 'firstName lastName email')
      .populate('authority', 'name code')
      .populate('challan');

    if (!violation) {
      return res.status(404).json({
        success: false,
        message: 'Violation not found'
      });
    }

    // Check access
    if (req.user.role.name === 'DRIVER' && violation.driver._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this violation'
      });
    }

    res.status(200).json({
      success: true,
      data: violation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update violation status
exports.updateViolationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const violation = await Violation.findByIdAndUpdate(
      req.params.id,
      {
        status,
        notes: notes || violation.notes,
        updatedAt: new Date()
      },
      { new: true }
    )
      .populate('vehicle', 'registrationNumber')
      .populate('driver', 'firstName lastName email')
      .populate('challan');

    if (!violation) {
      return res.status(404).json({
        success: false,
        message: 'Violation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Violation status updated',
      data: violation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Generate challan for violation
exports.generateChallan = async (req, res) => {
  try {
    const { amount, reason } = req.body;

    const violation = await Violation.findById(req.params.id)
      .populate('vehicle')
      .populate('driver');

    if (!violation) {
      return res.status(404).json({
        success: false,
        message: 'Violation not found'
      });
    }

    // Check if challan already exists
    if (violation.challan) {
      return res.status(400).json({
        success: false,
        message: 'Challan already generated for this violation'
      });
    }

    // Generate challan number
    const challanNumber = `CHALLAN-${Date.now()}-${violation._id.toString().slice(-6)}`;

    const challan = new Challan({
      challanNumber,
      violation: violation._id,
      vehicle: violation.vehicle._id,
      driver: violation.driver._id,
      authority: violation.authority,
      issuedBy: req.user._id,
      amount: amount || 5000,
      reason: reason || violation.type,
      status: 'ISSUED'
    });

    await challan.save();

    // Link challan to violation
    violation.challan = challan._id;
    violation.status = 'VERIFIED';
    await violation.save();

    await challan.populate('vehicle', 'registrationNumber');
    await challan.populate('driver', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Challan generated successfully',
      data: challan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
