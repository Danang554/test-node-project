const ApiResponse = require('../utils/ApiResponse');

class UserController {
  constructor(userService, authService) {
    this.userService = userService;
    this.authService = authService;
  }

  getProfile = async (req, res, next) => {
    try {
      const user = await this.authService.getProfile(req.user.id);
      return ApiResponse.success(res, 200, 'User profile retrieved successfully', user);
    } catch (err) {
      next(err);
    }
  };

  updateProfile = async (req, res, next) => {
    try {
      const updated = await this.authService.updateProfile(req.user.id, req.body);
      return ApiResponse.success(res, 200, 'Profile updated successfully', updated);
    } catch (err) {
      next(err);
    }
  };

  getUsers = async (req, res, next) => {
    try {
      const { users, total } = await this.userService.getAll(req.query);
      return ApiResponse.successWithPagination(
        res,
        200,
        'Users retrieved successfully',
        users,
        req.query.page,
        req.query.limit,
        total
      );
    } catch (err) {
      next(err);
    }
  };

  getUserById = async (req, res, next) => {
    try {
      const user = await this.userService.getById(Number(req.params.id));
      return ApiResponse.success(res, 200, 'User retrieved successfully', user);
    } catch (err) {
      next(err);
    }
  };

  createUser = async (req, res, next) => {
    try {
      const user = await this.userService.create(req.body);
      return ApiResponse.success(res, 201, 'User created successfully', user);
    } catch (err) {
      next(err);
    }
  };

  updateUser = async (req, res, next) => {
    try {
      const user = await this.userService.update(Number(req.params.id), req.body);
      return ApiResponse.success(res, 200, 'User updated successfully', user);
    } catch (err) {
      next(err);
    }
  };

  deleteUser = async (req, res, next) => {
    try {
      await this.userService.delete(Number(req.params.id));
      return ApiResponse.success(res, 200, 'User deleted successfully (soft deleted)');
    } catch (err) {
      next(err);
    }
  };

  getDeletedUsers = async (req, res, next) => {
    try {
      const { users, total } = await this.userService.getAllDeleted(req.query);
      return ApiResponse.successWithPagination(
        res,
        200,
        'Deleted users retrieved successfully',
        users,
        req.query.page,
        req.query.limit,
        total
      );
    } catch (err) {
      next(err);
    }
  };

  restoreUser = async (req, res, next) => {
    try {
      const user = await this.userService.restore(Number(req.params.id));
      return ApiResponse.success(res, 200, 'User restored successfully', user);
    } catch (err) {
      next(err);
    }
  };

  forceDeleteUser = async (req, res, next) => {
    try {
      await this.userService.forceDelete(Number(req.params.id));
      return ApiResponse.success(res, 200, 'User permanently deleted');
    } catch (err) {
      next(err);
    }
  };
}

module.exports = UserController;
