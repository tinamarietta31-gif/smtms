// Role-based authorization middleware
const checkPermission = (requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const userPermissions = req.user.role.permissions || [];
    const hasPermission = requiredPermissions.some(permission =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Check if user is Super Admin
const isSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role.name !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Only Super Admin can perform this action'
    });
  }
  next();
};

// Check if user is Owner
const isOwner = (req, res, next) => {
  if (!req.user || req.user.role.name !== 'OWNER') {
    return res.status(403).json({
      success: false,
      message: 'Only Owners can perform this action'
    });
  }
  next();
};

// Check if user is Driver
const isDriver = (req, res, next) => {
  if (!req.user || req.user.role.name !== 'DRIVER') {
    return res.status(403).json({
      success: false,
      message: 'Only Drivers can perform this action'
    });
  }
  next();
};

module.exports = {
  checkPermission,
  isSuperAdmin,
  isOwner,
  isDriver
};
