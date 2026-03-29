require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');

// Route Aggregator (replaces monolith management.js)
const managementRoutes = require('./src/routes/index');

// Gateway Middleware
const gateway = require('./src/middleware/gateway');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Databases
connectDB();
connectRedis();

// Global Middlewares
app.use(cors());
app.use(morgan('dev'));

// Management API for Dashboard
app.use('/management', express.json(), managementRoutes);

// Gateway Middleware for all proxy routes
app.use(gateway);

app.listen(PORT, () => {
  console.log(`GaaS Backend running on port ${PORT}`);
});
