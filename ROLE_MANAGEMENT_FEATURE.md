# Role Management Feature - Implementation Guide

## Overview

The Role Management feature allows Super Admins to create, manage, and customize roles with specific permissions in the SMTMS system.

---

## Components Created

### 1. Backend Controller: `roleController.js`

**Location**: `backend/controllers/roleController.js`

**Functions**:
- `getAllRoles()` - Retrieve all roles
- `createRole()` - Create new custom role
- `getRoleById()` - Get specific role details
- `updateRole()` - Update role permissions and description
- `deleteRole()` - Delete custom roles (built-in roles protected)

**Features**:
- ✅ Built-in role protection (SUPER_ADMIN, OWNER, DRIVER cannot be modified/deleted)
- ✅ Permission validation
- ✅ User count validation before deletion
- ✅ Duplicate role name prevention

### 2. Backend Routes: `roleRoutes.js`

**Location**: `backend/routes/roleRoutes.js`

**Endpoints**:
- `GET /api/roles` - Get all roles (all authenticated users)
- `POST /api/roles` - Create role (Super Admin only)
- `GET /api/roles/:id` - Get role details (all authenticated users)
- `PUT /api/roles/:id` - Update role (Super Admin only)
- `DELETE /api/roles/:id` - Delete role (Super Admin only)

**Security**:
- All routes require JWT authentication
- POST, PUT, DELETE require Super Admin role

### 3. Frontend Page: `RoleManagement.jsx`

**Location**: `frontend/src/pages/RoleManagement.jsx`

**Features**:
- List all roles with their permissions
- Create new custom roles
- Edit existing custom roles (except built-in ones)
- Delete custom roles (with user count validation)
- Permission selection with categorized grouping
- Protected Super Admin only access

**Permission Categories**:
- Authority Management
- Member Management
- Vehicle Management
- Vehicle Control
- Monitoring
- System Access
- Personal Access

### 4. Sidebar Update

**Location**: `frontend/src/components/Sidebar.jsx`

**Changes**:
- Added "Manage Roles" link for Super Admin
- Reordered navigation for better UX

---

## Available Permissions (19 Total)

### Authority Management
- `ADD_AUTHORITIES` - Create new authorities
- `REMOVE_AUTHORITIES` - Delete authorities

### Member Management
- `ADD_MEMBERS` - Add users to the system
- `REMOVE_MEMBERS` - Remove users from the system
- `ADD_DRIVERS` - Specifically add drivers

### Vehicle Management
- `ADD_VEHICLES` - Register new vehicles
- `REMOVE_VEHICLES` - Deregister vehicles

### Vehicle Control
- `REMOTE_VEHICLE_CONTROL` - Stop/resume vehicles
- `CHALLAN_MANAGEMENT` - Generate and manage e-Challans

### Monitoring
- `MONITOR_DRIVERS` - Track driver activities
- `VIEW_VIOLATIONS` - View violation reports

### System Access
- `VIEW_ALL_DATA` - Access all system data
- `MANAGE_ALL_RESOURCES` - Control all system entities
- `GENERATE_REPORTS` - Create system reports

### Personal Access
- `VIEW_OWN_DETAILS` - View own profile
- `VIEW_ASSIGNED_VEHICLE` - View assigned vehicle
- `VIEW_TRIP_DETAILS` - View trip information
- `SUBMIT_REPORTS` - Submit reports

---

## How to Use

### For Super Admin:

1. **Navigate to Role Management**
   - Click "Manage Roles" in the sidebar

2. **View Existing Roles**
   - See all system roles (SUPER_ADMIN, OWNER, DRIVER)
   - View permissions for each role
   - Built-in roles show "Built-in Role" badge

3. **Create New Role**
   - Click "Create New Role" button
   - Enter role name (e.g., "Field Inspector")
   - Enter description
   - Select desired permissions
   - Click "Create Role"

4. **Edit Custom Role**
   - Click "Edit" button on any custom role
   - Update description and permissions
   - Click "Update Role"
   - Built-in roles cannot be edited

5. **Delete Custom Role**
   - Click "Delete" button on custom role
   - System prevents deletion if users have this role
   - Built-in roles cannot be deleted

---

## Usage Example

### Creating a "Field Inspector" Role

1. Navigate to Role Management
2. Click "Create New Role"
3. Enter:
   - **Name**: Field Inspector
   - **Description**: Inspects mining sites and reports violations
   - **Permissions**: 
     - MONITOR_DRIVERS
     - VIEW_VIOLATIONS
     - SUBMIT_REPORTS
     - VIEW_TRIP_DETAILS

4. Click "Create Role"

### Creating a "Compliance Officer" Role

1. Navigate to Role Management
2. Click "Create New Role"
3. Enter:
   - **Name**: Compliance Officer
   - **Description**: Manages violations and generates e-Challans
   - **Permissions**:
     - VIEW_VIOLATIONS
     - CHALLAN_MANAGEMENT
     - VIEW_ALL_DATA
     - GENERATE_REPORTS

4. Click "Create Role"

---

## API Examples

### Get All Roles
```bash
curl -X GET http://localhost:5000/api/roles \
  -H "Authorization: Bearer {token}"
```

