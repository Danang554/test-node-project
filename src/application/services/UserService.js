const AppError = require('../../interfaces/http/utils/AppError');
const HashUtil = require('../../infrastructure/security/hash');

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async getAll({ search = '', page = 1, limit = 10 } = {}) {
    const { users, total } = await this.userRepository.findAll({ search, page, limit });
    return {
      users: users.map(u => u.toJSON()),
      total
    };
  }

  async getById(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return user.toJSON();
  }

  async create({ name, email, password, is_admin = false }) {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw AppError.conflict('Email is already registered');
    }

    const hashedPassword = await HashUtil.hashPassword(password);
    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      is_admin: Boolean(is_admin)
    });

    return user.toJSON();
  }

  async update(id, { name, email, password, is_admin }) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;

    if (email && email !== user.email) {
      const existing = await this.userRepository.findByEmail(email);
      if (existing && existing.id !== user.id) {
        throw AppError.conflict('Email is already registered');
      }
      updateData.email = email;
    }

    if (password) {
      updateData.password = await HashUtil.hashPassword(password);
    }

    if (is_admin !== undefined) {
      updateData.is_admin = Boolean(is_admin);
    }

    if (Object.keys(updateData).length === 0) {
      return user.toJSON();
    }

    const updated = await this.userRepository.update(id, updateData);
    return updated.toJSON();
  }

  async delete(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    await this.userRepository.delete(id);
    return true;
  }

  async getAllDeleted({ search = '', page = 1, limit = 10 } = {}) {
    const { users, total } = await this.userRepository.findAllDeleted({ search, page, limit });
    return {
      users: users.map(u => u.toJSON()),
      total
    };
  }

  async getDeletedById(id) {
    const user = await this.userRepository.findDeletedById(id);
    if (!user) {
      throw AppError.notFound('Deleted user not found');
    }
    return user.toJSON();
  }

  async restore(id) {
    const user = await this.userRepository.findDeletedById(id);
    if (!user) {
      throw AppError.notFound('Deleted user not found');
    }

    const restored = await this.userRepository.restore(id);
    return restored.toJSON();
  }

  async forceDelete(id) {
    const user = await this.userRepository.findDeletedById(id);
    if (!user) {
      throw AppError.notFound('Deleted user not found for permanent deletion');
    }

    await this.userRepository.forceDelete(id);
    return true;
  }
}

module.exports = UserService;
