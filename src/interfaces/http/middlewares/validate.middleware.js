const ApiResponse = require('../utils/ApiResponse');

function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      Object.defineProperty(req, source, {
        value: parsed,
        writable: true,
        configurable: true,
        enumerable: true
      });
      next();
    } catch (err) {
      const issues = err.issues || err.errors;
      if (Array.isArray(issues)) {
        const errorMap = {};
        issues.forEach((e) => {
          const field = (e.path && e.path.length > 0) ? e.path.join('.') : 'body';
          errorMap[field] = e.message;
        });
        return ApiResponse.error(res, 400, 'Validation failed', errorMap);
      }
      return ApiResponse.error(res, 400, 'Invalid request payload');
    }
  };
}

module.exports = validate;
