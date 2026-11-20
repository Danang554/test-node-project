const request = require('supertest');
const CategoryController = require('../../src/interfaces/http/controllers/CategoryController');
const AppError = require('../../src/interfaces/http/utils/AppError');
const { generateToken, createTestApp } = require('../helpers/test-helper');

describe('CategoryController (Unit Tests)', () => {
  let app;
  let mockCategoryService;
  let userToken;

  beforeEach(() => {
    mockCategoryService = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getAllDeleted: jest.fn(),
      restore: jest.fn(),
      forceDelete: jest.fn()
    };

    const categoryController = new CategoryController(mockCategoryService);

    app = createTestApp({
      categoryController,
      revokedTokenRepository: { isRevoked: jest.fn().mockResolvedValue(false) }
    });

    userToken = generateToken({ id: 10, email: 'owner@example.com' });
  });

  // =========================================================================
  // ENDPOINT 1: GET /api/category
  // =========================================================================
  describe('GET /api/category', () => {
    it('should return 200 OK with paginated categories for authenticated user', async () => {
      mockCategoryService.getAll.mockResolvedValue({
        categories: [
          { id: 1, user_id: 10, name: 'Work' },
          { id: 2, user_id: 10, name: 'Personal' }
        ],
        total: 2
      });

      const res = await request(app)
        .get('/api/category?page=1&limit=10&search=work')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination).toHaveProperty('total_items', 2);
      expect(mockCategoryService.getAll).toHaveBeenCalledWith({
        userId: 10,
        page: 1,
        limit: 10,
        search: 'work'
      });
    });

    it('should return 401 Unauthorized when token is missing', async () => {
      const res = await request(app).get('/api/category');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(mockCategoryService.getAll).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // ENDPOINT 2: POST /api/category
  // =========================================================================
  describe('POST /api/category', () => {
    it('should return 201 Created when category is created', async () => {
      mockCategoryService.create.mockResolvedValue({
        id: 1,
        user_id: 10,
        name: 'Work',
        description: 'Work category'
      });

      const res = await request(app)
        .post('/api/category')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Work', description: 'Work category' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Work');
      expect(mockCategoryService.create).toHaveBeenCalledWith({
        userId: 10,
        name: 'Work',
        description: 'Work category'
      });
    });

    it('should return 400 Bad Request when category name is empty', async () => {
      const res = await request(app)
        .post('/api/category')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toHaveProperty('name');
      expect(mockCategoryService.create).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // ENDPOINT 3: GET /api/category/deleted
  // =========================================================================
  describe('GET /api/category/deleted', () => {
    it('should return 200 OK with soft deleted categories', async () => {
      mockCategoryService.getAllDeleted.mockResolvedValue({
        categories: [{ id: 5, user_id: 10, name: 'Archived', deleted_at: '2026-11-20T00:00:00Z' }],
        total: 1
      });

      const res = await request(app)
        .get('/api/category/deleted')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  // =========================================================================
  // ENDPOINT 4: GET /api/category/:id
  // =========================================================================
  describe('GET /api/category/:id', () => {
    it('should return 200 OK with category details', async () => {
      mockCategoryService.getById.mockResolvedValue({
        id: 1,
        user_id: 10,
        name: 'Work'
      });

      const res = await request(app)
        .get('/api/category/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
      expect(mockCategoryService.getById).toHaveBeenCalledWith(1, 10);
    });

    it('should return 404 Not Found if category does not exist', async () => {
      mockCategoryService.getById.mockRejectedValue(
        AppError.notFound('Category not found')
      );

      const res = await request(app)
        .get('/api/category/999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // ENDPOINT 5: PATCH /api/category/:id
  // =========================================================================
  describe('PATCH /api/category/:id', () => {
    it('should return 200 OK with updated category', async () => {
      mockCategoryService.update.mockResolvedValue({
        id: 1,
        user_id: 10,
        name: 'Updated Category'
      });

      const res = await request(app)
        .patch('/api/category/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Category' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Category');
      expect(mockCategoryService.update).toHaveBeenCalledWith(1, 10, { name: 'Updated Category' });
    });

    it('should return 404 Not Found if category does not exist', async () => {
      mockCategoryService.update.mockRejectedValue(
        AppError.notFound('Category not found')
      );

      const res = await request(app)
        .patch('/api/category/999')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'New Name' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // ENDPOINT 6: DELETE /api/category/:id
  // =========================================================================
  describe('DELETE /api/category/:id', () => {
    it('should return 200 OK when category is soft-deleted', async () => {
      mockCategoryService.delete.mockResolvedValue(true);

      const res = await request(app)
        .delete('/api/category/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('soft deleted');
      expect(mockCategoryService.delete).toHaveBeenCalledWith(1, 10);
    });

    it('should return 404 Not Found when category to delete is not found', async () => {
      mockCategoryService.delete.mockRejectedValue(
        AppError.notFound('Category not found')
      );

      const res = await request(app)
        .delete('/api/category/999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // ENDPOINT 7: PATCH /api/category/:id/restore
  // =========================================================================
  describe('PATCH /api/category/:id/restore', () => {
    it('should return 200 OK when category is restored', async () => {
      mockCategoryService.restore.mockResolvedValue({
        id: 1,
        user_id: 10,
        name: 'Restored Category',
        deleted_at: null
      });

      const res = await request(app)
        .patch('/api/category/1/restore')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deleted_at).toBeNull();
      expect(mockCategoryService.restore).toHaveBeenCalledWith(1, 10);
    });

    it('should return 404 Not Found when category to restore is not found', async () => {
      mockCategoryService.restore.mockRejectedValue(
        AppError.notFound('Deleted category not found')
      );

      const res = await request(app)
        .patch('/api/category/999/restore')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // ENDPOINT 8: DELETE /api/category/:id/permanent
  // =========================================================================
  describe('DELETE /api/category/:id/permanent', () => {
    it('should return 200 OK when category is permanently deleted', async () => {
      mockCategoryService.forceDelete.mockResolvedValue(true);

      const res = await request(app)
        .delete('/api/category/1/permanent')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('permanently deleted');
      expect(mockCategoryService.forceDelete).toHaveBeenCalledWith(1, 10);
    });

    it('should return 404 Not Found when category to permanently delete is not found', async () => {
      mockCategoryService.forceDelete.mockRejectedValue(
        AppError.notFound('Deleted category not found for permanent deletion')
      );

      const res = await request(app)
        .delete('/api/category/999/permanent')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
