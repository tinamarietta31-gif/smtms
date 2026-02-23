const express = require('express');
const router = express.Router();
const geofenceController = require('../controllers/geofenceController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, geofenceController.getAll);
router.post('/', auth, adminOnly, geofenceController.create);
router.put('/:id', auth, adminOnly, geofenceController.update);
router.delete('/:id', auth, adminOnly, geofenceController.delete);

module.exports = router;
