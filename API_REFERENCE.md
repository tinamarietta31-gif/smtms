# API Documentation - Complete Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except login) require JWT token in Authorization header:
```
Authorization: Bearer {token}
```

---

## Authentication Endpoints

### 1. Login
**POST** `/auth/login`

**Description**: User login with email and password

**Request Body**:
```json
{
  "email": "admin@smtms.gov.in",
  "password": "admin123"
}
```

**Response** (200):
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "user_id",
    "firstName": "Super",
    "lastName": "Admin",
    "email": "admin@smtms.gov.in",
    "role": "SUPER_ADMIN",
    "authority": "Authority Name",
    "permissions": ["ADD_AUTHORITIES", "REMOVE_AUTHORITIES", ...]
  }
}
```

### 2. Verify Token
**POST** `/auth/verify`

**Description**: Verify JWT token validity

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Token is valid",
  "user": {...}
}
```

**Error Response** (401):
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

## Authority Management Endpoints

### 3. Get All Authorities
**GET** `/authorities`

**Permission Required**: `ADD_AUTHORITIES` (Super Admin only)

**Query Parameters**:
- None

**Response** (200):
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "auth_id",
      "name": "Test Authority",
      "code": "TEST_001",
      "description": "Test Authority for Mining",
      "location": {
        "city": "Bangalore",
        "state": "Karnataka",
        "country": "India",
        "coordinates": {
          "type": "Point",
          "coordinates": [77.2090, 28.6139]
        }
      },
      "superAdmin": {
        "_id": "user_id",
        "firstName": "Admin",
        "lastName": "User"
      },
      "status": "ACTIVE",
      "metadata": {
        "email": "admin@authority.gov.in",
        "phone": "+91-1234567890"
      },
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### 4. Create Authority
**POST** `/authorities`

**Permission Required**: `ADD_AUTHORITIES` (Super Admin only)

**Request Body**:
```json
{
  "name": "New Authority",
  "code": "NEW_001",
  "description": "New mining authority",
  "superAdminId": "user_id",
  "location": {
    "address": "123 Main St",
    "city": "Bangalore",
    "state": "Karnataka",
    "country": "India",
    "coordinates": {
      "type": "Point",
      "coordinates": [77.2090, 28.6139]
    }
  },
  "metadata": {
    "email": "contact@authority.gov.in",
    "phone": "+91-1234567890",
    "website": "https://authority.gov.in"
  }
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Authority created successfully",
  "data": {...}
}
```

### 5. Get Authority by ID
**GET** `/authorities/:id`

**Parameters**:
- `id` (string): Authority ID

**Response** (200):
```json
{
  "success": true,
  "data": {...}
}
```

### 6. Update Authority
**PUT** `/authorities/:id`

**Permission Required**: `ADD_AUTHORITIES` (Super Admin only)

**Request Body**:
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "status": "ACTIVE",
  "metadata": {...}
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Authority updated successfully",
  "data": {...}
}
```

### 7. Delete Authority
**DELETE** `/authorities/:id`

**Permission Required**: `REMOVE_AUTHORITIES` (Super Admin only)

**Response** (200):
```json
{
  "success": true,
  "message": "Authority deleted successfully"
}
```

### 8. Assign Super Admin to Authority
**POST** `/authorities/:id/assign-admin`

**Permission Required**: `ADD_AUTHORITIES` (Super Admin only)

**Request Body**:
```json
{
  "superAdminId": "user_id"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Super Admin assigned successfully",
  "data": {...}
}
```

---

## Member Management Endpoints

### 9. Get All Members
**GET** `/members`

**Query Parameters**:
- None (filtered by user's authority)

**Response** (200):
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "member_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+91-9876543210",
      "role": {
        "_id": "role_id",
        "name": "DRIVER"
      },
      "authority": {
        "_id": "auth_id",
        "name": "Test Authority"
      },
      "status": "ACTIVE",
      "licenseNumber": "DL0123456789",
      "licenseExpiry": "2025-12-31",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### 10. Add Member
**POST** `/members`

**Permission Required**: 
- Super Admin: Any role
- Owner: DRIVER role only

**Request Body**:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+91-9876543211",
  "password": "password123",
  "roleId": "role_id",
  "authorityId": "auth_id",
  "licenseNumber": "DL9876543210",
  "licenseExpiry": "2025-12-31"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Member added successfully",
  "data": {...}
}
```

### 11. Get Member by ID
**GET** `/members/:id`

**Parameters**:
- `id` (string): Member ID

**Response** (200):
```json
{
  "success": true,
  "data": {...}
}
```

### 12. Update Member
**PUT** `/members/:id`

