const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const tripController = require('../controllers/tripController');

// All trip routes require authentication
router.use(verifyToken);

// Get all trips
router.get('/', tripController.getAllTrips);

// Create trip (start trip)
router.post('/', tripController.createTrip);

// Get trip by ID
router.get('/:id', tripController.getTripById);

// End trip
router.post('/:id/end', tripController.endTrip);

// Update trip location
router.put('/:id/location', tripController.updateTripLocation);

module.exports = router;
