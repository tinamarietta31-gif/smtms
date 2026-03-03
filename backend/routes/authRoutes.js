const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Debug: Check if authController exists and has methods
console.log('authController.login type:', typeof authController.login);
console.log('authController.register type:', typeof authController.register);

// Public routes - Login
router.post('/login', async (req, res) => {
  try {
    if (!authController || !authController.login) {
      return res.status(500).json({
        success: false,
        message: 'Authentication handler not configured'
      });
    }
    await authController.login(req, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Public routes - Register
router.post('/register', async (req, res) => {
  try {
    if (!authController || !authController.register) {
      return res.status(500).json({
        success: false,
        message: 'Register handler not configured'
      });
    }
    await authController.register(req, res);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Verify token route
router.post('/verify', authController.verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: {
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      role: req.user.role.name,
      authority: req.user.authority.name,
      permissions: req.user.role.permissions
    }
  });
});

module.exports = router;
