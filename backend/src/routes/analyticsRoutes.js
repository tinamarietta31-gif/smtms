const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { auth } = require('../middleware/auth');

router.get('/dashboard', auth, analyticsController.getDashboard);
router.get('/predictions', auth, analyticsController.getPredictions);

module.exports = router;
