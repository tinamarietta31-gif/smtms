const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');

// Get all trips (filtered by role)
exports.getAllTrips = async (req, res) => {
  try {
    let query = {};

    if (req.user.role.name !== 'SUPER_ADMIN') {
      query.authority = req.user.authority._id;
      
      // Owners see only their vehicle trips
      if (req.user.role.name === 'OWNER') {
        const vehicles = await Vehicle.find({ owner: req.user._id });
        const vehicleIds = vehicles.map(v => v._id);
        query.vehicle = { $in: vehicleIds };
      }
      
      // Drivers see only their trips
      if (req.user.role.name === 'DRIVER') {
        query.driver = req.user._id;
      }
    }

    const trips = await Trip.find(query)
      .populate('vehicle', 'registrationNumber type')
      .populate('driver', 'firstName lastName email')
      .populate('authority', 'name code')
      .sort({ startTime: -1 });

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create trip
exports.createTrip = async (req, res) => {
  try {
    const { vehicleId, startLocation, quantityLoaded } = req.body;

    if (!vehicleId || !startLocation) {
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

    // Check permission
    if (req.user.role.name === 'DRIVER' && vehicle.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this vehicle'
      });
    }

    const trip = new Trip({
      vehicle: vehicleId,
      driver: vehicle.driver || req.user._id,
      authority: vehicle.authority,
      startLocation: {
        type: 'Point',
        coordinates: [startLocation.lon, startLocation.lat],
        address: startLocation.address
      },
      startTime: new Date(),
      quantityLoaded: quantityLoaded || 0,
      status: 'ACTIVE'
    });

    await trip.save();
    await trip.populate('vehicle', 'registrationNumber type');
    await trip.populate('driver', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Trip started successfully',
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get trip by ID
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicle')
      .populate('driver', 'firstName lastName email')
      .populate('authority', 'name code')
      .populate('violations');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check access
    if (req.user.role.name === 'DRIVER' && trip.driver._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this trip'
      });
    }

    if (req.user.role.name === 'OWNER') {
      const vehicle = await Vehicle.findById(trip.vehicle._id);
      if (vehicle.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this trip'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// End trip
exports.endTrip = async (req, res) => {
  try {
    const { endLocation, quantityUnloaded } = req.body;

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check permission
    if (req.user.role.name === 'DRIVER' && trip.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to end this trip'
      });
    }

    trip.endLocation = {
      type: 'Point',
      coordinates: [endLocation.lon, endLocation.lat],
      address: endLocation.address
    };
    trip.quantityUnloaded = quantityUnloaded || 0;
    trip.status = 'COMPLETED';
    trip.endTime = new Date();
    trip.updatedAt = new Date();

    await trip.save();
    await trip.populate('vehicle', 'registrationNumber type');
    await trip.populate('driver', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Trip ended successfully',
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update trip location (for live tracking)
exports.updateTripLocation = async (req, res) => {
  try {
    const { location, speed } = req.body;

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check permission
    if (req.user.role.name === 'DRIVER' && trip.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this trip'
      });
    }

    trip.lastLocation = {
      type: 'Point',
      coordinates: [location.lon, location.lat]
    };

    trip.route.push({
      timestamp: new Date(),
      location: {
        type: 'Point',
        coordinates: [location.lon, location.lat]
      },
      speed: speed || 0
    });

    trip.updatedAt = new Date();
    await trip.save();

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
