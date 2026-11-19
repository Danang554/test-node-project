const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  app: {
    name: process.env.APP_NAME || 'test-node-project',
    host: process.env.APP_HOST || '127.0.0.1',
    port: parseInt(process.env.APP_PORT, 10) || 5000,
    env: process.env.APP_ENV || 'development'
  },
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'node_db'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-jwt-key-replace-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  logger: {
    dir: process.env.LOG_DIR || 'storage/logs',
    level: process.env.LOG_LEVEL || 'info',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxDays: process.env.LOG_MAX_DAYS || '14d'
  }
};

module.exports = config;
