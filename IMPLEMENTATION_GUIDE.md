# Role-Based Access Control Implementation Guide

## Overview
This document outlines the complete implementation of role-based access control (RBAC) system for SMTMS with three distinct roles: Super Admin, Owner, and Driver.

## System Architecture

### Database Models

#### Role Model (`backend/models/Role.js`)
Defines roles and their associated permissions
- Fields: name, description, permissions array
- Roles: SUPER_ADMIN, OWNER, DRIVER

#### Authority Model (`backend/models/Authority.js`)
Represents administrative authorities
- Manages geographic boundaries and organizational hierarchy
- References super admin user
- Stores location data using PostGIS

#### User Model (`backend/models/User.js`)
Extended user model with role hierarchy
- Links to roles and authorities
- Supports hierarchical relationships (parentOwner, assignedVehicle, assignedOwner)
- Tracks login metadata

### Controllers

#### Auth Controller (`backend/controllers/authController.js`)
- `authenticate`: Login and JWT token generation
- `verifyToken`: Token validation and user verification
- Implements login tracking

#### Authority Controller (`backend/controllers/authorityController.js`)
- `getAllAuthorities`: List all authorities (Super Admin only)
- `createAuthority`: Create new authority (Super Admin only)
- `updateAuthority`: Update authority details (Super Admin only)
- `deleteAuthority`: Remove authority with validation (Super Admin only)
- `assignSuperAdminToAuthority`: Assign super admin to authority

#### Member Controller (`backend/controllers/memberController.js`)
- `getAllMembers`: List members with role-based filtering
- `addMember`: Add new member with role validation
- `getMemberById`: Retrieve individual member details
- `updateMember`: Update member information
- `removeMember`: Remove member (Super Admin only)
- `getMembersByRole`: Filter members by role

### Middleware

#### Authorization Middleware (`backend/middleware/authorization.js`)
- `checkPermission`: Verify user has required permissions
- `isSuperAdmin`: Ensure user is super admin
- `isOwner`: Ensure user is owner
- `isDriver`: Ensure user is driver

### Routes

#### Auth Routes (`backend/routes/authRoutes.js`)
- POST `/api/auth/login` — User login
- POST `/api/auth/verify` — Token verification

#### Authority Routes (`backend/routes/authorityRoutes.js`)
- GET `/api/authorities` — List all authorities
- POST `/api/authorities` — Create authority
- GET `/api/authorities/:id` — Get authority details
- PUT `/api/authorities/:id` — Update authority
- DELETE `/api/authorities/:id` — Delete authority
- POST `/api/authorities/:id/assign-admin` — Assign super admin

#### Member Routes (`backend/routes/memberRoutes.js`)
- GET `/api/members` — List members
- POST `/api/members` — Add member
- GET `/api/members/:id` — Get member details
- PUT `/api/members/:id` — Update member
- DELETE `/api/members/:id` — Remove member
- GET `/api/members/role/:role` — Get members by role

## Frontend Components

### Context (AuthContext.jsx)
- Manages authentication state globally
- Provides login/logout functions
- Implements permission checking methods
- Stores user data and JWT token

### Protected Route (ProtectedRoute.jsx)
- Wraps routes with role/permission requirements
- Redirects unauthorized users
- Supports both role and permission based access

### Components

#### Sidebar (Sidebar.jsx)
- Role-based navigation menu
- Displays logged-in user information
- Conditional menu items based on permissions

#### AddAuthorityModal (AddAuthorityModal.jsx)
- Form for creating new authorities
- Location and contact information
- Submit with API integration

#### AddMemberModal (AddMemberModal.jsx)
- Form for adding new team members
- Role selection with conditional fields
- Driver-specific fields (license, expiry)
- Password confirmation validation

### Pages

#### LoginPage (LoginPage.jsx)
- User authentication interface
- Default credentials display
- Error handling and loading states

#### AuthorityManagement (AuthorityManagement.jsx)
- List, create, update, delete authorities
- Super Admin only access
- Table view with action buttons

