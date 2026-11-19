const request = require('supertest');
const createApp = require('../../src/interfaces/http/app');
const createRouter = require('../../src/interfaces/http/routes');
const config = require('../../src/config');

describe('Auth API Validation & Protection (Integration Test)', () => {
  let app;
  let mockAuthService;

  beforeAll(() => {
    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      logout: jest.fn()
    };

    const authController = {
      register: async (req, res, next) => {
        try {
          const user = await mockAuthService.register(req.body);
          res.status(201).json({ success: true, message: 'User registered', data: user });
        } catch (err) {
          next(err);
        }
      },
      login: async (req, res, next) => {
        try {
          const result = await mockAuthService.login(req.body);
          res.status(200).json({ success: true, message: 'Login successful', data: result });
        } catch (err) {
          next(err);
        }
      },
      logout: async (req, res) => {
        res.status(200).json({ success: true, message: 'Logout successful' });
      }
    };

    const router = createRouter({
      config,
      checkDbConnection: async () => true,
      authController
    });

    app = createApp(router);
  });

  it('POST /api/auth/register should fail validation if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors).toHaveProperty('name');
    expect(res.body.errors).toHaveProperty('email');
    expect(res.body.errors).toHaveProperty('password');
  });

  it('POST /api/auth/login should fail validation if email is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'invalid-email', password: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toHaveProperty('email');
  });

  it('POST /api/auth/logout without Bearer token should return 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .send({});

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
