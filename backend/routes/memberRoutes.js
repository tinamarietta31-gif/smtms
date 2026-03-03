const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const { isSuperAdmin } = require('../middleware/authorization');
const memberController = require('../controllers/memberController');

// All member routes require authentication
router.use(verifyToken);

// Get all members
router.get('/', memberController.getAllMembers);

// Add new member
router.post('/', memberController.addMember);

// Get members by role
router.get('/role/:role', memberController.getMembersByRole);

// Get member by ID
router.get('/:id', memberController.getMemberById);

// Update member
router.put('/:id', memberController.updateMember);

// Remove member (Super Admin only)
router.delete('/:id', isSuperAdmin, memberController.removeMember);

module.exports = router;
