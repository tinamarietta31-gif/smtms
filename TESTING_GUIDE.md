# RBAC Testing Guide

## Test Environment Setup

Before running tests, ensure:
1. MongoDB is running
2. Backend server is running on port 5000
3. Frontend is running on port 3000
4. Database has been seeded with `node scripts/seedDatabase.js`

## Test Scenarios

### 1. Authentication Tests

#### Test 1.1: Super Admin Login
```
Endpoint: POST /api/auth/login
Input: 
{
  "email": "admin@smtms.gov.in",
  "password": "admin123"
}
Expected Output:
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "role": "SUPER_ADMIN",
    "permissions": ["ADD_AUTHORITIES", ...]
  }
}
Status: 200
```

#### Test 1.2: Invalid Credentials
```
Endpoint: POST /api/auth/login
Input: 
{
  "email": "admin@smtms.gov.in",
  "password": "wrongpassword"
}
Expected Status: 401
Expected Message: "Invalid credentials"
```

#### Test 1.3: Token Verification
```
Endpoint: POST /api/auth/verify
Headers: Authorization: Bearer {token}
Expected Output:
{
  "success": true,
  "message": "Token is valid",
  "user": {...}
}
Status: 200
```

#### Test 1.4: Expired/Invalid Token
```
Endpoint: POST /api/auth/verify
Headers: Authorization: Bearer invalid_token
Expected Status: 401
Expected Message: "Invalid or expired token"
```

---

### 2. Authority Management Tests (Super Admin Only)

#### Test 2.1: Create Authority
```
Endpoint: POST /api/authorities
Headers: Authorization: Bearer {super_admin_token}
Input:
{
  "name": "Test Authority",
  "code": "TEST_001",
  "description": "Test Authority for Mining Operations",
  "location": {
    "city": "Bangalore",
    "state": "Karnataka",
    "country": "India"
  },
  "metadata": {
    "email": "test@authority.gov.in",
    "phone": "+91-9876543210"
  }
}
Expected Status: 201
Expected: Authority created with ID
```

#### Test 2.2: Create Authority - Missing Required Fields
```
Endpoint: POST /api/authorities
Headers: Authorization: Bearer {super_admin_token}
Input: {"description": "No name or code"}
Expected Status: 400
Expected Message: "Authority name and code are required"
```

#### Test 2.3: Create Authority - Duplicate Code
```
Endpoint: POST /api/authorities
Headers: Authorization: Bearer {super_admin_token}
Input: {"name": "Another", "code": "TEST_001"}
Expected Status: 400
Expected Message: "Authority with this name or code already exists"
```

#### Test 2.4: Get All Authorities
```
Endpoint: GET /api/authorities
Headers: Authorization: Bearer {super_admin_token}
Expected Status: 200
Expected: Array of authority objects
```

#### Test 2.5: Update Authority
```
Endpoint: PUT /api/authorities/{authority_id}
Headers: Authorization: Bearer {super_admin_token}
Input:
{
  "name": "Updated Authority",
  "description": "Updated description"
}
Expected Status: 200
Expected: Updated authority object
```

#### Test 2.6: Delete Authority
```
Endpoint: DELETE /api/authorities/{authority_id}
Headers: Authorization: Bearer {super_admin_token}
Expected Status: 200
Expected Message: "Authority deleted successfully"
```

#### Test 2.7: Delete Authority With Members (Should Fail)
```
Endpoint: DELETE /api/authorities/{authority_id_with_members}
Headers: Authorization: Bearer {super_admin_token}
Expected Status: 400
Expected Message: "Cannot delete authority with X active user(s)"
```

#### Test 2.8: Owner Cannot Create Authority
```
Endpoint: POST /api/authorities
Headers: Authorization: Bearer {owner_token}
Input: {authority data}
Expected Status: 403
Expected Message: "Only Super Admin can perform this action"
```

---

### 3. Member Management Tests

#### Test 3.1: Super Admin Creates Owner
```
Endpoint: POST /api/members
Headers: Authorization: Bearer {super_admin_token}
Input:
{
  "firstName": "Test",
  "lastName": "Owner",
  "email": "owner@test.gov.in",
  "phone": "+91-9876543210",
  "password": "ownerpass123",
  "roleId": {owner_role_id},
  "authorityId": {authority_id}
}
Expected Status: 201
Expected: New user object with role OWNER
```

