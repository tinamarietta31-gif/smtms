const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const { isSuperAdmin } = require('../middleware/authorization');
const roleController = require('../controllers/roleController');

// All role routes require authentication
router.use(verifyToken);

// Get all roles (accessible to all authenticated users)
router.get('/', roleController.getAllRoles);

// Create new role (Super Admin only)
router.post('/', isSuperAdmin, roleController.createRole);

// Get role by ID
router.get('/:id', roleController.getRoleById);

// Update role (Super Admin only)
router.put('/:id', isSuperAdmin, roleController.updateRole);

// Delete role (Super Admin only)
router.delete('/:id', isSuperAdmin, roleController.deleteRole);

module.exports = router;
