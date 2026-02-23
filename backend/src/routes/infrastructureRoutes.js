const express = require('express');
const router = express.Router();
const infraController = require('../controllers/infrastructureController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, infraController.getAllInfrastructure);
router.get('/stats', auth, infraController.getStats);
router.post('/seed', auth, adminOnly, infraController.seedInfrastructure);
router.get('/logs', auth, infraController.getInfraLogs);
router.post('/detect', auth, infraController.recordDetection);
router.get('/cross-verify', auth, infraController.crossVerify);

module.exports = router;
