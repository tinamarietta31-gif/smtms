const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// Get all vehicles (filtered by role)
exports.getAllVehicles = async (req, res) => {
  try {
    let query = {};

    // Filter by authority for non-super-admin users
    if (req.user.role.name !== 'SUPER_ADMIN') {
      query.authority = req.user.authority._id;
      
      // Owners see only their vehicles
      if (req.user.role.name === 'OWNER') {
        query.owner = req.user._id;
      }
      
      // Drivers see only their assigned vehicle
      if (req.user.role.name === 'DRIVER') {
        query.driver = req.user._id;
      }
    }

    const vehicles = await Vehicle.find(query)
      .populate('owner', 'firstName lastName email')
      .populate('driver', 'firstName lastName email')
      .populate('authority', 'name code');

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create vehicle (Super Admin or Owner)
exports.createVehicle = async (req, res) => {
  try {
    const { registrationNumber, type, capacity, metadata } = req.body;

    if (!registrationNumber || !type || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check duplicate registration
    const existingVehicle = await Vehicle.findOne({ registrationNumber });
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle with this registration number already exists'
      });
    }

    // Check if user has permission
    if (req.user.role.name !== 'SUPER_ADMIN' && req.user.role.name !== 'OWNER') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add vehicles'
      });
    }

    const vehicle = new Vehicle({
      registrationNumber,
      type,
      capacity,
      metadata,
      owner: req.user.role.name === 'OWNER' ? req.user._id : req.body.ownerId,
      authority: req.user.role.name === 'OWNER' ? req.user.authority._id : req.body.authorityId,
      status: 'ACTIVE'
    });

    await vehicle.save();
    await vehicle.populate('owner', 'firstName lastName email');
    await vehicle.populate('authority', 'name code');

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('owner', 'firstName lastName email')
      .populate('driver', 'firstName lastName email')
      .populate('authority', 'name code');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check access permissions
    if (req.user.role.name === 'OWNER' && req.user._id.toString() !== vehicle.owner._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this vehicle'
      });
    }

    if (req.user.role.name === 'DRIVER' && req.user._id.toString() !== vehicle.driver?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this vehicle'
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update vehicle (Super Admin or Owner)
exports.updateVehicle = async (req, res) => {
  try {
    const { driver, status, metadata } = req.body;

    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check permissions
    if (req.user.role.name === 'OWNER' && req.user._id.toString() !== vehicle.owner.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this vehicle'
      });
    }

    if (driver) {
      vehicle.driver = driver;
    }
    if (status && req.user.role.name === 'SUPER_ADMIN') {
      vehicle.status = status;
    }
    if (metadata) {
      vehicle.metadata = { ...vehicle.metadata, ...metadata };
    }

    vehicle.updatedAt = new Date();
    await vehicle.save();
    await vehicle.populate('owner', 'firstName lastName email');
    await vehicle.populate('driver', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete vehicle (Super Admin only)
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remote stop vehicle (Super Admin only)
exports.remoteStopVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { 
        isRemoteStopped: true,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // TODO: Integrate with ECM API to actually stop the vehicle
    
    res.status(200).json({
      success: true,
      message: 'Vehicle stop command issued',
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Resume vehicle (Super Admin only)
exports.resumeVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { 
        isRemoteStopped: false,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // TODO: Integrate with ECM API to resume the vehicle
    
    res.status(200).json({
      success: true,
      message: 'Vehicle resume command issued',
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Assign driver to vehicle (Owner or Super Admin)
exports.assignDriverToVehicle = async (req, res) => {
  try {
    const { driverId } = req.body;

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check permissions
    if (req.user.role.name === 'OWNER' && req.user._id.toString() !== vehicle.owner.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this vehicle'
      });
    }

    const driver = await User.findById(driverId).populate('role');
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    if (driver.role.name !== 'DRIVER') {
      return res.status(400).json({
        success: false,
        message: 'User must be a driver'
      });
    }

    vehicle.driver = driverId;
    vehicle.updatedAt = new Date();
    await vehicle.save();
    await vehicle.populate('driver', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Driver assigned successfully',
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
