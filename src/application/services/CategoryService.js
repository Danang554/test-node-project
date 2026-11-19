const AppError = require('../../interfaces/http/utils/AppError');

class CategoryService {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async getAll({ userId, search = '', page = 1, limit = 10 } = {}) {
    const { categories, total } = await this.categoryRepository.findAll({ userId, search, page, limit });
    return {
      categories: categories.map(c => c.toJSON()),
      total
    };
  }

  async getById(id, userId) {
    const category = await this.categoryRepository.findById(id, userId);
    if (!category) {
      throw AppError.notFound('Category not found');
    }
    return category.toJSON();
  }

  async create({ userId, name, description = null }) {
    const category = await this.categoryRepository.create({
      user_id: userId,
      name,
      description
    });
    return category.toJSON();
  }

  async update(id, userId, { name, description }) {
    const category = await this.categoryRepository.findById(id, userId);
    if (!category) {
      throw AppError.notFound('Category not found');
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    const updated = await this.categoryRepository.update(id, userId, updateData);
    return updated.toJSON();
  }

  async delete(id, userId) {
    const category = await this.categoryRepository.findById(id, userId);
    if (!category) {
      throw AppError.notFound('Category not found');
    }

    await this.categoryRepository.delete(id, userId);
    return true;
  }

  async getAllDeleted({ userId, search = '', page = 1, limit = 10 } = {}) {
    const { categories, total } = await this.categoryRepository.findAllDeleted({ userId, search, page, limit });
    return {
      categories: categories.map(c => c.toJSON()),
      total
    };
  }

  async restore(id, userId) {
    const category = await this.categoryRepository.findDeletedById(id, userId);
    if (!category) {
      throw AppError.notFound('Deleted category not found');
    }

    const restored = await this.categoryRepository.restore(id, userId);
    return restored.toJSON();
  }

  async forceDelete(id, userId) {
    const category = await this.categoryRepository.findDeletedById(id, userId);
    if (!category) {
      throw AppError.notFound('Deleted category not found for permanent deletion');
    }

    await this.categoryRepository.forceDelete(id, userId);
    return true;
  }
}

module.exports = CategoryService;
