require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { sequelize } = require('./models');
const config = require('./config');
const { startSimulation } = require('./services/simulator');

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start the real-time movement simulator
startSimulation(io);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    await sequelize.sync();
    console.log('Database synced.');

    server.listen(config.port, () => {
      console.log(`\n==========================================`);
      console.log(`  SMTMS Backend Server`);
      console.log(`  Port: ${config.port}`);
      console.log(`  URL: http://localhost:${config.port}`);
      console.log(`  Health: http://localhost:${config.port}/api/health`);
      console.log(`==========================================\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
