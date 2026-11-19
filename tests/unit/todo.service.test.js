const TodoService = require('../../src/application/services/TodoService');
const Todo = require('../../src/domain/entities/Todo');
const Category = require('../../src/domain/entities/Category');
const AppError = require('../../src/interfaces/http/utils/AppError');

describe('TodoService (Unit Tests)', () => {
  let todoService;
  let mockTodoRepo;
  let mockCategoryRepo;

  beforeEach(() => {
    mockTodoRepo = {
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
    mockCategoryRepo = {
      findById: jest.fn()
    };
    todoService = new TodoService(mockTodoRepo, mockCategoryRepo);
  });

  it('should create a todo successfully with valid category', async () => {
    mockCategoryRepo.findById.mockResolvedValue(new Category({ id: 5, user_id: 1 }));
    mockTodoRepo.create.mockResolvedValue(new Todo({
      id: 1,
      user_id: 1,
      category_id: 5,
      title: 'Finish report',
      is_completed: false
    }));

    const result = await todoService.create({
      userId: 1,
      categoryId: 5,
      title: 'Finish report',
      description: null,
      is_completed: false
    });

    expect(result.id).toBe(1);
    expect(result.title).toBe('Finish report');
  });

  it('should throw bad request if category does not exist for the user', async () => {
    mockCategoryRepo.findById.mockResolvedValue(null);

    await expect(
      todoService.create({
        userId: 1,
        categoryId: 99,
        title: 'Finish report'
      })
    ).rejects.toThrow(AppError);

    expect(mockTodoRepo.create).not.toHaveBeenCalled();
  });
});
