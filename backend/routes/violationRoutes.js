const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const { isSuperAdmin } = require('../middleware/authorization');
const violationController = require('../controllers/violationController');

// All violation routes require authentication
router.use(verifyToken);

// Get all violations
router.get('/', violationController.getAllViolations);

// Report violation (Super Admin or designated authority)
router.post('/', violationController.reportViolation);

// Get violation by ID
router.get('/:id', violationController.getViolationById);

// Update violation status
router.put('/:id', violationController.updateViolationStatus);

// Generate challan for violation (Super Admin only)
router.post('/:id/challan', isSuperAdmin, violationController.generateChallan);

module.exports = router;
