const ApiResponse = require('../utils/ApiResponse');

class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  register = async (req, res, next) => {
    try {
      const user = await this.authService.register(req.body);
      return ApiResponse.success(res, 201, 'User registered successfully', user);
    } catch (err) {
      next(err);
    }
  };

  login = async (req, res, next) => {
    try {
      const result = await this.authService.login(req.body);
      return ApiResponse.success(res, 200, 'Login successful', result);
    } catch (err) {
      next(err);
    }
  };

  logout = async (req, res, next) => {
    try {
      await this.authService.logout({
        token: req.token,
        userId: req.user.id
      });
      return ApiResponse.success(res, 200, 'Logout successful');
    } catch (err) {
      next(err);
    }
  };
}

module.exports = AuthController;
