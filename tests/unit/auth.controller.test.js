const request = require('supertest');
const AuthController = require('../../src/interfaces/http/controllers/AuthController');
const UserController = require('../../src/interfaces/http/controllers/UserController');
const AppError = require('../../src/interfaces/http/utils/AppError');
const { generateToken, createTestApp } = require('../helpers/test-helper');

describe('AuthController & Profile Endpoints (Unit Tests)', () => {
  let app;
  let mockAuthService;
  let mockUserService;
  let mockRevokedTokenRepo;

  beforeEach(() => {
    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      getProfile: jest.fn(),
      updateProfile: jest.fn()
    };

    mockUserService = {};

    mockRevokedTokenRepo = {
      isRevoked: jest.fn().mockResolvedValue(false),
      create: jest.fn().mockResolvedValue(true)
    };

    const authController = new AuthController(mockAuthService);
    const userController = new UserController(mockUserService, mockAuthService);

    app = createTestApp({
      authController,
      userController,
      revokedTokenRepository: mockRevokedTokenRepo
    });
  });

  // =========================================================================
  // ENDPOINT 1: POST /api/auth/register
  // =========================================================================
  describe('POST /api/auth/register', () => {
    it('should return 201 Created when payload is valid', async () => {
      mockAuthService.register.mockResolvedValue({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        is_admin: false
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('john@example.com');
      expect(mockAuthService.register).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });
    });

    it('should return 400 Bad Request when validation fails (missing fields)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toHaveProperty('name');
      expect(res.body.errors).toHaveProperty('email');
      expect(res.body.errors).toHaveProperty('password');
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should return 409 Conflict when email is already registered', async () => {
      mockAuthService.register.mockRejectedValue(
        AppError.conflict('Email is already registered')
      );

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'duplicate@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Email is already registered');
    });
  });

  // =========================================================================
  // ENDPOINT 2: POST /api/auth/login
  // =========================================================================
  describe('POST /api/auth/login', () => {
    it('should return 200 OK with token when credentials are valid', async () => {
      mockAuthService.login.mockResolvedValue({
        token: 'sample.jwt.token',
        user: { id: 1, email: 'john@example.com', is_admin: false }
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token', 'sample.jwt.token');
      expect(res.body.data.user.email).toBe('john@example.com');
    });

    it('should return 400 Bad Request when payload is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: ''
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should return 401 Unauthorized when credentials do not match', async () => {
      mockAuthService.login.mockRejectedValue(
        AppError.unauthorized('Invalid email or password')
      );

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });
  });

  // =========================================================================
  // ENDPOINT 3: POST /api/auth/logout
  // =========================================================================
  describe('POST /api/auth/logout', () => {
    it('should return 200 OK when authenticated and logout succeeds', async () => {
      mockAuthService.logout.mockResolvedValue(true);
      const token = generateToken({ id: 1, email: 'user@example.com' });

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logout successful');
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('should return 401 Unauthorized when authorization header is missing', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(mockAuthService.logout).not.toHaveBeenCalled();
    });

    it('should return 401 Unauthorized when token is revoked', async () => {
      mockRevokedTokenRepo.isRevoked.mockResolvedValue(true);
      const token = generateToken({ id: 1 });

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(mockAuthService.logout).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // ENDPOINT 4: GET /api/profile
  // =========================================================================
  describe('GET /api/profile', () => {
    it('should return 200 OK with logged-in user profile', async () => {
      mockAuthService.getProfile.mockResolvedValue({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        is_admin: false
      });
      const token = generateToken({ id: 1, email: 'john@example.com' });

      const res = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
      expect(mockAuthService.getProfile).toHaveBeenCalledWith(1);
    });

    it('should return 401 Unauthorized when no token provided', async () => {
      const res = await request(app).get('/api/profile');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(mockAuthService.getProfile).not.toHaveBeenCalled();
    });

    it('should return 404 Not Found when user does not exist in service', async () => {
      mockAuthService.getProfile.mockRejectedValue(
        AppError.notFound('User not found')
      );
      const token = generateToken({ id: 999 });

      const res = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // ENDPOINT 5: PATCH /api/profile
  // =========================================================================
  describe('PATCH /api/profile', () => {
    it('should return 200 OK with updated profile', async () => {
      mockAuthService.updateProfile.mockResolvedValue({
        id: 1,
        name: 'Updated Name',
        email: 'john@example.com'
      });
      const token = generateToken({ id: 1 });

      const res = await request(app)
        .patch('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Name');
      expect(mockAuthService.updateProfile).toHaveBeenCalledWith(1, { name: 'Updated Name' });
    });

    it('should return 400 Bad Request when validation fails', async () => {
      const token = generateToken({ id: 1 });

      const res = await request(app)
        .patch('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'not-an-email' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(mockAuthService.updateProfile).not.toHaveBeenCalled();
    });

    it('should return 409 Conflict when new email is already in use', async () => {
      mockAuthService.updateProfile.mockRejectedValue(
        AppError.conflict('Email is already used by another account')
      );
      const token = generateToken({ id: 1 });

      const res = await request(app)
        .patch('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'taken@example.com' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });
});
