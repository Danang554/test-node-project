const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const requestLoggerMiddleware = require('./middlewares/request-logger.middleware');
const errorMiddleware = require('./middlewares/error.middleware');
const AppError = require('./utils/AppError');

function createApp(router) {
  const app = express();

  // Security & utility middlewares
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // HTTP Request Logger
  app.use(requestLoggerMiddleware);

  // Mount API router
  app.use(router);

  // 404 Handler for undefined routes
  app.use((req, res, next) => {
    next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
  });

  // Centralized Error Handling Middleware
  app.use(errorMiddleware);

  return app;
}

module.exports = createApp;
