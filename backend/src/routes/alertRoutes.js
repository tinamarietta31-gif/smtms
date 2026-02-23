const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { auth } = require('../middleware/auth');

router.get('/', auth, alertController.getAll);
router.put('/:id/resolve', auth, alertController.resolve);

module.exports = router;
