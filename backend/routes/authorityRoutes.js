const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const { isSuperAdmin, checkPermission } = require('../middleware/authorization');
const authorityController = require('../controllers/authorityController');

// All authority routes require authentication
router.use(verifyToken);

// Get all authorities
router.get('/', isSuperAdmin, authorityController.getAllAuthorities);

// Create new authority
router.post('/', isSuperAdmin, authorityController.createAuthority);

// Get authority by ID
router.get('/:id', authorityController.getAuthorityById);

// Update authority
router.put('/:id', isSuperAdmin, authorityController.updateAuthority);

// Delete authority
router.delete('/:id', isSuperAdmin, authorityController.deleteAuthority);

// Assign super admin to authority
router.post('/:id/assign-admin', isSuperAdmin, authorityController.assignSuperAdminToAuthority);

module.exports = router;
