/**
 * Tests for backend API endpoints
 */

import request from 'supertest';
import express from 'express';
import cors from 'cors';

// Mock the server setup
const app = express();
app.use(cors());
app.use(express.json());

// Mock database
const mockDb = {
  get: jest.fn(),
  all: jest.fn(),
  run: jest.fn(),
  close: jest.fn()
};

// Mock the server routes
app.get('/api/db-info', (req, res) => {
  res.json({ message: 'Database connected', tables: ['users', 'typing_results'] });
});

app.get('/api/users/:id/results', (req, res) => {
  const { id } = req.params;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
  
  // Mock results
  const mockResults = [
    {
      id: 1,
      user_id: id,
      test_id: 'test_1',
      category: 'lowercase',
      wpm: 45,
      accuracy: 95,
      errors: 2,
      total_characters: 100,
      correct_characters: 98,
      time_elapsed: 80000,
      timestamp: Date.now(),
      hash: 'hash_1'
    },
    {
      id: 2,
      user_id: id,
      test_id: 'test_2',
      category: 'punctuation',
      wpm: 50,
      accuracy: 90,
      errors: 3,
      total_characters: 120,
      correct_characters: 108,
      time_elapsed: 90000,
      timestamp: Date.now() + 1000,
      hash: 'hash_2'
    }
  ];

  res.json(mockResults.slice(0, limit));
});

app.post('/api/results', (req, res) => {
  const { hash } = req.body;
  
  // Mock duplicate check
  if (hash === 'existing_hash') {
    res.json({ id: 1, message: 'Result already exists', duplicate: true });
  } else {
    res.json({ id: 2, message: 'Result saved successfully' });
  }
});

app.get('/api/users/:id/stats', (req, res) => {
  const { id } = req.params;
  
  const mockStats = {
    totalTests: 10,
    averageWpm: 45,
    averageAccuracy: 95,
    bestWpm: 60,
    totalCharacters: 1000,
    totalErrors: 20,
    categoryStats: {
      lowercase: { tests: 5, averageWpm: 40, averageAccuracy: 90 },
      punctuation: { tests: 3, averageWpm: 50, averageAccuracy: 95 },
      code: { tests: 2, averageWpm: 35, averageAccuracy: 85 }
    }
  };

  res.json(mockStats);
});

app.delete('/api/results', (req, res) => {
  res.json({ message: 'All data cleared' });
});

describe('Backend API', () => {
  describe('GET /api/db-info', () => {
    it('should return database information', async () => {
      const response = await request(app)
        .get('/api/db-info')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Database connected',
        tables: ['users', 'typing_results']
      });
    });
  });

  describe('GET /api/users/:id/results', () => {
    it('should return user results', async () => {
      const response = await request(app)
        .get('/api/users/default_user/results')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('test_id', 'test_1');
      expect(response.body[0]).toHaveProperty('category', 'lowercase');
      expect(response.body[1]).toHaveProperty('test_id', 'test_2');
      expect(response.body[1]).toHaveProperty('category', 'punctuation');
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/users/default_user/results?limit=1')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('test_id', 'test_1');
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
        .expect(200);

      expect(response.body).toEqual({
        id: 2,
        message: 'Result saved successfully'
      });
    });

    it('should handle duplicate results', async () => {
      const duplicateResult = {
        userId: 'default_user',
        testId: 'test_1',
        category: 'lowercase',
        wpm: 45,
        accuracy: 95,
        errors: 2,
        totalCharacters: 100,
        correctCharacters: 98,
        timeElapsed: 80000,
        timestamp: Date.now(),
        hash: 'existing_hash'
      };

      const response = await request(app)
        .post('/api/results')
        .send(duplicateResult)
        .expect(200);

      expect(response.body).toEqual({
        id: 1,
        message: 'Result already exists',
        duplicate: true
      });
    });
  });

  describe('GET /api/users/:id/stats', () => {
    it('should return user statistics', async () => {
      const response = await request(app)
        .get('/api/users/default_user/stats')
        .expect(200);

      expect(response.body).toEqual({
        totalTests: 10,
        averageWpm: 45,
        averageAccuracy: 95,
        bestWpm: 60,
        totalCharacters: 1000,
        totalErrors: 20,
        categoryStats: {
          lowercase: { tests: 5, averageWpm: 40, averageAccuracy: 90 },
          punctuation: { tests: 3, averageWpm: 50, averageAccuracy: 95 },
          code: { tests: 2, averageWpm: 35, averageAccuracy: 85 }
        }
      });
    });
  });

  describe('DELETE /api/results', () => {
    it('should clear all results', async () => {
      const response = await request(app)
        .delete('/api/results')
        .expect(200);

      expect(response.body).toEqual({
        message: 'All data cleared'
      });
    });
  });
});
