// Permission constants
export const PERMISSIONS = {
  ADD_AUTHORITIES: 'ADD_AUTHORITIES',
  REMOVE_AUTHORITIES: 'REMOVE_AUTHORITIES',
  ADD_MEMBERS: 'ADD_MEMBERS',
  REMOVE_MEMBERS: 'REMOVE_MEMBERS',
  ADD_VEHICLES: 'ADD_VEHICLES',
  REMOVE_VEHICLES: 'REMOVE_VEHICLES',
  VIEW_ALL_DATA: 'VIEW_ALL_DATA',
  MANAGE_ALL_RESOURCES: 'MANAGE_ALL_RESOURCES',
  REMOTE_VEHICLE_CONTROL: 'REMOTE_VEHICLE_CONTROL',
  CHALLAN_MANAGEMENT: 'CHALLAN_MANAGEMENT',
  GENERATE_REPORTS: 'GENERATE_REPORTS',
  VIEW_OWNED_DATA: 'VIEW_OWNED_DATA',
  ADD_DRIVERS: 'ADD_DRIVERS',
  MONITOR_DRIVERS: 'MONITOR_DRIVERS',
  VIEW_OWN_DETAILS: 'VIEW_OWN_DETAILS',
  VIEW_ASSIGNED_VEHICLE: 'VIEW_ASSIGNED_VEHICLE',
  VIEW_TRIP_DETAILS: 'VIEW_TRIP_DETAILS',
  VIEW_VIOLATIONS: 'VIEW_VIOLATIONS',
  SUBMIT_REPORTS: 'SUBMIT_REPORTS'
};

// Role constants
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  OWNER: 'OWNER',
  DRIVER: 'DRIVER'
};

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.ADD_AUTHORITIES,
    PERMISSIONS.REMOVE_AUTHORITIES,
    PERMISSIONS.ADD_MEMBERS,
    PERMISSIONS.REMOVE_MEMBERS,
    PERMISSIONS.ADD_VEHICLES,
    PERMISSIONS.REMOVE_VEHICLES,
    PERMISSIONS.VIEW_ALL_DATA,
    PERMISSIONS.MANAGE_ALL_RESOURCES,
    PERMISSIONS.REMOTE_VEHICLE_CONTROL,
    PERMISSIONS.CHALLAN_MANAGEMENT,
    PERMISSIONS.GENERATE_REPORTS
  ],
  [ROLES.OWNER]: [
    PERMISSIONS.VIEW_OWNED_DATA,
    PERMISSIONS.ADD_VEHICLES,
    PERMISSIONS.ADD_MEMBERS,
    PERMISSIONS.MONITOR_DRIVERS,
    PERMISSIONS.VIEW_VIOLATIONS
  ],
  [ROLES.DRIVER]: [
    PERMISSIONS.VIEW_OWN_DETAILS,
    PERMISSIONS.VIEW_ASSIGNED_VEHICLE,
    PERMISSIONS.VIEW_TRIP_DETAILS,
    PERMISSIONS.VIEW_VIOLATIONS,
    PERMISSIONS.SUBMIT_REPORTS
  ]
};

// Check if user has permission
export const hasPermission = (userPermissions, requiredPermission) => {
  return userPermissions?.includes(requiredPermission) || false;
};

// Check if user has any of the permissions
export const hasAnyPermission = (userPermissions, requiredPermissions) => {
  return requiredPermissions.some(permission => 
    userPermissions?.includes(permission)
  );
};

// Check if user has all permissions
export const hasAllPermissions = (userPermissions, requiredPermissions) => {
  return requiredPermissions.every(permission => 
    userPermissions?.includes(permission)
  );
};

// Get role display name
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [ROLES.SUPER_ADMIN]: 'Super Administrator',
    [ROLES.OWNER]: 'Owner',
    [ROLES.DRIVER]: 'Driver'
  };
  return roleNames[role] || role;
};

// Get role badge color
export const getRoleBadgeColor = (role) => {
  const colors = {
    [ROLES.SUPER_ADMIN]: 'bg-red-100 text-red-800',
    [ROLES.OWNER]: 'bg-blue-100 text-blue-800',
    [ROLES.DRIVER]: 'bg-green-100 text-green-800'
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};

// Get permission description
export const getPermissionDescription = (permission) => {
  const descriptions = {
    [PERMISSIONS.ADD_AUTHORITIES]: 'Create new authorities',
    [PERMISSIONS.REMOVE_AUTHORITIES]: 'Delete authorities',
    [PERMISSIONS.ADD_MEMBERS]: 'Add team members',
    [PERMISSIONS.REMOVE_MEMBERS]: 'Remove team members',
    [PERMISSIONS.ADD_VEHICLES]: 'Register vehicles',
    [PERMISSIONS.REMOVE_VEHICLES]: 'Deregister vehicles',
    [PERMISSIONS.VIEW_ALL_DATA]: 'View all system data',
    [PERMISSIONS.MANAGE_ALL_RESOURCES]: 'Manage all resources',
    [PERMISSIONS.REMOTE_VEHICLE_CONTROL]: 'Control vehicle remotely',
    [PERMISSIONS.CHALLAN_MANAGEMENT]: 'Manage challans',
    [PERMISSIONS.GENERATE_REPORTS]: 'Generate system reports',
    [PERMISSIONS.VIEW_OWNED_DATA]: 'View own resources',
    [PERMISSIONS.ADD_DRIVERS]: 'Add drivers',
    [PERMISSIONS.MONITOR_DRIVERS]: 'Monitor drivers',
    [PERMISSIONS.VIEW_OWN_DETAILS]: 'View own profile',
    [PERMISSIONS.VIEW_ASSIGNED_VEHICLE]: 'View assigned vehicle',
    [PERMISSIONS.VIEW_TRIP_DETAILS]: 'View trip details',
    [PERMISSIONS.VIEW_VIOLATIONS]: 'View violations',
    [PERMISSIONS.SUBMIT_REPORTS]: 'Submit reports'
  };
  return descriptions[permission] || permission;
};

export default {
  PERMISSIONS,
  ROLES,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRoleDisplayName,
  getRoleBadgeColor,
  getPermissionDescription
};
