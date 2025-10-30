const request = require('supertest');
const { app } = require('../src/app');

describe('Tasks API', () => {
  // Helper to create a task for testing
  const createTestTask = async (overrides = {}) => {
    const response = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Test task',
        description: 'Test description',
        priority: 'medium',
        ...overrides
      });
    return response.body;
  };

  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      const response = await request(app).get('/api/tasks');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('completed');
      expect(response.body[0]).toHaveProperty('priority');
      expect(response.body[0]).toHaveProperty('tags');
      expect(Array.isArray(response.body[0].tags)).toBe(true);
    });

    it('should filter tasks by status=active', async () => {
      const response = await request(app).get('/api/tasks?status=active');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(task => {
        expect(task.completed).toBe(false);
      });
    });

    it('should filter tasks by status=completed', async () => {
      // Create and complete a task
      const task = await createTestTask({ title: 'Task to complete' });
      await request(app).patch(`/api/tasks/${task.id}/toggle`);
      
      const response = await request(app).get('/api/tasks?status=completed');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      const completedTask = response.body.find(t => t.id === task.id);
      expect(completedTask).toBeDefined();
      expect(completedTask.completed).toBe(true);
    });

    it('should filter tasks by priority', async () => {
      const response = await request(app).get('/api/tasks?priority=high');
      
      expect(response.status).toBe(200);
      response.body.forEach(task => {
        expect(task.priority).toBe('high');
      });
    });

    it('should search tasks by title and return matching results', async () => {
      // Create a task with specific searchable title
      const searchTask = await createTestTask({ title: 'SEARCHABLE_UNIQUE_TITLE_12345' });
      
      const response = await request(app).get('/api/tasks?search=SEARCHABLE_UNIQUE_TITLE');
      
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Verify the search actually found our task
      const found = response.body.find(t => t.id === searchTask.id);
      expect(found).toBeDefined();
      expect(found.title).toContain('SEARCHABLE_UNIQUE_TITLE');
    });

    it('should search tasks by description', async () => {
      const searchTask = await createTestTask({ 
        title: 'Normal title',
        description: 'UNIQUE_DESCRIPTION_67890' 
      });
      
      const response = await request(app).get('/api/tasks?search=UNIQUE_DESCRIPTION');
      
      expect(response.status).toBe(200);
      const found = response.body.find(t => t.id === searchTask.id);
      expect(found).toBeDefined();
    });

    it('should return empty array when no tasks match search', async () => {
      const response = await request(app).get('/api/tasks?search=NONEXISTENT_SEARCH_TERM_999999');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should sort tasks by dueDate', async () => {
      const response = await request(app).get('/api/tasks?sortBy=dueDate');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task with all fields', async () => {
      const newTask = {
        title: 'Complete new task',
        description: 'Detailed description',
        priority: 'high',
        tags: ['test', 'api'],
        dueDate: new Date(Date.now() + 86400000).toISOString()
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(typeof response.body.id).toBe('string');
      expect(response.body.title).toBe('Complete new task');
      expect(response.body.description).toBe('Detailed description');
      expect(response.body.priority).toBe('high');
      expect(response.body.completed).toBe(false);
      expect(response.body.tags).toEqual(['test', 'api']);
      expect(response.body.dueDate).toBe(newTask.dueDate);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should trim whitespace from title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '   Whitespace task   ' });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Whitespace task');
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
      expect(response.body.error).toContain('title');
    });

    it('should reject task with whitespace-only title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '\t\n  \r' });

      expect(response.status).toBe(400);
    });

    it('should reject task with invalid priority', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test', priority: 'urgent' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Priority');
    });

    it('should reject task with invalid date format', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test', dueDate: 'not-a-date' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('date');
    });

    it('should use default priority if not provided', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Default priority task' });

      expect(response.status).toBe(201);
      expect(response.body.priority).toBe('medium');
    });

    it('should create task with null dueDate', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'No due date', dueDate: null });

      expect(response.status).toBe(201);
      expect(response.body.dueDate).toBeNull();
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task with all fields', async () => {
      const task = await createTestTask();
      const updates = {
        title: 'Updated task',
        description: 'Updated description',
        priority: 'low',
        completed: true,
        tags: ['updated'],
        dueDate: new Date(Date.now() + 172800000).toISOString()
      };

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated task');
      expect(response.body.description).toBe('Updated description');
      expect(response.body.priority).toBe('low');
      expect(response.body.completed).toBe(true);
      expect(response.body.tags).toEqual(['updated']);
      expect(response.body.updatedAt).not.toBe(task.updatedAt);
    });

    it('should update only specified fields (partial update)', async () => {
      const task = await createTestTask({ title: 'Original', priority: 'high' });
      
      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ priority: 'low' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Original'); // Unchanged
      expect(response.body.priority).toBe('low'); // Changed
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .put('/api/tasks/non-existent-id-12345')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });

    it('should reject empty title', async () => {
      const task = await createTestTask();
      
      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ title: '' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('title');
    });

    it('should reject invalid priority in update', async () => {
      const task = await createTestTask();
      
      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ priority: 'super-urgent' });

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/tasks/:id/toggle', () => {
    it('should toggle task from incomplete to complete', async () => {
      const task = await createTestTask();
      expect(task.completed).toBe(false);

      const response = await request(app)
        .patch(`/api/tasks/${task.id}/toggle`);

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(true);
      expect(response.body.id).toBe(task.id);
    });

    it('should toggle task from complete to incomplete', async () => {
      const task = await createTestTask();
      // First toggle to complete
      await request(app).patch(`/api/tasks/${task.id}/toggle`);
      
      // Then toggle back
      const response = await request(app)
        .patch(`/api/tasks/${task.id}/toggle`);

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(false);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .patch('/api/tasks/non-existent-id/toggle');

      expect(response.status).toBe(404);
    });

    it('should update updatedAt timestamp', async () => {
      const task = await createTestTask();
      const originalUpdatedAt = task.updatedAt;
      
      // Small delay to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const response = await request(app)
        .patch(`/api/tasks/${task.id}/toggle`);

      expect(response.status).toBe(200);
      expect(response.body.updatedAt).not.toBe(originalUpdatedAt);
    });
  });

  describe('POST /api/tasks/bulk', () => {
    it('should complete multiple tasks', async () => {
      const task1 = await createTestTask({ title: 'Bulk task 1' });
      const task2 = await createTestTask({ title: 'Bulk task 2' });
      const taskIds = [task1.id, task2.id];

      const response = await request(app)
        .post('/api/tasks/bulk')
        .send({ action: 'complete', taskIds });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);

      // Verify tasks are completed by fetching them
      const task1Check = await request(app).get(`/api/tasks?search=${task1.title}`);
      const task2Check = await request(app).get(`/api/tasks?search=${task2.title}`);
      
      const updatedTask1 = task1Check.body.find(t => t.id === task1.id);
      const updatedTask2 = task2Check.body.find(t => t.id === task2.id);
      
      expect(updatedTask1.completed).toBe(true);
      expect(updatedTask2.completed).toBe(true);
    });

    it('should uncomplete multiple tasks', async () => {
      const task1 = await createTestTask({ title: 'Uncomplete test 1' });
      const task2 = await createTestTask({ title: 'Uncomplete test 2' });
      const taskIds = [task1.id, task2.id];
      
      // First complete them
      await request(app).post('/api/tasks/bulk').send({ action: 'complete', taskIds });
      
      // Then uncomplete
      const response = await request(app)
        .post('/api/tasks/bulk')
        .send({ action: 'uncomplete', taskIds });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);
    });

    it('should delete multiple tasks', async () => {
      const task1 = await createTestTask({ title: 'Delete bulk 1' });
      const task2 = await createTestTask({ title: 'Delete bulk 2' });
      const taskIds = [task1.id, task2.id];

      const response = await request(app)
        .post('/api/tasks/bulk')
        .send({ action: 'delete', taskIds });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);

      // Verify tasks are deleted
      const allTasks = await request(app).get('/api/tasks');
      const deletedTask1 = allTasks.body.find(t => t.id === task1.id);
      const deletedTask2 = allTasks.body.find(t => t.id === task2.id);
      
      expect(deletedTask1).toBeUndefined();
      expect(deletedTask2).toBeUndefined();
    });

    it('should reject invalid action', async () => {
      const task = await createTestTask();
      
      const response = await request(app)
        .post('/api/tasks/bulk')
        .send({ action: 'invalid', taskIds: [task.id] });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('action');
    });

    it('should reject empty taskIds array', async () => {
      const response = await request(app)
        .post('/api/tasks/bulk')
        .send({ action: 'complete', taskIds: [] });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('taskIds');
    });

    it('should reject missing taskIds', async () => {
      const response = await request(app)
        .post('/api/tasks/bulk')
        .send({ action: 'complete' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task and verify deletion', async () => {
      const task = await createTestTask({ title: 'Task to delete' });
      
      const response = await request(app)
        .delete(`/api/tasks/${task.id}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted');
      expect(response.body.id).toBe(task.id);

      // Verify task is actually deleted
      const getResponse = await request(app).get('/api/tasks');
      const deletedTask = getResponse.body.find(t => t.id === task.id);
      expect(deletedTask).toBeUndefined();
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/api/tasks/non-existent-id-99999');

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });

    it('should return 404 when deleting already deleted task', async () => {
      const task = await createTestTask();
      
      // Delete once
      await request(app).delete(`/api/tasks/${task.id}`);
      
      // Try to delete again
      const response = await request(app).delete(`/api/tasks/${task.id}`);
      
      expect(response.status).toBe(404);
    });
  });
});
