const CategoryService = require('../../src/application/services/CategoryService');
const Category = require('../../src/domain/entities/Category');
const AppError = require('../../src/interfaces/http/utils/AppError');

describe('CategoryService (Unit Tests)', () => {
  let categoryService;
  let mockCategoryRepo;

  beforeEach(() => {
    mockCategoryRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAllDeleted: jest.fn(),
      findDeletedById: jest.fn(),
      restore: jest.fn(),
      forceDelete: jest.fn()
    };
    categoryService = new CategoryService(mockCategoryRepo);
  });

  it('should create a category for user', async () => {
    mockCategoryRepo.create.mockResolvedValue(new Category({
      id: 1,
      user_id: 10,
      name: 'Work',
      description: 'Work items'
    }));

    const result = await categoryService.create({
      userId: 10,
      name: 'Work',
      description: 'Work items'
    });

    expect(result.id).toBe(1);
    expect(result.name).toBe('Work');
    expect(mockCategoryRepo.create).toHaveBeenCalledWith({
      user_id: 10,
      name: 'Work',
      description: 'Work items'
    });
  });

  it('should throw not found if category does not belong to user', async () => {
    mockCategoryRepo.findById.mockResolvedValue(null);

    await expect(categoryService.getById(999, 10)).rejects.toThrow(AppError);
  });
});
