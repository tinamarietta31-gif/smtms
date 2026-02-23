const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, vehicleController.getAll);
router.get('/:id', auth, vehicleController.getById);
router.post('/', auth, adminOnly, vehicleController.create);
router.put('/:id', auth, adminOnly, vehicleController.update);
router.delete('/:id', auth, adminOnly, vehicleController.delete);
router.post('/:id/stop', auth, vehicleController.stopVehicle);
router.post('/:id/resume', auth, vehicleController.resumeVehicle);

module.exports = router;
