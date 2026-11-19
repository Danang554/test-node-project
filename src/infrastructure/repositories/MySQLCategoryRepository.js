const Category = require('../../domain/entities/Category');

class MySQLCategoryRepository {
  constructor(db) {
    this.db = db;
  }

  _mapToEntity(row) {
    if (!row) return null;
    return new Category(row);
  }

  async create(categoryData) {
    const [id] = await this.db('categories').insert({
      user_id: categoryData.user_id,
      name: categoryData.name,
      description: categoryData.description || null
    });
    return this.findById(id, categoryData.user_id);
  }

  async findById(id, userId = null) {
    let query = this.db('categories').where({ id }).whereNull('deleted_at');
    if (userId !== null && userId !== undefined) {
      query = query.where({ user_id: userId });
    }
    const row = await query.first();
    return this._mapToEntity(row);
  }

  async findAll({ userId, search = '', page = 1, limit = 10 } = {}) {
    let query = this.db('categories').whereNull('deleted_at');
    if (userId) {
      query = query.where({ user_id: userId });
    }

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      query = query.where(function() {
        this.where('name', 'like', s).orWhere('description', 'like', s);
      });
    }

    const countResult = await query.clone().count({ total: 'id' }).first();
    const total = Number(countResult ? countResult.total : 0);

    const offset = (page - 1) * limit;
    const rows = await query.clone().orderBy('id', 'desc').offset(offset).limit(limit);

    return {
      categories: rows.map(this._mapToEntity),
      total
    };
  }

  async update(id, userId, updateData) {
    const toUpdate = { ...updateData };
    delete toUpdate.id;
    delete toUpdate.user_id;
    delete toUpdate.created_at;

    await this.db('categories')
      .where({ id, user_id: userId })
      .whereNull('deleted_at')
      .update(toUpdate);

    return this.findById(id, userId);
  }

  async delete(id, userId) {
    await this.db('categories')
      .where({ id, user_id: userId })
      .whereNull('deleted_at')
      .update({ deleted_at: this.db.fn.now() });
    return true;
  }

  async findAllDeleted({ userId, search = '', page = 1, limit = 10 } = {}) {
    let query = this.db('categories').whereNotNull('deleted_at');
    if (userId) {
      query = query.where({ user_id: userId });
    }

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      query = query.where(function() {
        this.where('name', 'like', s).orWhere('description', 'like', s);
      });
    }

    const countResult = await query.clone().count({ total: 'id' }).first();
    const total = Number(countResult ? countResult.total : 0);

    const offset = (page - 1) * limit;
    const rows = await query.clone().orderBy('deleted_at', 'desc').offset(offset).limit(limit);

    return {
      categories: rows.map(this._mapToEntity),
      total
    };
  }

  async findDeletedById(id, userId = null) {
    let query = this.db('categories').where({ id }).whereNotNull('deleted_at');
    if (userId !== null && userId !== undefined) {
      query = query.where({ user_id: userId });
    }
    const row = await query.first();
    return this._mapToEntity(row);
  }

  async restore(id, userId) {
    await this.db('categories')
      .where({ id, user_id: userId })
      .update({ deleted_at: null });
    return this.findById(id, userId);
  }

  async forceDelete(id, userId) {
    await this.db('categories').where({ id, user_id: userId }).del();
    return true;
  }
}

module.exports = MySQLCategoryRepository;
