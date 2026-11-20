const request = require('supertest');
const UserController = require('../../src/interfaces/http/controllers/UserController');
const AppError = require('../../src/interfaces/http/utils/AppError');
const { generateToken, createTestApp } = require('../helpers/test-helper');

describe('UserController (Unit Tests)', () => {
  let app;
  let mockUserService;
  let mockAuthService;
  let adminToken;
  let regularUserToken;

  beforeEach(() => {
    mockUserService = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getAllDeleted: jest.fn(),
      getDeletedById: jest.fn(),
      restore: jest.fn(),
      forceDelete: jest.fn()
    };

    mockAuthService = {};

    const userController = new UserController(mockUserService, mockAuthService);

    app = createTestApp({
      userController,
      revokedTokenRepository: { isRevoked: jest.fn().mockResolvedValue(false) }
    });

    adminToken = generateToken({ id: 1, email: 'admin@example.com', is_admin: true });
    regularUserToken = generateToken({ id: 2, email: 'user@example.com', is_admin: false });
  });

  // =========================================================================
  // ENDPOINT 1: GET /api/user
  // =========================================================================
  describe('GET /api/user', () => {
    it('should return 200 OK with paginated users for admin', async () => {
      mockUserService.getAll.mockResolvedValue({
        users: [
          { id: 1, name: 'Admin', email: 'admin@example.com', is_admin: true },
          { id: 2, name: 'User', email: 'user@example.com', is_admin: false }
        ],
        total: 2
      });

      const res = await request(app)
        .get('/api/user?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination).toHaveProperty('total_items', 2);
      expect(mockUserService.getAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: ''
      });
    });

    it('should return 403 Forbidden for non-admin user', async () => {
      const res = await request(app)
        .get('/api/user')
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(mockUserService.getAll).not.toHaveBeenCalled();
    });

    it('should return 401 Unauthorized when no token is provided', async () => {
      const res = await request(app).get('/api/user');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // ENDPOINT 2: POST /api/user
  // =========================================================================
  describe('POST /api/user', () => {
    it('should return 201 Created when admin creates a user', async () => {
      mockUserService.create.mockResolvedValue({
        id: 3,
        name: 'New Staff',
        email: 'staff@example.com',
        is_admin: false
      });

      const res = await request(app)
        .post('/api/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Staff',
          email: 'staff@example.com',
          password: 'password123',
          is_admin: false
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(3);
    });

    it('should return 400 Bad Request on invalid input', async () => {
      const res = await request(app)
        .post('/api/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'A' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(mockUserService.create).not.toHaveBeenCalled();
    });

    it('should return 409 Conflict if email already exists', async () => {
      mockUserService.create.mockRejectedValue(
        AppError.conflict('Email is already registered')
      );

      const res = await request(app)
        .post('/api/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Staff',
          email: 'duplicate@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // ENDPOINT 3: GET /api/user/deleted
  // =========================================================================
  describe('GET /api/user/deleted', () => {
    it('should return 200 OK with soft deleted users list for admin', async () => {
      mockUserService.getAllDeleted.mockResolvedValue({
        users: [{ id: 5, name: 'Deleted User', deleted_at: '2026-11-20T00:00:00Z' }],
        total: 1
      });

      const res = await request(app)
        .get('/api/user/deleted')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  // =========================================================================
  // ENDPOINT 4: GET /api/user/:id
  // =========================================================================
  describe('GET /api/user/:id', () => {
    it('should return 200 OK with user details', async () => {
      mockUserService.getById.mockResolvedValue({
        id: 2,
        name: 'User 2',
        email: 'user2@example.com'
      });

      const res = await request(app)
        .get('/api/user/2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(2);
      expect(mockUserService.getById).toHaveBeenCalledWith(2);
    });

    it('should return 404 Not Found if user does not exist', async () => {
      mockUserService.getById.mockRejectedValue(
        AppError.notFound('User not found')
      );

      const res = await request(app)
        .get('/api/user/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // ENDPOINT 5: PATCH /api/user/:id
  // =========================================================================
  describe('PATCH /api/user/:id', () => {
    it('should return 200 OK with updated user data', async () => {
      mockUserService.update.mockResolvedValue({
        id: 2,
        name: 'Updated Name',
        email: 'user@example.com'
      });

      const res = await request(app)
        .patch('/api/user/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Name');
      expect(mockUserService.update).toHaveBeenCalledWith(2, { name: 'Updated Name' });
    });

    it('should return 404 Not Found if updating non-existent user', async () => {
      mockUserService.update.mockRejectedValue(
        AppError.notFound('User not found')
      );

      const res = await request(app)
        .patch('/api/user/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // ENDPOINT 6: DELETE /api/user/:id
  // =========================================================================
  describe('DELETE /api/user/:id', () => {
    it('should return 200 OK when user is soft-deleted', async () => {
      mockUserService.delete.mockResolvedValue(true);

      const res = await request(app)
        .delete('/api/user/2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('soft deleted');
      expect(mockUserService.delete).toHaveBeenCalledWith(2);
    });

    it('should return 404 Not Found if user to delete does not exist', async () => {
      mockUserService.delete.mockRejectedValue(
        AppError.notFound('User not found')
      );

      const res = await request(app)
        .delete('/api/user/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // ENDPOINT 7: PATCH /api/user/:id/restore
  // =========================================================================
  describe('PATCH /api/user/:id/restore', () => {
    it('should return 200 OK when soft-deleted user is restored', async () => {
      mockUserService.restore.mockResolvedValue({
        id: 2,
        name: 'Restored User',
        deleted_at: null
      });

      const res = await request(app)
        .patch('/api/user/2/restore')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deleted_at).toBeNull();
      expect(mockUserService.restore).toHaveBeenCalledWith(2);
    });

    it('should return 404 Not Found if deleted user to restore not found', async () => {
      mockUserService.restore.mockRejectedValue(
        AppError.notFound('Deleted user not found')
      );

      const res = await request(app)
        .patch('/api/user/999/restore')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // ENDPOINT 8: DELETE /api/user/:id/permanent
  // =========================================================================
  describe('DELETE /api/user/:id/permanent', () => {
    it('should return 200 OK when user is permanently deleted', async () => {
      mockUserService.forceDelete.mockResolvedValue(true);

      const res = await request(app)
        .delete('/api/user/2/permanent')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('permanently deleted');
      expect(mockUserService.forceDelete).toHaveBeenCalledWith(2);
    });

    it('should return 404 Not Found if user to permanently delete not found', async () => {
      mockUserService.forceDelete.mockRejectedValue(
        AppError.notFound('Deleted user not found for permanent deletion')
      );

      const res = await request(app)
        .delete('/api/user/999/permanent')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