#### Test 3.2: Super Admin Creates Driver
```
Endpoint: POST /api/members
Headers: Authorization: Bearer {super_admin_token}
Input:
{
  "firstName": "Test",
  "lastName": "Driver",
  "email": "driver@test.gov.in",
  "phone": "+91-9876543210",
  "password": "driverpass123",
  "roleId": {driver_role_id},
  "licenseNumber": "DL0123456789",
  "licenseExpiry": "2025-12-31"
}
Expected Status: 201
Expected: New driver object
```

#### Test 3.3: Owner Creates Driver
```
Endpoint: POST /api/members
Headers: Authorization: Bearer {owner_token}
Input:
{
  "firstName": "Test",
  "lastName": "Driver",
  "email": "driver2@test.gov.in",
  "phone": "+91-9876543211",
  "password": "driverpass123",
  "roleId": {driver_role_id},
  "licenseNumber": "DL9876543210",
  "licenseExpiry": "2025-12-31"
}
Expected Status: 201
Expected: New driver assigned to this owner
```

#### Test 3.4: Owner Cannot Create Another Owner
```
Endpoint: POST /api/members
Headers: Authorization: Bearer {owner_token}
Input: {owner data}
Expected Status: 403
Expected Message: "Owners can only create drivers"
```

#### Test 3.5: Super Admin Lists All Members
```
Endpoint: GET /api/members
Headers: Authorization: Bearer {super_admin_token}
Expected Status: 200
Expected: All members across all authorities
```

#### Test 3.6: Owner Lists Own Members
```
Endpoint: GET /api/members
Headers: Authorization: Bearer {owner_token}
Expected Status: 200
Expected: Only members from owner's authority
```

#### Test 3.7: Get Member by ID
```
Endpoint: GET /api/members/{member_id}
Headers: Authorization: Bearer {super_admin_token}
Expected Status: 200
Expected: Member details
```

#### Test 3.8: Owner Cannot View Other Authority Members
```
Endpoint: GET /api/members/{other_authority_member_id}
Headers: Authorization: Bearer {owner_token}
Expected Status: 403
Expected Message: "You do not have permission to view this member"
```

#### Test 3.9: Update Member
```
Endpoint: PUT /api/members/{member_id}
Headers: Authorization: Bearer {super_admin_token}
Input:
{
  "firstName": "Updated",
  "phone": "+91-1111111111"
}
Expected Status: 200
Expected: Updated member object
```

#### Test 3.10: Remove Member (Super Admin Only)
```
Endpoint: DELETE /api/members/{member_id}
Headers: Authorization: Bearer {super_admin_token}
Expected Status: 200
Expected Message: "Member removed successfully"
```

#### Test 3.11: Owner Cannot Remove Member
```
Endpoint: DELETE /api/members/{member_id}
Headers: Authorization: Bearer {owner_token}
Expected Status: 403
Expected Message: "Only Super Admin can perform this action"
```

---

### 4. Permission-Based Access Tests

#### Test 4.1: Missing Authorization Header
```
Endpoint: GET /api/authorities
Headers: (no Authorization header)
Expected Status: 401
Expected Message: "No token provided"
```

#### Test 4.2: Malformed Authorization Header
```
Endpoint: GET /api/authorities
Headers: Authorization: InvalidFormat
Expected Status: 401
Expected Message: "Invalid or expired token"
```

#### Test 4.3: Driver Accesses Super Admin Only Endpoint
```
Endpoint: POST /api/authorities
Headers: Authorization: Bearer {driver_token}
Input: {authority data}
Expected Status: 403
Expected Message: "Only Super Admin can perform this action"
```

#### Test 4.4: Driver Permission Check
```
Endpoint: GET /api/members
Headers: Authorization: Bearer {driver_token}
Expected Status: 200
Expected: Only own details (if endpoint supports it)
```

---

### 5. Role-Based Access Tests

#### Test 5.1: Super Admin Can Access All Resources
```
✓ Can create authorities
✓ Can create any role members
✓ Can view all data
✓ Can remove members
✓ Can manage vehicles
```

#### Test 5.2: Owner Can Access Limited Resources
```
✓ Can add drivers
✓ Can view own authority resources
✓ Cannot create other owners
✓ Cannot remove members
✓ Cannot create authorities
```