**Request Body**:
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "phone": "+91-1111111111",
  "licenseNumber": "NEW_LICENSE",
  "licenseExpiry": "2026-12-31"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Member updated successfully",
  "data": {...}
}
```

### 13. Remove Member
**DELETE** `/members/:id`

**Permission Required**: `REMOVE_MEMBERS` (Super Admin only)

**Response** (200):
```json
{
  "success": true,
  "message": "Member removed successfully"
}
```

### 14. Get Members by Role
**GET** `/members/role/:role`

**Parameters**:
- `role` (string): Role name (SUPER_ADMIN, OWNER, DRIVER)

**Response** (200):
```json
{
  "success": true,
  "count": 3,
  "data": [...]
}
```

---

## Vehicle Management Endpoints

### 15. Get All Vehicles
**GET** `/vehicles`

**Response** (200):
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "vehicle_id",
      "registrationNumber": "KA-01-AB-1234",
      "type": "TRUCK",
      "capacity": 25,
      "status": "ACTIVE",
      "isRemoteStopped": false,
      "owner": {
        "_id": "user_id",
        "firstName": "Owner",
        "lastName": "Name"
      },
      "driver": {
        "_id": "driver_id",
        "firstName": "Driver",
        "lastName": "Name"
      },
      "authority": {
        "_id": "auth_id",
        "name": "Authority Name"
      },
      "metadata": {
        "manufacturer": "Tata",
        "yearOfManufacture": 2020,
        "insuranceExpiry": "2025-06-30",
        "fitnessCertificateExpiry": "2025-06-30"
      },
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### 16. Create Vehicle
**POST** `/vehicles`

**Permission Required**: `ADD_VEHICLES` (Super Admin or Owner)

**Request Body**:
```json
{
  "registrationNumber": "KA-01-AB-5678",
  "type": "TRUCK",
  "capacity": 25,
  "ownerId": "user_id",
  "authorityId": "auth_id",
  "metadata": {
    "manufacturer": "Tata",
    "yearOfManufacture": 2022,
    "insuranceExpiry": "2025-12-31",
    "fitnessCertificateExpiry": "2025-12-31"
  }
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Vehicle created successfully",
  "data": {...}
}
```

### 17. Get Vehicle by ID
**GET** `/vehicles/:id`

**Response** (200):
```json
{
  "success": true,
  "data": {...}
}
```

### 18. Update Vehicle
**PUT** `/vehicles/:id`

**Request Body**:
```json
{
  "driver": "driver_id",
  "status": "MAINTENANCE",
  "metadata": {...}
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Vehicle updated successfully",
  "data": {...}
}
```

### 19. Delete Vehicle
**DELETE** `/vehicles/:id`

**Permission Required**: `REMOVE_VEHICLES` (Super Admin only)

**Response** (200):
```json
{
  "success": true,
  "message": "Vehicle deleted successfully"
}
```

### 20. Remote Stop Vehicle
**POST** `/vehicles/:id/stop`

**Permission Required**: `REMOTE_VEHICLE_CONTROL` (Super Admin only)

**Response** (200):
```json
{
  "success": true,
  "message": "Vehicle stop command issued",
  "data": {...}
}
```

### 21. Resume Vehicle
**POST** `/vehicles/:id/resume`

**Permission Required**: `REMOTE_VEHICLE_CONTROL` (Super Admin only)

**Response** (200):
```json
{
  "success": true,
  "message": "Vehicle resume command issued",
  "data": {...}
}
```

### 22. Assign Driver to Vehicle
**POST** `/vehicles/:id/assign-driver`

**Request Body**:
```json
{
  "driverId": "driver_id"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Driver assigned successfully",
  "data": {...}
}
```

---

## Trip Management Endpoints

### 23. Get All Trips
**GET** `/trips`

**Response** (200):
```json
{
  "success": true,
  "count": 15,
  "data": [...]
}
```

### 24. Create Trip
**POST** `/trips`

**Request Body**:
```json
{
  "vehicleId": "vehicle_id",
  "startLocation": {
    "lat": 28.6139,
    "lon": 77.2090,
    "address": "Starting point"
  },
  "quantityLoaded": 20
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Trip started successfully",
  "data": {...}
}
```

### 25. Get Trip by ID
**GET** `/trips/:id`

**Response** (200):
```json
{
  "success": true,
  "data": {...}
}
```

### 26. End Trip
**POST** `/trips/:id/end`

**Request Body**:
```json
{
  "endLocation": {
    "lat": 28.6200,
    "lon": 77.2200,
    "address": "Ending point"
  },
  "quantityUnloaded": 20
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Trip ended successfully",
  "data": {...}
}
```

### 27. Update Trip Location
**PUT** `/trips/:id/location`

**Request Body**:
```json
{
  "location": {
    "lat": 28.6150,
    "lon": 77.2100
  },
  "speed": 60
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {...}
}
```

---

## Violation Management Endpoints

### 28. Get All Violations
**GET** `/violations`

**Response** (200):
```json
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

### 29. Report Violation
**POST** `/violations`

**Request Body**:
```json
{
  "vehicleId": "vehicle_id",
  "driverId": "driver_id",
  "type": "OVERLOADING",
  "description": "Vehicle exceeds capacity",
  "severity": "HIGH",
  "location": {
    "lat": 28.6139,
    "lon": 77.2090,
    "address": "Highway NH1"
  },
  "evidence": ["photo_url_1", "photo_url_2"]
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Violation reported successfully",
  "data": {...}
}
```

### 30. Get Violation by ID
**GET** `/violations/:id`

**Response** (200):
```json
{
  "success": true,
  "data": {...}
}
```

### 31. Update Violation Status
**PUT** `/violations/:id`

**Request Body**:
```json
{
  "status": "VERIFIED",
  "notes": "Violation verified by authorities"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Violation status updated",
  "data": {...}
}
```

### 32. Generate Challan
**POST** `/violations/:id/challan`

**Permission Required**: `CHALLAN_MANAGEMENT` (Super Admin only)

**Request Body**:
```json
{
  "amount": 5000,
  "reason": "Vehicle overloading"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Challan generated successfully",
  "data": {
    "_id": "challan_id",
    "challanNumber": "CHALLAN-1704110400000-123456",
    "amount": 5000,
    "status": "ISSUED",
    "issueDate": "2024-01-01T10:00:00Z"
  }
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Missing required fields"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per day per user

## Pagination
Add query parameters to GET requests:
- `page` (default: 1)
- `limit` (default: 10, max: 100)

Example: `GET /members?page=2&limit=20`

---

*Last Updated: 2024*  
*API Version: 1.0.0*
