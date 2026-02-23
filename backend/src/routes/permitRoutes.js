const express = require('express');
const router = express.Router();
const permitController = require('../controllers/permitController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, permitController.getAll);
router.get('/:id', auth, permitController.getById);
router.post('/', auth, adminOnly, permitController.create);
router.put('/:id', auth, adminOnly, permitController.update);
router.put('/:id/revoke', auth, adminOnly, permitController.revoke);

module.exports = router;