**Response**:
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "role_id",
      "name": "SUPER_ADMIN",
      "description": "Full system control",
      "permissions": ["ADD_AUTHORITIES", "REMOVE_AUTHORITIES", ...]
    },
    {
      "_id": "custom_role_id",
      "name": "Field Inspector",
      "description": "Inspects mining sites",
      "permissions": ["MONITOR_DRIVERS", "VIEW_VIOLATIONS", ...]
    }
  ]
}
```

### Create New Role
```bash
curl -X POST http://localhost:5000/api/roles \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Field Inspector",
    "description": "Inspects mining sites and reports violations",
    "permissions": ["MONITOR_DRIVERS", "VIEW_VIOLATIONS", "SUBMIT_REPORTS"]
  }'
```

### Update Role
```bash
curl -X PUT http://localhost:5000/api/roles/{roleId} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "permissions": ["MONITOR_DRIVERS", "VIEW_VIOLATIONS", "SUBMIT_REPORTS", "VIEW_TRIP_DETAILS"]
  }'
```

### Delete Role
```bash
curl -X DELETE http://localhost:5000/api/roles/{roleId} \
  -H "Authorization: Bearer {token}"
```

---

## Security Features

✅ **Built-in Role Protection**
- SUPER_ADMIN, OWNER, DRIVER cannot be modified or deleted
- System prevents accidental changes to core roles

✅ **Super Admin Only**
- Only Super Admin can create, edit, delete roles
- Frontend enforces permission checks
- Backend validates authorization

✅ **User Validation**
- Cannot delete roles that have assigned users
- System counts users before deletion

✅ **Permission Validation**
- At least one permission required
- Invalid permissions are rejected
- Category-based organization prevents confusion

---

## Workflow Example

### Step-by-Step: Create Custom Role for Violations Team

1. Super Admin navigates to "Manage Roles"
2. Current roles displayed (SUPER_ADMIN, OWNER, DRIVER)
3. Clicks "Create New Role"
4. Modal opens with form
5. Enters:
   - Name: "Violations Officer"
   - Description: "Handles violation reports and challan generation"
6. Selects permissions:
   - VIEW_VIOLATIONS (Monitoring category)
   - CHALLAN_MANAGEMENT (Vehicle Control category)
   - MONITOR_DRIVERS (Monitoring category)
   - VIEW_TRIP_DETAILS (Personal Access category)
7. Clicks "Create Role"
8. Success message appears
9. New role appears in list with all selected permissions
10. Can now assign this role to team members

---

## Best Practices

1. **Name Roles by Function**
   - Good: "Field Inspector", "Compliance Officer"
   - Avoid: "Role1", "Custom", "Temp"

2. **Use Descriptive Descriptions**
   - Explain role purpose and key responsibilities
   - Helps team understand role assignments

3. **Assign Minimum Permissions**
   - Grant only permissions needed for role
   - Principle of least privilege

4. **Review Regularly**
   - Periodically audit custom roles
   - Remove unused roles
   - Update permissions as needed

5. **Document Custom Roles**
   - Keep record of all custom roles created
   - Document permission logic
   - Maintain in team wiki/documentation

---

## Testing

### Test Scenarios

1. **Create Role**
   - [ ] Create role with valid name and permissions
   - [ ] Try create with empty name (should fail)
   - [ ] Try create with no permissions (should fail)
   - [ ] Try create duplicate name (should fail)

2. **Update Role**
   - [ ] Update permissions successfully
   - [ ] Update description successfully
   - [ ] Try update built-in role (should be prevented)

3. **Delete Role**
   - [ ] Delete unused custom role
   - [ ] Try delete role with assigned users (should fail)
   - [ ] Try delete built-in role (should be prevented)

4. **Access Control**
   - [ ] Non-Super Admin cannot access role management
   - [ ] Frontend shows only Super Admin has access
   - [ ] API returns 403 for non-Super Admin

5. **Permission Display**
   - [ ] All permissions show correctly
   - [ ] Permissions grouped by category
   - [ ] Can select/deselect permissions

---

## Troubleshooting

### Role Creation Fails
**Problem**: Cannot create role
**Solution**: 
1. Check role name is unique
2. Ensure at least one permission selected
3. Verify Super Admin status
4. Check backend logs

### Cannot Delete Role
**Problem**: Delete button disabled or error
**Solution**:
1. Check if any users have this role
2. Reassign users to different role first
3. Then delete the role
4. Built-in roles cannot be deleted

### Permissions Not Showing
**Problem**: Permission list empty
**Solution**:
1. Refresh page
2. Clear browser cache
3. Check backend connection
4. Verify JWT token valid

---

## Future Enhancements

- [ ] Role templates (pre-configured role sets)
- [ ] Permission dependency management
- [ ] Role change audit logging
- [ ] Permission inheritance/hierarchies
- [ ] Bulk role operations
- [ ] Role versioning and rollback

---

## Integration Points

The Role Management system integrates with:
- **Member Management** - Assign roles when adding members
- **Authority Management** - Different roles per authority
- **API Endpoints** - All endpoints check user's role permissions
- **Dashboard** - Shows role-specific information
- **Logging** - Track role changes

---

## Conclusion

The Role Management feature gives Super Admins complete flexibility to create custom roles tailored to their organization's needs while protecting built-in core roles and ensuring security through proper validation and authorization checks.

---

**Version**: 1.0.0  
**Status**: ✅ Complete & Ready for Use
