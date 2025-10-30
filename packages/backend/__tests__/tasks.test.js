const request = require('supertest');
const { app } = require('../src/app');

describe('Tasks API', () => {
  let createdTaskId;

  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      const response = await request(app).get('/api/tasks');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('completed');
    });

    it('should filter tasks by status', async () => {
      const response = await request(app).get('/api/tasks?status=active');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(task => {
        expect(task.completed).toBe(false);
      });
    });

    it('should filter tasks by priority', async () => {
      const response = await request(app).get('/api/tasks?priority=high');
      
      expect(response.status).toBe(200);
      response.body.forEach(task => {
        expect(task.priority).toBe('high');
      });
    });

    it('should search tasks by title', async () => {
      const response = await request(app).get('/api/tasks?search=project');
      
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTask = {
        title: 'Test task',
        description: 'Test description',
        priority: 'high',
        tags: ['test', 'api']
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test task');
      expect(response.body.description).toBe('Test description');
      expect(response.body.priority).toBe('high');
      expect(response.body.completed).toBe(false);
      expect(response.body.tags).toEqual(['test', 'api']);

      createdTaskId = response.body.id;
    });

    it('should reject task without title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ description: 'No title' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('title');
    });

    it('should reject task with empty title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '   ' });

      expect(response.status).toBe(400);
    });

    it('should reject task with invalid priority', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test', priority: 'urgent' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Priority');
    });

    it('should use default priority if not provided', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Default priority task' });

      expect(response.status).toBe(201);
      expect(response.body.priority).toBe('medium');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const updates = {
        title: 'Updated task',
        priority: 'low',
        completed: true
      };

      const response = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated task');
      expect(response.body.priority).toBe('low');
      expect(response.body.completed).toBe(true);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .put('/api/tasks/non-existent-id')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
    });

    it('should reject empty title', async () => {
      const response = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .send({ title: '' });

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/tasks/:id/toggle', () => {
    it('should toggle task completion status', async () => {
      // First, get current status
      const getResponse = await request(app).get('/api/tasks');
      const task = getResponse.body.find(t => t.id === createdTaskId);
      const initialStatus = task.completed;

      // Toggle
      const response = await request(app)
        .patch(`/api/tasks/${createdTaskId}/toggle`);

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(!initialStatus);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .patch('/api/tasks/non-existent-id/toggle');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/tasks/bulk', () => {
    let bulkTaskIds;

    beforeAll(async () => {
      // Create tasks for bulk operations
      const task1 = await request(app).post('/api/tasks').send({ title: 'Bulk task 1' });
      const task2 = await request(app).post('/api/tasks').send({ title: 'Bulk task 2' });
      bulkTaskIds = [task1.body.id, task2.body.id];
    });

    it('should complete multiple tasks', async () => {
      const response = await request(app)
        .post('/api/tasks/bulk')
        .send({ action: 'complete', taskIds: bulkTaskIds });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);

      // Verify tasks are completed
      const tasks = await request(app).get('/api/tasks');
      bulkTaskIds.forEach(id => {
        const task = tasks.body.find(t => t.id === id);
        expect(task.completed).toBe(true);
      });
    });

    it('should uncomplete multiple tasks', async () => {
      const response = await request(app)
        .post('/api/tasks/bulk')
        .send({ action: 'uncomplete', taskIds: bulkTaskIds });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);
    });

    it('should delete multiple tasks', async () => {
      const response = await request(app)
        .post('/api/tasks/bulk')
        .send({ action: 'delete', taskIds: bulkTaskIds });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);

      // Verify tasks are deleted
      const tasks = await request(app).get('/api/tasks');
      bulkTaskIds.forEach(id => {
        const task = tasks.body.find(t => t.id === id);
        expect(task).toBeUndefined();
      });
    });

    it('should reject invalid action', async () => {
      const response = await request(app)
        .post('/api/tasks/bulk')
        .send({ action: 'invalid', taskIds: [createdTaskId] });

      expect(response.status).toBe(400);
    });

    it('should reject empty taskIds array', async () => {
      const response = await request(app)
        .post('/api/tasks/bulk')
        .send({ action: 'complete', taskIds: [] });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${createdTaskId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted');

      // Verify task is deleted
      const getResponse = await request(app).get('/api/tasks');
      const deletedTask = getResponse.body.find(t => t.id === createdTaskId);
      expect(deletedTask).toBeUndefined();
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/api/tasks/non-existent-id');

      expect(response.status).toBe(404);
    });
  });
});
