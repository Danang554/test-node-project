const UserService = require('../../src/application/services/UserService');
const AppError = require('../../src/interfaces/http/utils/AppError');
const User = require('../../src/domain/entities/User');

describe('UserService (Unit Tests)', () => {
  let userService;
  let mockUserRepo;

  beforeEach(() => {
    mockUserRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAllDeleted: jest.fn(),
      findDeletedById: jest.fn(),
      restore: jest.fn(),
      forceDelete: jest.fn(),
      findByEmail: jest.fn()
    };
    userService = new UserService(mockUserRepo);
  });

  describe('getAll', () => {
    it('should return paginated list of users', async () => {
      mockUserRepo.findAll.mockResolvedValue({
        users: [
          new User({ id: 1, name: 'Admin', email: 'admin@example.com' }),
          new User({ id: 2, name: 'User', email: 'user@example.com' })
        ],
        total: 2
      });

      const result = await userService.getAll({ page: 1, limit: 10 });
      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockUserRepo.findAll).toHaveBeenCalledWith({ search: '', page: 1, limit: 10 });
    });
  });

  describe('getById', () => {
    it('should return user by id', async () => {
      mockUserRepo.findById.mockResolvedValue(
        new User({ id: 1, name: 'Admin', email: 'admin@example.com' })
      );

      const user = await userService.getById(1);
      expect(user.id).toBe(1);
      expect(user.name).toBe('Admin');
    });

    it('should throw not found error if user does not exist', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(userService.getById(999)).rejects.toThrow(AppError);
    });
  });

  describe('delete', () => {
    it('should soft delete user when user exists', async () => {
      mockUserRepo.findById.mockResolvedValue(new User({ id: 1, name: 'Test' }));
      mockUserRepo.delete.mockResolvedValue(true);

      const result = await userService.delete(1);
      expect(result).toBe(true);
      expect(mockUserRepo.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('restore', () => {
    it('should restore soft-deleted user', async () => {
      mockUserRepo.findDeletedById.mockResolvedValue(new User({ id: 1, name: 'Test' }));
      mockUserRepo.restore.mockResolvedValue(new User({ id: 1, name: 'Test', deleted_at: null }));

      const restored = await userService.restore(1);
      expect(restored.id).toBe(1);
      expect(mockUserRepo.restore).toHaveBeenCalledWith(1);
    });
  });
});
