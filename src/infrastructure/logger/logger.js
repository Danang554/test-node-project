const path = require('path');
const fs = require('fs');
const winston = require('winston');
require('winston-daily-rotate-file');
const config = require('../../config');

const logDir = path.resolve(process.cwd(), config.logger.dir);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: config.logger.maxSize,
  maxFiles: config.logger.maxDays,
  level: config.logger.level,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  )
});

const consoleTransport = new winston.transports.Console({
  level: config.logger.level,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
      return `[${timestamp}] ${level}: ${message}${metaString}`;
    })
  )
});

const logger = winston.createLogger({
  level: config.logger.level,
  transports: [fileRotateTransport, consoleTransport]
});

module.exports = logger;
