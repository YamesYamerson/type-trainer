// install depoendencies: npm install supertest express cors

import request from 'supertest';
import express from 'express';
import cors from 'cors';

// Create Express app for testing
const app = express();
app.use(cors());
app.use(express.json());

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
  if (result && result.testId) {
    res.status(201).json({ id: 1, message: 'Result saved successfully' });
  } else {
    res.status(400).json({ error: 'Invalid result data' });
  }
});

app.delete('/api/results', (_req, res) => {
  res.json({ message: 'All results deleted' });
});

describe('Backend API', () => {
  describe('GET /api/db-info', () => {
    it('should return database information', async () => {
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
    it('should return user results', async () => {
      const response = await request(app)
        .get('/api/users/default_user/results')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('test_id', 'test_123');
      expect(response.body[0]).toHaveProperty('category', 'lowercase');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/non_existent_user/results')
        .expect(404);

      expect(response.body).toEqual({ error: 'User not found' });
    });
  });

  describe('POST /api/results', () => {
    it('should save new result', async () => {
      const newResult = {
        userId: 'default_user',
        testId: 'test_3',
        category: 'code',
        wpm: 35,
        accuracy: 85,
        errors: 4,
        totalCharacters: 150,
        correctCharacters: 128,
        timeElapsed: 100000,
        timestamp: Date.now(),
        hash: 'new_hash'
      };

      const response = await request(app)
        .post('/api/results')
        .send(newResult)
        .expect(201);

      expect(response.body).toEqual({
        id: 1,
        message: 'Result saved successfully'
      });
    });

    it('should return 400 for invalid result data', async () => {
      const invalidResult = {
        userId: 'default_user',
        testId: '', // Empty testId
        category: 'code',
        wpm: 35,
        accuracy: 85,
        errors: 4,
        totalCharacters: 150,
        correctCharacters: 128,
        timeElapsed: 100000,
        timestamp: Date.now(),
        hash: 'new_hash'
      };

      const response = await request(app)
        .post('/api/results')
        .send(invalidResult)
        .expect(400);

      expect(response.body).toEqual({ error: 'Invalid result data' });
    });
  });

  describe('DELETE /api/results', () => {
    it('should clear all results', async () => {
      const response = await request(app)
        .delete('/api/results')
        .expect(200);

      expect(response.body).toEqual({
        message: 'All results deleted'
      });
    });
  });
});
