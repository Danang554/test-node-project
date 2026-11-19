const User = require('../../domain/entities/User');

class MySQLUserRepository {
  constructor(db) {
    this.db = db;
  }

  _mapToEntity(row) {
    if (!row) return null;
    return new User(row);
  }

  async create(userData) {
    const [id] = await this.db('users').insert({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      is_admin: userData.is_admin || false
    });
    return this.findById(id);
  }

  async findByEmail(email) {
    const row = await this.db('users')
      .where({ email })
      .whereNull('deleted_at')
      .first();
    return this._mapToEntity(row);
  }

  async findById(id) {
    const row = await this.db('users')
      .where({ id })
      .whereNull('deleted_at')
      .first();
    return this._mapToEntity(row);
  }

  async findAll({ search = '', page = 1, limit = 10 } = {}) {
    let query = this.db('users').whereNull('deleted_at');

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      query = query.where(function() {
        this.where('name', 'like', s).orWhere('email', 'like', s);
      });
    }

    const countResult = await query.clone().count({ total: 'id' }).first();
    const total = Number(countResult ? countResult.total : 0);

    const offset = (page - 1) * limit;
    const rows = await query.clone().orderBy('id', 'desc').offset(offset).limit(limit);

    return {
      users: rows.map(this._mapToEntity),
      total
    };
  }

  async update(id, updateData) {
    const toUpdate = { ...updateData };
    delete toUpdate.id;
    delete toUpdate.created_at;

    await this.db('users').where({ id }).update(toUpdate);
    return this.findById(id);
  }

  async delete(id) {
    await this.db('users')
      .where({ id })
      .whereNull('deleted_at')
      .update({ deleted_at: this.db.fn.now() });
    return true;
  }

  async findAllDeleted({ search = '', page = 1, limit = 10 } = {}) {
    let query = this.db('users').whereNotNull('deleted_at');

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      query = query.where(function() {
        this.where('name', 'like', s).orWhere('email', 'like', s);
      });
    }

    const countResult = await query.clone().count({ total: 'id' }).first();
    const total = Number(countResult ? countResult.total : 0);

    const offset = (page - 1) * limit;
    const rows = await query.clone().orderBy('deleted_at', 'desc').offset(offset).limit(limit);

    return {
      users: rows.map(this._mapToEntity),
      total
    };
  }

  async findDeletedById(id) {
    const row = await this.db('users')
      .where({ id })
      .whereNotNull('deleted_at')
      .first();
    return this._mapToEntity(row);
  }

  async restore(id) {
    await this.db('users')
      .where({ id })
      .update({ deleted_at: null });
    return this.findById(id);
  }

  async forceDelete(id) {
    await this.db('users').where({ id }).del();
    return true;
  }
}

module.exports = MySQLUserRepository;
