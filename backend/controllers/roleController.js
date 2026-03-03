const Role = require('../models/Role');

// Get all roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();

    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new role
exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name || !permissions || permissions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Role name and at least one permission are required'
      });
    }

    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role with this name already exists'
      });
    }

    // Prevent editing built-in roles
    if (['SUPER_ADMIN', 'OWNER', 'DRIVER'].includes(name)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create built-in roles'
      });
    }

    const role = new Role({
      name,
      description: description || '',
      permissions
    });

    await role.save();

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get role by ID
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update role
exports.updateRole = async (req, res) => {
  try {
    const { description, permissions } = req.body;

    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Prevent editing built-in roles
    if (['SUPER_ADMIN', 'OWNER', 'DRIVER'].includes(role.name)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify built-in roles'
      });
    }

    if (permissions && permissions.length > 0) {
      role.permissions = permissions;
    }
    if (description !== undefined) {
      role.description = description;
    }

    await role.save();

    res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: role
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete role
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Prevent deletion of built-in roles
    if (['SUPER_ADMIN', 'OWNER', 'DRIVER'].includes(role.name)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete built-in roles'
      });
    }

    // Check if any users have this role
    const User = require('../models/User');
    const usersWithRole = await User.countDocuments({ role: role._id });

    if (usersWithRole > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role. ${usersWithRole} user(s) have this role.`
      });
    }

    await Role.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
