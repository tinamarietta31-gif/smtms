const User = require('../models/User');
const Role = require('../models/Role');

// Get all members (filtered by role)
exports.getAllMembers = async (req, res) => {
  try {
    let query = {};

    // Filter by authority for non-super-admin users
    if (req.user.role.name !== 'SUPER_ADMIN') {
      query.authority = req.user.authority._id;
    }

    const members = await User.find(query)
      .populate('role')
      .populate('authority')
      .populate('assignedVehicle')
      .populate('assignedOwner', 'firstName lastName email');

    res.status(200).json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add new member
exports.addMember = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, roleId, authorityId, licenseNumber, licenseExpiry, assignedOwnerId } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password || !roleId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Get role details
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Permission checks based on current user's role
    if (req.user.role.name === 'SUPER_ADMIN') {
      // Super Admin can create any role
    } else if (req.user.role.name === 'OWNER') {
      // Owner can only create DRIVER role
      if (role.name !== 'DRIVER') {
        return res.status(403).json({
          success: false,
          message: 'Owners can only create drivers'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add members'
      });
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: roleId,
      authority: authorityId || req.user.authority._id,
      licenseNumber: role.name === 'DRIVER' ? licenseNumber : undefined,
      licenseExpiry: role.name === 'DRIVER' ? licenseExpiry : undefined,
      assignedOwner: role.name === 'DRIVER' ? assignedOwnerId || req.user._id : undefined,
      status: 'ACTIVE'
    });

    await newUser.save();
    await newUser.populate('role');
    await newUser.populate('authority');

    res.status(201).json({
      success: true,
      message: 'Member added successfully',
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get member by ID
exports.getMemberById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('role')
      .populate('authority')
      .populate('assignedVehicle')
      .populate('assignedOwner', 'firstName lastName email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Check if user has permission to view this member
    if (req.user.role.name !== 'SUPER_ADMIN' && req.user.authority._id.toString() !== user.authority._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this member'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update member
exports.updateMember = async (req, res) => {
  try {
    const { firstName, lastName, phone, licenseNumber, licenseExpiry, status } = req.body;

    const user = await User.findById(req.params.id).populate('role');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Permission checks
    if (req.user.role.name !== 'SUPER_ADMIN') {
      if (req.user._id.toString() !== user._id.toString() && req.user._id.toString() !== user.assignedOwner?.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this member'
        });
      }
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phone = phone || user.phone;
    if (user.role.name === 'DRIVER') {
      user.licenseNumber = licenseNumber || user.licenseNumber;
      user.licenseExpiry = licenseExpiry || user.licenseExpiry;
    }
    if (req.user.role.name === 'SUPER_ADMIN') {
      user.status = status || user.status;
    }
    user.updatedAt = new Date();

    await user.save();
    await user.populate('role');
    await user.populate('authority');

    res.status(200).json({
      success: true,
      message: 'Member updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove member (Super Admin only)
exports.removeMember = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get members of specific type for owner
exports.getMembersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    let query = { authority: req.user.authority._id };

    if (role === 'DRIVER') {
      query.assignedOwner = req.user._id;
    }

    const roleDoc = await Role.findOne({ name: role });
    if (roleDoc) {
      query.role = roleDoc._id;
    }

    const members = await User.find(query)
      .populate('role')
      .populate('authority')
      .populate('assignedVehicle');

    res.status(200).json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
