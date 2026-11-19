const AppError = require('../../interfaces/http/utils/AppError');

class TodoService {
  constructor(todoRepository, categoryRepository) {
    this.todoRepository = todoRepository;
    this.categoryRepository = categoryRepository;
  }

  async getAll({ userId, categoryId = null, isCompleted = null, search = '', page = 1, limit = 10 } = {}) {
    const { todos, total } = await this.todoRepository.findAll({
      userId,
      categoryId,
      isCompleted,
      search,
      page,
      limit
    });

    return {
      todos: todos.map(t => t.toJSON()),
      total
    };
  }

  async getById(id, userId) {
    const todo = await this.todoRepository.findById(id, userId);
    if (!todo) {
      throw AppError.notFound('Todo not found');
    }
    return todo.toJSON();
  }

  async create({ userId, categoryId = null, title, description = null, is_completed = false }) {
    if (categoryId) {
      const category = await this.categoryRepository.findById(categoryId, userId);
      if (!category) {
        throw AppError.badRequest('Invalid category ID or category does not belong to user');
      }
    }

    const todo = await this.todoRepository.create({
      user_id: userId,
      category_id: categoryId,
      title,
      description,
      is_completed
    });

    return todo.toJSON();
  }

  async update(id, userId, { category_id, title, description, is_completed }) {
    const todo = await this.todoRepository.findById(id, userId);
    if (!todo) {
      throw AppError.notFound('Todo not found');
    }

    const updateData = {};
    if (category_id !== undefined) {
      if (category_id !== null) {
        const category = await this.categoryRepository.findById(category_id, userId);
        if (!category) {
          throw AppError.badRequest('Invalid category ID or category does not belong to user');
        }
      }
      updateData.category_id = category_id;
    }

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (is_completed !== undefined) updateData.is_completed = Boolean(is_completed);

    const updated = await this.todoRepository.update(id, userId, updateData);
    return updated.toJSON();
  }

  async delete(id, userId) {
    const todo = await this.todoRepository.findById(id, userId);
    if (!todo) {
      throw AppError.notFound('Todo not found');
    }

    await this.todoRepository.delete(id, userId);
    return true;
  }

  async getAllDeleted({ userId, search = '', page = 1, limit = 10 } = {}) {
    const { todos, total } = await this.todoRepository.findAllDeleted({ userId, search, page, limit });
    return {
      todos: todos.map(t => t.toJSON()),
      total
    };
  }

  async restore(id, userId) {
    const todo = await this.todoRepository.findDeletedById(id, userId);
    if (!todo) {
      throw AppError.notFound('Deleted todo not found');
    }

    const restored = await this.todoRepository.restore(id, userId);
    return restored.toJSON();
  }

  async forceDelete(id, userId) {
    const todo = await this.todoRepository.findDeletedById(id, userId);
    if (!todo) {
      throw AppError.notFound('Deleted todo not found for permanent deletion');
    }

    await this.todoRepository.forceDelete(id, userId);
    return true;
  }
}

module.exports = TodoService;
