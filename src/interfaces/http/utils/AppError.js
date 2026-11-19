class AppError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', details = null) {
    return new AppError(400, message, details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(403, message);
  }

  static notFound(message = 'Not Found') {
    return new AppError(404, message);
  }

  static conflict(message = 'Conflict') {
    return new AppError(409, message);
  }

  static unprocessableEntity(message = 'Unprocessable Entity', details = null) {
    return new AppError(422, message, details);
  }

  static internal(message = 'Internal Server Error', details = null) {
    const err = new AppError(500, message, details);
    err.isOperational = false;
    return err;
  }
}

module.exports = AppError;
