const ApiResponse = require('../utils/ApiResponse');

class CategoryController {
  constructor(categoryService) {
    this.categoryService = categoryService;
  }

  getCategories = async (req, res, next) => {
    try {
      const { categories, total } = await this.categoryService.getAll({
        userId: req.user.id,
        search: req.query.search,
        page: req.query.page,
        limit: req.query.limit
      });

      return ApiResponse.successWithPagination(
        res,
        200,
        'Categories retrieved successfully',
        categories,
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
      const category = await this.categoryService.getById(Number(req.params.id), req.user.id);
      return ApiResponse.success(res, 200, 'Category retrieved successfully', category);
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const category = await this.categoryService.create({
        userId: req.user.id,
        ...req.body
      });
      return ApiResponse.success(res, 201, 'Category created successfully', category);
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const category = await this.categoryService.update(
        Number(req.params.id),
        req.user.id,
        req.body
      );
      return ApiResponse.success(res, 200, 'Category updated successfully', category);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      await this.categoryService.delete(Number(req.params.id), req.user.id);
      return ApiResponse.success(res, 200, 'Category deleted successfully (soft deleted)');
    } catch (err) {
      next(err);
    }
  };

  getDeleted = async (req, res, next) => {
    try {
      const { categories, total } = await this.categoryService.getAllDeleted({
        userId: req.user.id,
        search: req.query.search,
        page: req.query.page,
        limit: req.query.limit
      });

      return ApiResponse.successWithPagination(
        res,
        200,
        'Deleted categories retrieved successfully',
        categories,
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
      const category = await this.categoryService.restore(Number(req.params.id), req.user.id);
      return ApiResponse.success(res, 200, 'Category restored successfully', category);
    } catch (err) {
      next(err);
    }
  };

  forceDelete = async (req, res, next) => {
    try {
      await this.categoryService.forceDelete(Number(req.params.id), req.user.id);
      return ApiResponse.success(res, 200, 'Category permanently deleted');
    } catch (err) {
      next(err);
    }
  };
}

module.exports = CategoryController;
