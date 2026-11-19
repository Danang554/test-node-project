const AppError = require('../utils/AppError');

function adminMiddleware(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return next(AppError.forbidden('Forbidden: Admin access required'));
  }
  next();
}

module.exports = adminMiddleware;
