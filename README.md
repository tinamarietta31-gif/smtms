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
- **Role-Based Access Control** — Secure authority-only access

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React.js, Leaflet.js, Tailwind CSS  |
| Backend     | Node.js, Express.js                 |
| Database    | PostgreSQL + PostGIS                 |
| ML Model    | Python, Flask, scikit-learn          |
| Auth        | JWT, bcrypt                          |

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
