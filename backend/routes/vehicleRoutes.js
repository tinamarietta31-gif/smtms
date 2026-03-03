const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const { isSuperAdmin } = require('../middleware/authorization');
const vehicleController = require('../controllers/vehicleController');

// All vehicle routes require authentication
router.use(verifyToken);

// Get all vehicles
router.get('/', vehicleController.getAllVehicles);

// Create vehicle (Super Admin or Owner)
router.post('/', vehicleController.createVehicle);

// Get vehicle by ID
router.get('/:id', vehicleController.getVehicleById);

// Update vehicle
router.put('/:id', vehicleController.updateVehicle);

// Delete vehicle (Super Admin only)
router.delete('/:id', isSuperAdmin, vehicleController.deleteVehicle);

// Remote stop vehicle (Super Admin only)
router.post('/:id/stop', isSuperAdmin, vehicleController.remoteStopVehicle);

// Resume vehicle (Super Admin only)
router.post('/:id/resume', isSuperAdmin, vehicleController.resumeVehicle);

// Assign driver to vehicle
router.post('/:id/assign-driver', vehicleController.assignDriverToVehicle);

module.exports = router;
