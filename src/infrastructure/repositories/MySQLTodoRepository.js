const Todo = require('../../domain/entities/Todo');

class MySQLTodoRepository {
  constructor(db) {
    this.db = db;
  }

  _mapToEntity(row) {
    if (!row) return null;
    return new Todo(row);
  }

  async create(todoData) {
    const [id] = await this.db('todos').insert({
      user_id: todoData.user_id,
      category_id: todoData.category_id || null,
      title: todoData.title,
      description: todoData.description || null,
      is_completed: todoData.is_completed || false
    });
    return this.findById(id, todoData.user_id);
  }

  async findById(id, userId = null) {
    let query = this.db('todos as t')
      .select('t.*', 'c.name as category_name')
      .leftJoin('categories as c', 't.category_id', 'c.id')
      .where('t.id', id)
      .whereNull('t.deleted_at');

    if (userId !== null && userId !== undefined) {
      query = query.where('t.user_id', userId);
    }

    const row = await query.first();
    return this._mapToEntity(row);
  }

  async findAll({ userId, categoryId = null, isCompleted = null, search = '', page = 1, limit = 10 } = {}) {
    let baseQuery = this.db('todos as t').whereNull('t.deleted_at');

    if (userId) {
      baseQuery = baseQuery.where('t.user_id', userId);
    }

    if (categoryId) {
      baseQuery = baseQuery.where('t.category_id', categoryId);
    }

    if (isCompleted !== null && isCompleted !== undefined) {
      baseQuery = baseQuery.where('t.is_completed', isCompleted);
    }

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      baseQuery = baseQuery.where(function() {
        this.where('t.title', 'like', s).orWhere('t.description', 'like', s);
      });
    }

    const countResult = await baseQuery.clone().count({ total: 't.id' }).first();
    const total = Number(countResult ? countResult.total : 0);

    const offset = (page - 1) * limit;
    const rows = await baseQuery.clone()
      .select('t.*', 'c.name as category_name')
      .leftJoin('categories as c', 't.category_id', 'c.id')
      .orderBy('t.id', 'desc')
      .offset(offset)
      .limit(limit);

    return {
      todos: rows.map(this._mapToEntity),
      total
    };
  }

  async update(id, userId, updateData) {
    const toUpdate = { ...updateData };
    delete toUpdate.id;
    delete toUpdate.user_id;
    delete toUpdate.created_at;

    await this.db('todos')
      .where({ id, user_id: userId })
      .whereNull('deleted_at')
      .update(toUpdate);

    return this.findById(id, userId);
  }

  async delete(id, userId) {
    await this.db('todos')
      .where({ id, user_id: userId })
      .whereNull('deleted_at')
      .update({ deleted_at: this.db.fn.now() });
    return true;
  }

  async findAllDeleted({ userId, search = '', page = 1, limit = 10 } = {}) {
    let baseQuery = this.db('todos as t').whereNotNull('t.deleted_at');

    if (userId) {
      baseQuery = baseQuery.where('t.user_id', userId);
    }

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      baseQuery = baseQuery.where(function() {
        this.where('t.title', 'like', s).orWhere('t.description', 'like', s);
      });
    }

    const countResult = await baseQuery.clone().count({ total: 't.id' }).first();
    const total = Number(countResult ? countResult.total : 0);

    const offset = (page - 1) * limit;
    const rows = await baseQuery.clone()
      .select('t.*', 'c.name as category_name')
      .leftJoin('categories as c', 't.category_id', 'c.id')
      .orderBy('t.deleted_at', 'desc')
      .offset(offset)
      .limit(limit);

    return {
      todos: rows.map(this._mapToEntity),
      total
    };
  }

  async findDeletedById(id, userId = null) {
    let query = this.db('todos as t')
      .select('t.*', 'c.name as category_name')
      .leftJoin('categories as c', 't.category_id', 'c.id')
      .where('t.id', id)
      .whereNotNull('t.deleted_at');

    if (userId !== null && userId !== undefined) {
      query = query.where('t.user_id', userId);
    }

    const row = await query.first();
    return this._mapToEntity(row);
  }

  async restore(id, userId) {
    await this.db('todos')
      .where({ id, user_id: userId })
      .update({ deleted_at: null });
    return this.findById(id, userId);
  }

  async forceDelete(id, userId) {
    await this.db('todos').where({ id, user_id: userId }).del();
    return true;
  }
}

module.exports = MySQLTodoRepository;
