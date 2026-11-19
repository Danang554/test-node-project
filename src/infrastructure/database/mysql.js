const knex = require('knex');
const knexConfig = require('../../database/knexfile');
const logger = require('../logger/logger');

let db = null;

try {
  db = knex(knexConfig);
} catch (err) {
  logger.error('Failed to initialize database client', { error: err.message });
}

async function checkDatabaseConnection() {
  if (!db) return false;
  try {
    await db.raw('SELECT 1+1 AS result');
    return true;
  } catch (err) {
    logger.warn('Could not connect to MySQL database', { error: err.message });
    return false;
  }
}

module.exports = {
  db,
  checkDatabaseConnection
};
