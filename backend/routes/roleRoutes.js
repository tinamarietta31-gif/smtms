const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const { isSuperAdmin } = require('../middleware/authorization');
const roleController = require('../controllers/roleController');

// Debug logging
console.log('roleController methods:', Object.keys(roleController));

// All role routes require authentication
router.use(verifyToken);

// Get all roles (accessible to all authenticated users)
router.get('/', (req, res, next) => {
  if (!roleController.getAllRoles) {
    return res.status(500).json({ success: false, message: 'Handler not found' });
  }
  roleController.getAllRoles(req, res, next);
});

// Create new role (Super Admin only)
router.post('/', isSuperAdmin, (req, res, next) => {
  if (!roleController.createRole) {
    return res.status(500).json({ success: false, message: 'Handler not found' });
  }
  roleController.createRole(req, res, next);
});

// Get role by ID
router.get('/:id', (req, res, next) => {
  if (!roleController.getRoleById) {
    return res.status(500).json({ success: false, message: 'Handler not found' });
  }
  roleController.getRoleById(req, res, next);
});

// Update role (Super Admin only)
router.put('/:id', isSuperAdmin, (req, res, next) => {
  if (!roleController.updateRole) {
    return res.status(500).json({ success: false, message: 'Handler not found' });
  }
  roleController.updateRole(req, res, next);
});

// Delete role (Super Admin only)
router.delete('/:id', isSuperAdmin, (req, res, next) => {
  if (!roleController.deleteRole) {
    return res.status(500).json({ success: false, message: 'Handler not found' });
  }
  roleController.deleteRole(req, res, next);
});

module.exports = router;
