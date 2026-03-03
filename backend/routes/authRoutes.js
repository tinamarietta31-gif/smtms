const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login route
router.post('/login', authController.authenticate);

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
