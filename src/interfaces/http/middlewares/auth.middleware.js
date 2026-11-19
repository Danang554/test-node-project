const JwtUtil = require('../../../infrastructure/security/jwt');
const HashUtil = require('../../../infrastructure/security/hash');
const AppError = require('../utils/AppError');

function createAuthMiddleware(revokedTokenRepository) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return next(AppError.unauthorized('Unauthorized. Please login first'));
      }

      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        return next(AppError.unauthorized("Invalid authorization format. Format must be 'Bearer <token>'"));
      }

      const token = parts[1];
      let decoded;
      try {
        decoded = JwtUtil.verify(token);
      } catch (err) {
        return next(AppError.unauthorized('Invalid or expired token'));
      }

      if (!decoded || !decoded.sub) {
        return next(AppError.unauthorized('Token does not contain user identification'));
      }

      if (revokedTokenRepository) {
        const tokenHash = HashUtil.hashToken(token);
        const isRevoked = await revokedTokenRepository.isRevoked(tokenHash);
        if (isRevoked) {
          return next(AppError.unauthorized('Unauthorized. Please login first'));
        }
      }

      req.user = {
        id: Number(decoded.sub),
        email: decoded.email,
        is_admin: Boolean(decoded.is_admin)
      };
      req.token = token;

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = createAuthMiddleware;
