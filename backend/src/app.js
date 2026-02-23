const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const tripRoutes = require('./routes/tripRoutes');
const violationRoutes = require('./routes/violationRoutes');
const alertRoutes = require('./routes/alertRoutes');
const permitRoutes = require('./routes/permitRoutes');
const geofenceRoutes = require('./routes/geofenceRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const infrastructureRoutes = require('./routes/infrastructureRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/violations', violationRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/permits', permitRoutes);
app.use('/api/geofences', geofenceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/infrastructure', infrastructureRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

module.exports = app;
