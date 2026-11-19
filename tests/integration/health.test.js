const request = require('supertest');
const createApp = require('../../src/interfaces/http/app');
const createRouter = require('../../src/interfaces/http/routes');
const config = require('../../src/config');

describe('Health Check API (Integration Test)', () => {
  let app;

  beforeAll(() => {
    const router = createRouter({
      config,
      checkDbConnection: async () => true
    });
    app = createApp(router);
  });

  it('GET /health should return 200 OK and connected status', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Service is running healthy');
    expect(res.body.data).toHaveProperty('app_name', config.app.name);
    expect(res.body.data).toHaveProperty('database', 'connected');
  });

  it('GET /non-existent-route should return 404', async () => {
    const res = await request(app).get('/random-path-unknown');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