#### MemberManagement (MemberManagement.jsx)
- List, create, update, delete members
- Role-based permissions enforcement
- Filtered member display by authority/owner

## Installation & Setup

### Backend Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/smtms
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
PORT=5000
```

3. Run database seed:
```bash
node scripts/seedDatabase.js
```

4. Start server:
```bash
npm run dev
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000
```

3. Start development server:
```bash
npm start
```

## Permission Matrix

### Super Admin Permissions
| Action | Scope |
|--------|-------|
| ADD_AUTHORITIES | System-wide |
| REMOVE_AUTHORITIES | System-wide |
| ADD_MEMBERS | Any role, any authority |
| REMOVE_MEMBERS | Any member |
| ADD_VEHICLES | System-wide |
| REMOVE_VEHICLES | System-wide |
| VIEW_ALL_DATA | Complete visibility |
| MANAGE_ALL_RESOURCES | Full control |
| REMOTE_VEHICLE_CONTROL | All vehicles |
| CHALLAN_MANAGEMENT | All violations |
| GENERATE_REPORTS | System-wide analytics |

### Owner Permissions
| Action | Scope |
|--------|-------|
| VIEW_OWNED_DATA | Own authority resources |
| ADD_VEHICLES | Own authority |
| ADD_MEMBERS | DRIVER role only |
| MONITOR_DRIVERS | Assigned drivers only |
| VIEW_VIOLATIONS | Own vehicles/drivers |
| VIEW_CHALLANS | Own resources |

### Driver Permissions
| Action | Scope |
|--------|-------|
| VIEW_OWN_DETAILS | Own profile only |
| VIEW_ASSIGNED_VEHICLE | Assigned vehicle |
| VIEW_TRIP_DETAILS | Own trips only |
| VIEW_VIOLATIONS | Own vehicle violations |
| SUBMIT_REPORTS | Own vehicle/trips |

## API Request Examples

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smtms.gov.in","password":"admin123"}'
```

### Create Authority
```bash
curl -X POST http://localhost:5000/api/authorities \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"District Authority",
    "code":"DA_001",
    "description":"District Mining Authority",
    "location":{"city":"Bangalore","state":"Karnataka","country":"India"},
    "metadata":{"email":"contact@authority.gov.in","phone":"+91-9876543210"}
  }'
```

### Add Member
```bash
curl -X POST http://localhost:5000/api/members \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"John",
    "lastName":"Doe",
    "email":"john@example.com",
    "phone":"+91-9999999999",
    "password":"password123",
    "roleId":"role_id_here",
    "licenseNumber":"DL0123456789",
    "licenseExpiry":"2025-12-31"
  }'
```

## Security Considerations

1. **JWT Tokens**: All API endpoints (except login) require valid JWT tokens
2. **Password Hashing**: Passwords are hashed using bcrypt before storage
3. **Role Validation**: Each endpoint validates user role before processing
4. **Permission Checks**: Granular permission checks for sensitive operations
5. **Authority Scoping**: Data access limited to user's authority
6. **Account Status**: Suspended accounts cannot access the system

## Testing Checklist

- [ ] Super Admin can create/manage authorities
- [ ] Super Admin can add users of any role
- [ ] Owner can only add drivers
- [ ] Owner can only view own authority data
- [ ] Driver can only view own profile and assigned vehicle
- [ ] Unauthorized access returns 403 error
- [ ] Invalid tokens return 401 error
- [ ] Token expiration is handled correctly
- [ ] Login tracking works properly
- [ ] Account suspension prevents access

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check JWT token validity and expiration
2. **403 Forbidden**: Verify user permissions and role
3. **404 Not Found**: Ensure resource ID is correct
4. **Duplicate Email**: Check existing users before creating new ones
5. **Connection Errors**: Verify MongoDB and backend server status

## Future Enhancements

1. Two-factor authentication for Super Admin
2. Audit logging for all member actions
3. Role-based API rate limiting
4. Advanced permission customization
5. Batch member import/export
6. Activity dashboard per authority
