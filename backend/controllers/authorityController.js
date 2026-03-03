const Authority = require('../models/Authority');
const User = require('../models/User');
const Role = require('../models/Role');

// Get all authorities (Super Admin only)
exports.getAllAuthorities = async (req, res) => {
  try {
    const authorities = await Authority.find()
      .populate('superAdmin', 'firstName lastName email');

    res.status(200).json({
      success: true,
      count: authorities.length,
      data: authorities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new authority (Super Admin only)
exports.createAuthority = async (req, res) => {
  try {
    const { name, code, description, location, superAdminId, metadata } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Authority name and code are required'
      });
    }

    const existingAuthority = await Authority.findOne({
      $or: [{ name }, { code }]
    });

    if (existingAuthority) {
      return res.status(400).json({
        success: false,
        message: 'Authority with this name or code already exists'
      });
    }

    const authority = new Authority({
      name,
      code,
      description,
      location,
      superAdmin: superAdminId,
      metadata,
      status: 'ACTIVE'
    });

    await authority.save();
    await authority.populate('superAdmin', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Authority created successfully',
      data: authority
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get authority by ID
exports.getAuthorityById = async (req, res) => {
  try {
    const authority = await Authority.findById(req.params.id)
      .populate('superAdmin', 'firstName lastName email');

    if (!authority) {
      return res.status(404).json({
        success: false,
        message: 'Authority not found'
      });
    }

    res.status(200).json({
      success: true,
      data: authority
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update authority (Super Admin only)
exports.updateAuthority = async (req, res) => {
  try {
    const { name, description, location, metadata, status } = req.body;

    const authority = await Authority.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        location,
        metadata,
        status,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('superAdmin', 'firstName lastName email');

    if (!authority) {
      return res.status(404).json({
        success: false,
        message: 'Authority not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Authority updated successfully',
      data: authority
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete authority (Super Admin only)
exports.deleteAuthority = async (req, res) => {
  try {
    // Check if authority has any users
    const usersCount = await User.countDocuments({ authority: req.params.id });

    if (usersCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete authority with ${usersCount} active user(s)`
      });
    }

    const authority = await Authority.findByIdAndDelete(req.params.id);

    if (!authority) {
      return res.status(404).json({
        success: false,
        message: 'Authority not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Authority deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Assign Super Admin to authority (Super Admin only)
exports.assignSuperAdminToAuthority = async (req, res) => {
  try {
    const { superAdminId } = req.body;

    const user = await User.findById(superAdminId).populate('role');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role.name !== 'SUPER_ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'User must have SUPER_ADMIN role'
      });
    }

    const authority = await Authority.findByIdAndUpdate(
      req.params.id,
      { superAdmin: superAdminId, updatedAt: new Date() },
      { new: true }
    ).populate('superAdmin', 'firstName lastName email');

    if (!authority) {
      return res.status(404).json({
        success: false,
        message: 'Authority not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Super Admin assigned successfully',
      data: authority
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
