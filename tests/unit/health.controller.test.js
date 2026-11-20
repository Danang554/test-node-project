const request = require('supertest');
const { createTestApp } = require('../helpers/test-helper');

describe('Health Check Endpoint (Unit Tests)', () => {
  it('GET /health should return 200 OK with connected database status', async () => {
    const app = createTestApp({
      checkDbConnection: async () => true
    });

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Service is running healthy');
    expect(res.body.data.database).toBe('connected');
  });

  it('GET /health should return 200 OK with disconnected database status when DB fails', async () => {
    const app = createTestApp({
      checkDbConnection: async () => false
    });

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.database).toBe('disconnected');
  });
});
