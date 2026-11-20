const request = require('supertest');
const TodoController = require('../../src/interfaces/http/controllers/TodoController');
const AppError = require('../../src/interfaces/http/utils/AppError');
const { generateToken, createTestApp } = require('../helpers/test-helper');

describe('TodoController (Unit Tests)', () => {
  let app;
  let mockTodoService;
  let userToken;

  beforeEach(() => {
    mockTodoService = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getAllDeleted: jest.fn(),
      restore: jest.fn(),
      forceDelete: jest.fn()
    };

    const todoController = new TodoController(mockTodoService);

    app = createTestApp({
      todoController,
      revokedTokenRepository: { isRevoked: jest.fn().mockResolvedValue(false) }
    });

    userToken = generateToken({ id: 10, email: 'owner@example.com' });
  });

  // =========================================================================
  // ENDPOINT 1: GET /api/todo
  // =========================================================================
  describe('GET /api/todo', () => {
    it('should return 200 OK with paginated todos and applied filters', async () => {
      mockTodoService.getAll.mockResolvedValue({
        todos: [
          { id: 1, user_id: 10, title: 'Buy groceries', is_completed: false },
          { id: 2, user_id: 10, title: 'Do laundry', is_completed: true }
        ],
        total: 2
      });

      const res = await request(app)
        .get('/api/todo?page=1&limit=10&is_completed=false&search=buy')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(mockTodoService.getAll).toHaveBeenCalledWith({
        userId: 10,
        categoryId: undefined,
        isCompleted: false,
        search: 'buy',
        page: 1,
        limit: 10
      });
    });

    it('should return 401 Unauthorized when token is missing', async () => {
      const res = await request(app).get('/api/todo');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(mockTodoService.getAll).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // ENDPOINT 2: POST /api/todo
  // =========================================================================
  describe('POST /api/todo', () => {
    it('should return 201 Created when todo is created', async () => {
      mockTodoService.create.mockResolvedValue({
        id: 1,
        user_id: 10,
        title: 'New Todo',
        is_completed: false
      });

      const res = await request(app)
        .post('/api/todo')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'New Todo' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('New Todo');
      expect(mockTodoService.create).toHaveBeenCalledWith({
        userId: 10,
        title: 'New Todo',
        is_completed: false
      });
    });

    it('should return 400 Bad Request when title is empty', async () => {
      const res = await request(app)
        .post('/api/todo')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toHaveProperty('title');
      expect(mockTodoService.create).not.toHaveBeenCalled();
    });

    it('should return 400 Bad Request when category does not belong to user', async () => {
      mockTodoService.create.mockRejectedValue(
        AppError.badRequest('Invalid category ID or category does not belong to user')
      );

      const res = await request(app)
        .post('/api/todo')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Valid Title', category_id: 999 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid category ID');
    });
  });

  // =========================================================================
  // ENDPOINT 3: GET /api/todo/deleted
  // =========================================================================
  describe('GET /api/todo/deleted', () => {
    it('should return 200 OK with soft deleted todos', async () => {
      mockTodoService.getAllDeleted.mockResolvedValue({
        todos: [{ id: 5, user_id: 10, title: 'Archived Todo', deleted_at: '2026-11-20T00:00:00Z' }],
        total: 1
      });

      const res = await request(app)
        .get('/api/todo/deleted')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  // =========================================================================
  // ENDPOINT 4: GET /api/todo/:id
  // =========================================================================
  describe('GET /api/todo/:id', () => {
    it('should return 200 OK with todo details', async () => {
      mockTodoService.getById.mockResolvedValue({
        id: 1,
        user_id: 10,
        title: 'Important task'
      });

      const res = await request(app)
        .get('/api/todo/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
      expect(mockTodoService.getById).toHaveBeenCalledWith(1, 10);
    });

    it('should return 404 Not Found if todo does not exist', async () => {
      mockTodoService.getById.mockRejectedValue(
        AppError.notFound('Todo not found')
      );

      const res = await request(app)
        .get('/api/todo/999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // ENDPOINT 5: PATCH /api/todo/:id
  // =========================================================================
  describe('PATCH /api/todo/:id', () => {
    it('should return 200 OK with updated todo', async () => {
      mockTodoService.update.mockResolvedValue({
        id: 1,
        user_id: 10,
        title: 'Updated Title',
        is_completed: true
      });

      const res = await request(app)
        .patch('/api/todo/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ is_completed: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.is_completed).toBe(true);
      expect(mockTodoService.update).toHaveBeenCalledWith(1, 10, { is_completed: true });
    });

    it('should return 404 Not Found if todo does not exist', async () => {
      mockTodoService.update.mockRejectedValue(
        AppError.notFound('Todo not found')
      );

      const res = await request(app)
        .patch('/api/todo/999')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'New Title' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // ENDPOINT 6: DELETE /api/todo/:id
  // =========================================================================
  describe('DELETE /api/todo/:id', () => {
    it('should return 200 OK when todo is soft-deleted', async () => {
      mockTodoService.delete.mockResolvedValue(true);

      const res = await request(app)
        .delete('/api/todo/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('soft deleted');
      expect(mockTodoService.delete).toHaveBeenCalledWith(1, 10);
    });

    it('should return 404 Not Found when todo to delete is not found', async () => {
      mockTodoService.delete.mockRejectedValue(
        AppError.notFound('Todo not found')
      );

      const res = await request(app)
        .delete('/api/todo/999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // ENDPOINT 7: PATCH /api/todo/:id/restore
  // =========================================================================
  describe('PATCH /api/todo/:id/restore', () => {
    it('should return 200 OK when todo is restored', async () => {
      mockTodoService.restore.mockResolvedValue({
        id: 1,
        user_id: 10,
        title: 'Restored Todo',
        deleted_at: null
      });

      const res = await request(app)
        .patch('/api/todo/1/restore')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deleted_at).toBeNull();
      expect(mockTodoService.restore).toHaveBeenCalledWith(1, 10);
    });

    it('should return 404 Not Found when todo to restore is not found', async () => {
      mockTodoService.restore.mockRejectedValue(
        AppError.notFound('Deleted todo not found')
      );

      const res = await request(app)
        .patch('/api/todo/999/restore')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // ENDPOINT 8: DELETE /api/todo/:id/permanent
  // =========================================================================
  describe('DELETE /api/todo/:id/permanent', () => {
    it('should return 200 OK when todo is permanently deleted', async () => {
      mockTodoService.forceDelete.mockResolvedValue(true);

      const res = await request(app)
        .delete('/api/todo/1/permanent')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('permanently deleted');
      expect(mockTodoService.forceDelete).toHaveBeenCalledWith(1, 10);
    });

    it('should return 404 Not Found when todo to permanently delete is not found', async () => {
      mockTodoService.forceDelete.mockRejectedValue(
        AppError.notFound('Deleted todo not found for permanent deletion')
      );

      const res = await request(app)
        .delete('/api/todo/999/permanent')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
