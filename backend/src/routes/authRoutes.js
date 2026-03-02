const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, adminOnly } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/firebase', authController.firebaseLogin);
router.post('/register', auth, adminOnly, authController.register);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.get('/users', auth, adminOnly, authController.getAllUsers);

module.exports = router;
