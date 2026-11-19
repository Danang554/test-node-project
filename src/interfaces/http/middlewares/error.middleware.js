const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../../../infrastructure/logger/logger');

function errorMiddleware(err, req, res, next) {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(`AppError: ${err.message}`, { error: err.stack, details: err.details });
    }
    return ApiResponse.error(res, err.statusCode, err.message, err.details);
  }

  // Zod error fallback
  const issues = err.issues || err.errors;
  if (err.name === 'ZodError' && Array.isArray(issues)) {
    const errorMap = {};
    issues.forEach((e) => {
      const field = (e.path && e.path.length > 0) ? e.path.join('.') : 'body';
      errorMap[field] = e.message;
    });
    return ApiResponse.error(res, 400, 'Validation failed', errorMap);
  }

  // Syntax error (e.g. malformed JSON in body)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return ApiResponse.error(res, 400, 'Malformed JSON payload');
  }

  logger.error('Unhandled Exception occurred', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  return ApiResponse.error(res, 500, 'Internal Server Error');
}

module.exports = errorMiddleware;
