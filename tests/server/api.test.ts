// install dependencies: npm install supertest express cors

import request from 'supertest';
import express from 'express';
import cors from 'cors';

// Create Express app for testing
const app = express();
app.use(cors());
app.use(express.json());

// Error handling middleware for malformed JSON
app.use((err: any, _req: any, res: any, next: any) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  next(err);
});

// Mock routes
app.get('/api/db-info', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

app.get('/api/users/:id/results', (req, res) => {
  const { id } = req.params;
  if (id === 'default_user') {
    res.json([
      {
        id: 1,
        test_id: 'test_123',
        category: 'lowercase',
        wpm: 45,
        accuracy: 95,
        errors: 2,
        total_characters: 100,
        correct_characters: 98,
        time_elapsed: 80000,
        timestamp: Date.now(),
        hash: 'test_hash_123'
      }
    ]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/api/results', (req, res) => {
  const result = req.body;
  if (!result.userId || !result.testId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  res.status(201).json({ 
    success: true, 
    message: 'Result saved successfully',
    id: Math.floor(Math.random() * 1000)
  });
});

// 404 handler for unsupported routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

describe('API Endpoints', () => {
  describe('GET /api/db-info', () => {
    it('should return database info', async () => {
      const response = await request(app)
        .get('/api/db-info')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        version: '1.0.0'
      });
    });
  });

  describe('GET /api/users/:id/results', () => {
    it('should return user results for valid user', async () => {
      const response = await request(app)
        .get('/api/users/default_user/results')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0]).toHaveProperty('test_id', 'test_123');
      expect(response.body[0]).toHaveProperty('wpm', 45);
    });

    it('should return 404 for invalid user', async () => {
      await request(app)
        .get('/api/users/invalid_user/results')
        .expect(404);
    });
  });

  describe('POST /api/results', () => {
    it('should create new result with valid data', async () => {
      const resultData = {
        userId: 'test_user',
        testId: 'test_456',
        category: 'practice',
        wpm: 50,
        accuracy: 98,
        errors: 1,
        totalCharacters: 200,
        correctCharacters: 196,
        timeElapsed: 120000,
        timestamp: Date.now()
      };

      const response = await request(app)
        .post('/api/results')
        .send(resultData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('id');
    });

    it('should return 400 for missing required fields', async () => {
      const invalidData = {
        category: 'practice',
        wpm: 50
      };

      const response = await request(app)
        .post('/api/results')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/results')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body.error).toBe('Invalid JSON format');
    });

    it('should return 404 for unsupported routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.error).toBe('Route not found');
      expect(response.body.path).toBe('/api/nonexistent');
    });
  });
});
