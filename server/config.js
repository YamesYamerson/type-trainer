/**
 * Server configuration for Type Trainer
 */

const path = require('path');

const config = {
  // Server configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  dbPath: process.env.DB_PATH || path.join(__dirname, 'typing_trainer.db'),
  
  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // API configuration
  apiPrefix: '/api',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Validate required configuration
const validateConfig = () => {
  const required = ['port', 'dbPath'];
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    console.warn('Missing required configuration:', missing);
  }
};

validateConfig();

module.exports = config;
