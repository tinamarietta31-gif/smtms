const express = require('express');
const app = express();
const port = 3000;

// Import routes
const authRoutes = require('./routes/authRoutes');
const authorityRoutes = require('./routes/authorityRoutes');
const memberRoutes = require('./routes/memberRoutes');

// Middleware
app.use(express.json());

// Auth routes
app.use('/api/auth', authRoutes);

// Authority routes
app.use('/api/authorities', authorityRoutes);

// Member/User routes
app.use('/api/members', memberRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});