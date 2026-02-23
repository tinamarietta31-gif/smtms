const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { auth } = require('../middleware/auth');

router.get('/', auth, tripController.getAll);
router.get('/:id', auth, tripController.getById);
router.post('/', auth, tripController.create);
router.put('/:id', auth, tripController.update);

module.exports = router;
