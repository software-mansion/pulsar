import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app';

describe('HTTP Endpoints', () => {
  let app: any;

  beforeAll(() => {
    const setup = createApp();
    app = setup.app;
  });

  describe('GET /api/health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api/data', () => {
    it('should return data with query param', async () => {
      const response = await request(app).get('/api/data?id=123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', '123');
    });

    it('should return default id when no query param', async () => {
      const response = await request(app).get('/api/data');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('id', 'default');
    });
  });

  describe('POST /api/message', () => {
    it('should accept a message and return success', async () => {
      const response = await request(app).post('/api/message').send({ message: 'Hello, World!' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Message received');
      expect(response.body.data).toHaveProperty('message', 'Hello, World!');
    });

    it('should return 400 when message is missing', async () => {
      const response = await request(app).post('/api/message').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Message is required');
    });
  });

  describe('POST /api/broadcast', () => {
    it('should broadcast message to all clients', async () => {
      const response = await request(app)
        .post('/api/broadcast')
        .send({ message: 'Broadcast test' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Broadcast sent');
      expect(response.body).toHaveProperty('clientCount');
    });

    it('should return 400 when message is missing', async () => {
      const response = await request(app).post('/api/broadcast').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Message is required');
    });
  });
});
