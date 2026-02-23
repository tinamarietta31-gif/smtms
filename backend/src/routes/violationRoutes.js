const express = require('express');
const router = express.Router();
const violationController = require('../controllers/violationController');
const { auth } = require('../middleware/auth');

router.get('/', auth, violationController.getAll);
router.get('/:id', auth, violationController.getById);
router.post('/', auth, violationController.create);
router.post('/:id/challan', auth, violationController.generateChallan);
router.put('/:id/resolve', auth, violationController.resolve);

module.exports = router;
