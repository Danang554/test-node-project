const jwt = require('jsonwebtoken');
const config = require('../../config');

class JwtUtil {
  static sign(payload, options = {}) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      ...options
    });
  }

  static verify(token) {
    return jwt.verify(token, config.jwt.secret);
  }

  static decode(token) {
    return jwt.decode(token);
  }
}

module.exports = JwtUtil;
