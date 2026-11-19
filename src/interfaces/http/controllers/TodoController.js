const ApiResponse = require('../utils/ApiResponse');

class TodoController {
  constructor(todoService) {
    this.todoService = todoService;
  }

  getTodos = async (req, res, next) => {
    try {
      const { todos, total } = await this.todoService.getAll({
        userId: req.user.id,
        categoryId: req.query.category_id,
        isCompleted: req.query.is_completed,
        search: req.query.search,
        page: req.query.page,
        limit: req.query.limit
      });

      return ApiResponse.successWithPagination(
        res,
        200,
        'Todos retrieved successfully',
        todos,
        req.query.page,
        req.query.limit,
        total
      );
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const todo = await this.todoService.getById(Number(req.params.id), req.user.id);
      return ApiResponse.success(res, 200, 'Todo retrieved successfully', todo);
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const todo = await this.todoService.create({
        userId: req.user.id,
        ...req.body
      });
      return ApiResponse.success(res, 201, 'Todo created successfully', todo);
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const todo = await this.todoService.update(
        Number(req.params.id),
        req.user.id,
        req.body
      );
      return ApiResponse.success(res, 200, 'Todo updated successfully', todo);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      await this.todoService.delete(Number(req.params.id), req.user.id);
      return ApiResponse.success(res, 200, 'Todo deleted successfully (soft deleted)');
    } catch (err) {
      next(err);
    }
  };

  getDeleted = async (req, res, next) => {
    try {
      const { todos, total } = await this.todoService.getAllDeleted({
        userId: req.user.id,
        search: req.query.search,
        page: req.query.page,
        limit: req.query.limit
      });

      return ApiResponse.successWithPagination(
        res,
        200,
        'Deleted todos retrieved successfully',
        todos,
        req.query.page,
        req.query.limit,
        total
      );
    } catch (err) {
      next(err);
    }
  };

  restore = async (req, res, next) => {
    try {
      const todo = await this.todoService.restore(Number(req.params.id), req.user.id);
      return ApiResponse.success(res, 200, 'Todo restored successfully', todo);
    } catch (err) {
      next(err);
    }
  };

  forceDelete = async (req, res, next) => {
    try {
      await this.todoService.forceDelete(Number(req.params.id), req.user.id);
      return ApiResponse.success(res, 200, 'Todo permanently deleted');
    } catch (err) {
      next(err);
    }
  };
}

module.exports = TodoController;
