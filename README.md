# Smart Mining Transport Monitoring System (SMTMS)

A comprehensive GPS-enabled tracking and monitoring system for vehicles transporting excavated earth. The system ensures real-time tracking of trips, verifies compliance with excavation limits, and prevents illegal mining activities.

## Features

- **Real-Time Vehicle Tracking** — Leaflet.js + OpenStreetMap
- **Predictive Analytics** — ML-based illegal activity detection
- **e-Challan Automation** — Auto-generate challans for violations
- **Remote Vehicle Control** — ECM integration to stop vehicles
- **ANPR Integration** — Track vehicles via registration number
- **Toll Plaza Feed Integration** — Cross-verify vehicle movements
- **Geofencing** — Virtual boundaries for authorized zones
- **Advanced Role-Based Access Control** — Super Admin, Owner, and Driver roles with granular permissions
- **Authority Management** — Super Admins can add/remove authorities and manage all system resources
- **Multi-Level Access** — Hierarchical permission system for secure operations
- **Custom Role Management** — Super Admins can create custom roles with specific permission combinations

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React.js, Leaflet.js, Tailwind CSS  |
| Backend     | Node.js, Express.js                 |
| Database    | PostgreSQL + PostGIS                 |
| ML Model    | Python, Flask, scikit-learn          |
| Auth        | JWT, bcrypt                          |

## Role-Based Access Control & Permissions

### Super Admin
**Responsibilities**: Full system control and authority management

| Permission | Scope |
|-----------|-------|
| Add Authorities | Create new authorities and assign super admins to manage them |
| Remove Authorities | Delete authorities from the system |
| Add Members | Create users with any role (Super Admin, Owner, Driver) |
| Remove Members | Delete users from any authority |
| Add Vehicles | Register vehicles across any authority |
| Remove Vehicles | Deregister and remove vehicles from the system |
| View All Data | Access complete visibility of all trips, violations, and analytics |
| Manage All Resources | Control all system entities without restrictions |
| Remote Vehicle Control | Stop and resume any vehicle in the system |
| e-Challan Management | Generate and manage challans for all violations |
| Generate Reports | Access comprehensive analytics and dashboard statistics |

### Owner
**Responsibilities**: Manage owned resources and subordinate drivers

| Permission | Scope |
|-----------|-------|
| View Owned Data | View only their own assigned vehicles, drivers, and trips |
| Add Vehicles | Register new vehicles (limited to their authority) |
| View Vehicle Details | Monitor only their registered vehicles' location and status |
| Add Drivers | Create new driver accounts under their authority |
| Monitor Drivers | Track driver activities and performance metrics |
| View Violations | Access violations related to their vehicles and drivers only |
| View Challans | Monitor e-Challans issued to their resources only |
| Cannot Remove | No permission to remove vehicles or drivers (read-only deletion) |
| Limited Control | Cannot manage other owners' resources or perform system-wide operations |

### Driver
**Responsibilities**: Limited self-service access for personal operations

| Permission | Scope |
|-----------|-------|
| View Own Details | Access only their own profile information |
| View Assigned Vehicle | See only their assigned vehicle details and status |
| View Trip Details | Monitor only their own trip history and current trips |
| View Assigned Challans | Access e-Challans issued to their vehicle only |
| View Live Location | Track their vehicle's real-time location on the map |
| View Violations | Access violations related to their assigned vehicle only |
| Submit Reports | Report vehicle issues or safety concerns |
| Cannot Modify | No permission to edit any data or manage resources |
| Cannot Access Other Data | Strict isolation from other drivers' information |

## Getting Started

### Prerequisites
- Node.js >= 18
- Python >= 3.9
- PostgreSQL >= 14 with PostGIS extension

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # Edit with your DB credentials
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### ML Model Setup
```bash
cd ml-model
pip install -r requirements.txt
python app.py
```

## Default Admin Credentials
- **Email**: admin@smtms.gov.in
- **Password**: admin123

## API Documentation

### Auth
- `POST /api/auth/login` — Login
- `POST /api/auth/register` — Register (admin only)

### Roles (Super Admin Only)
- `GET /api/roles` — List all roles
- `POST /api/roles` — Create new role
- `GET /api/roles/:id` — Get role details
- `PUT /api/roles/:id` — Update role
- `DELETE /api/roles/:id` — Delete role

### Authorities (Super Admin Only)
- `GET /api/authorities` — List all authorities
- `POST /api/authorities` — Create new authority
- `GET /api/authorities/:id` — Get authority details
- `PUT /api/authorities/:id` — Update authority
- `DELETE /api/authorities/:id` — Delete authority
- `POST /api/authorities/:id/assign-admin` — Assign super admin to authority

### Members (Role-Based)
- `GET /api/members` — List members (filtered by role)
- `POST /api/members` — Add new member (Super Admin: any role | Owner: drivers only)
- `GET /api/members/:id` — Get member details
- `PUT /api/members/:id` — Update member (self or subordinates)
- `DELETE /api/members/:id` — Remove member (Super Admin only)

### Vehicles
- `GET /api/vehicles` — List all vehicles
- `POST /api/vehicles` — Register a vehicle
- `GET /api/vehicles/:id` — Get vehicle details
- `PUT /api/vehicles/:id` — Update vehicle
- `DELETE /api/vehicles/:id` — Delete vehicle

### Trips
- `GET /api/trips` — List all trips
- `POST /api/trips` — Create a trip
- `GET /api/trips/:id` — Get trip details

### Violations
- `GET /api/violations` — List all violations
- `POST /api/violations` — Report a violation
- `POST /api/violations/:id/challan` — Generate e-Challan

### Alerts
- `GET /api/alerts` — List all alerts
- `PUT /api/alerts/:id/resolve` — Resolve an alert

### Vehicle Control
- `POST /api/vehicles/:id/stop` — Remote stop vehicle
- `POST /api/vehicles/:id/resume` — Resume vehicle

### Analytics
- `GET /api/analytics/dashboard` — Dashboard stats
- `GET /api/analytics/predictions` — ML predictions

## License
MIT
