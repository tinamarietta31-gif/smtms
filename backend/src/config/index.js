require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5001,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'smtms',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  jwtSecret: process.env.JWT_SECRET || 'smtms_secret',
  mlApiUrl: process.env.ML_API_URL || 'http://localhost:5001',
};