#### Test 5.3: Driver Can Only Access Own Data
```
✓ Can view own profile
✓ Can view assigned vehicle
✓ Cannot view other drivers
✓ Cannot create members
✓ Cannot manage vehicles
```

---

### 6. Data Consistency Tests

#### Test 6.1: Authority-Member Association
```
Create authority A
Create owner O1 in authority A
Create owner O2 in authority B
Verify: O1 can only see O1's authority
Verify: O2 can only see O2's authority
Verify: Super Admin sees both
```

#### Test 6.2: Owner-Driver Relationship
```
Create owner O
Create drivers D1, D2 under O
Verify: D1 and D2 are linked to O
Verify: Other owners cannot see D1, D2
Verify: D1 cannot see D2
```

#### Test 6.3: Role Permissions Persistence
```
Retrieve super admin role
Verify permissions array contains all required permissions
Retrieve owner role
Verify permissions array matches specification
Retrieve driver role
Verify permissions array matches specification
```

---

### 7. Error Handling Tests

#### Test 7.1: Duplicate Email
```
Endpoint: POST /api/members
Input: {"email": "existing@email.com", ...}
Expected Status: 400
Expected Message: "Email already exists"
```

#### Test 7.2: Invalid Role ID
```
Endpoint: POST /api/members
Input: {"roleId": "invalid_role_id", ...}
Expected Status: 404
Expected Message: "Role not found"
```

#### Test 7.3: Missing Required Fields
```
Endpoint: POST /api/members
Input: {"firstName": "Test"} (missing other fields)
Expected Status: 400
Expected Message: "Missing required fields"
```

#### Test 7.4: Password Mismatch
```
Frontend AddMemberModal:
Input: password="123456", confirmPassword="654321"
Expected: Error message on form submission
```

---

### 8. Frontend Component Tests

#### Test 8.1: LoginPage
```
✓ Form displays correctly
✓ Login button works
✓ Error messages display for invalid credentials
✓ Success redirects to dashboard
```

#### Test 8.2: Sidebar Navigation
```
✓ Super Admin sees all menu items
✓ Owner sees member and vehicle menu
✓ Driver sees limited menu
✓ Logout button works
```

#### Test 8.3: ProtectedRoute
```
✓ Redirects unauthenticated users to login
✓ Allows authenticated users with correct role
✓ Blocks users without required permissions
```

#### Test 8.4: AuthorityManagement Page
```
✓ Super Admin can create authority
✓ Authority list displays
✓ Can edit authority
✓ Can delete authority
```

#### Test 8.5: MemberManagement Page
```
✓ Can add new member
✓ Member list displays with correct data
✓ Can edit member details
✓ Super Admin can remove members
✓ Owner cannot remove members
```

---

## Performance Tests

### Test 9.1: List Performance
```
Create 1000 members in database
Measure: GET /api/members response time
Expected: < 500ms
```

### Test 9.2: Search Performance
```
Query: GET /api/members?authority={id}
Expected: < 300ms for 1000 records
```

### Test 9.3: Concurrent Requests
```
Send 100 simultaneous requests
Expected: All succeed without database conflicts
```

---

## Security Tests

### Test 10.1: SQL Injection
```
Input: email: "admin' OR '1'='1"
Expected: Properly escaped, no injection
```

### Test 10.2: XSS Prevention
```
Input: firstName: "<script>alert('xss')</script>"
Expected: Stored safely, rendered as text
```

### Test 10.3: CSRF Protection
```
Verify: POST requests require proper headers
Expected: Unauthorized CSRF attempts rejected
```

---

## Test Execution Checklist

- [ ] All 4 authentication tests pass
- [ ] All 8 authority management tests pass
- [ ] All 11 member management tests pass
- [ ] All 4 permission-based access tests pass
- [ ] All 3 role-based access tests pass
- [ ] All 3 data consistency tests pass
- [ ] All 4 error handling tests pass
- [ ] All 5 frontend component tests pass
- [ ] All 3 performance tests acceptable
- [ ] All 3 security tests pass

## Test Automation

Create test file: `backend/tests/rbac.test.js`
```bash
npm test
```

## Reporting Issues

Document:
1. Test name and number
2. Steps to reproduce
3. Expected vs actual behavior
4. Screenshots/logs if applicable
5. Environment details (Node version, MongoDB version, etc.)
