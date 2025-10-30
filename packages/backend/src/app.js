const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    dueDate TEXT,
    priority TEXT DEFAULT 'medium',
    tags TEXT,
    completed INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`);

// Insert some initial data
const { randomUUID } = require('crypto');
const now = new Date().toISOString();

const initialTasks = [
  { title: 'Complete project documentation', priority: 'high', dueDate: new Date(Date.now() + 86400000).toISOString() },
  { title: 'Review pull requests', priority: 'medium', dueDate: null },
  { title: 'Update dependencies', priority: 'low', dueDate: null }
];

const insertStmt = db.prepare(`
  INSERT INTO tasks (id, title, description, dueDate, priority, tags, completed, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

initialTasks.forEach(task => {
  insertStmt.run(
    randomUUID(),
    task.title,
    task.description || '',
    task.dueDate,
    task.priority,
    '[]',
    0,
    now,
    now
  );
});

console.log('In-memory database initialized with sample tasks');

// API Routes
// GET /api/tasks - Get all tasks with optional filters
app.get('/api/tasks', (req, res) => {
  try {
    const { status, priority, search, sortBy = 'default' } = req.query;
    
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];
    
    // Filter by status
    if (status === 'active') {
      query += ' AND completed = 0';
    } else if (status === 'completed') {
      query += ' AND completed = 1';
    }
    
    // Filter by priority
    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }
    
    // Search by title and description
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'dueDate':
        query += ' ORDER BY CASE WHEN dueDate IS NULL THEN 1 ELSE 0 END, dueDate ASC';
        break;
      case 'priority':
        query += ' ORDER BY CASE priority WHEN \'high\' THEN 1 WHEN \'medium\' THEN 2 WHEN \'low\' THEN 3 END';
        break;
      case 'createdAt':
        query += ' ORDER BY createdAt DESC';
        break;
      default:
        // Default sort: due date first, then priority, then created date
        query += ' ORDER BY CASE WHEN dueDate IS NULL THEN 1 ELSE 0 END, dueDate ASC, CASE priority WHEN \'high\' THEN 1 WHEN \'medium\' THEN 2 WHEN \'low\' THEN 3 END, createdAt DESC';
    }
    
    const tasks = db.prepare(query).all(...params);
    
    // Parse tags from JSON string
    const tasksWithParsedTags = tasks.map(task => ({
      ...task,
      completed: Boolean(task.completed),
      tags: JSON.parse(task.tags || '[]')
    }));
    
    res.json(tasksWithParsedTags);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks - Create new task
app.post('/api/tasks', (req, res) => {
  try {
    const { title, description = '', dueDate = null, priority = 'medium', tags = [] } = req.body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required and cannot be empty' });
    }

    // Validate priority
    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ error: 'Priority must be low, medium, or high' });
    }

    // Validate due date if provided
    if (dueDate && isNaN(Date.parse(dueDate))) {
      return res.status(400).json({ error: 'Invalid due date format' });
    }

    const id = randomUUID();
    const now = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO tasks (id, title, description, dueDate, priority, tags, completed, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      id,
      title.trim(),
      description.trim(),
      dueDate,
      priority,
      JSON.stringify(tags),
      0,
      now,
      now
    );

    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.status(201).json({
      ...newTask,
      completed: Boolean(newTask.completed),
      tags: JSON.parse(newTask.tags)
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id - Update task
app.put('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, priority, tags, completed } = req.body;

    // Check if task exists
    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Validation
    if (title !== undefined && (!title || title.trim() === '')) {
      return res.status(400).json({ error: 'Task title cannot be empty' });
    }

    if (priority !== undefined && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ error: 'Priority must be low, medium, or high' });
    }

    if (dueDate !== undefined && dueDate !== null && isNaN(Date.parse(dueDate))) {
      return res.status(400).json({ error: 'Invalid due date format' });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title.trim());
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description.trim());
    }
    if (dueDate !== undefined) {
      updates.push('dueDate = ?');
      params.push(dueDate);
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      params.push(priority);
    }
    if (tags !== undefined) {
      updates.push('tags = ?');
      params.push(JSON.stringify(tags));
    }
    if (completed !== undefined) {
      updates.push('completed = ?');
      params.push(completed ? 1 : 0);
    }

    updates.push('updatedAt = ?');
    params.push(new Date().toISOString());
    params.push(id);

    const updateStmt = db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`);
    updateStmt.run(...params);

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json({
      ...updatedTask,
      completed: Boolean(updatedTask.completed),
      tags: JSON.parse(updatedTask.tags)
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// PATCH /api/tasks/:id/toggle - Toggle completion status
app.patch('/api/tasks/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;

    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const newCompletedStatus = existingTask.completed ? 0 : 1;
    const updateStmt = db.prepare('UPDATE tasks SET completed = ?, updatedAt = ? WHERE id = ?');
    updateStmt.run(newCompletedStatus, new Date().toISOString(), id);

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json({
      ...updatedTask,
      completed: Boolean(updatedTask.completed),
      tags: JSON.parse(updatedTask.tags)
    });
  } catch (error) {
    console.error('Error toggling task:', error);
    res.status(500).json({ error: 'Failed to toggle task' });
  }
});

// DELETE /api/tasks/:id - Delete task
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;

    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const deleteStmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = deleteStmt.run(id);

    if (result.changes > 0) {
      res.json({ message: 'Task deleted successfully', id });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// POST /api/tasks/bulk - Bulk actions
app.post('/api/tasks/bulk', (req, res) => {
  try {
    const { action, taskIds } = req.body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ error: 'taskIds must be a non-empty array' });
    }

    const now = new Date().toISOString();
    let updateStmt;

    switch (action) {
      case 'complete':
        updateStmt = db.prepare('UPDATE tasks SET completed = 1, updatedAt = ? WHERE id = ?');
        break;
      case 'uncomplete':
        updateStmt = db.prepare('UPDATE tasks SET completed = 0, updatedAt = ? WHERE id = ?');
        break;
      case 'delete':
        updateStmt = db.prepare('DELETE FROM tasks WHERE id = ?');
        taskIds.forEach(id => updateStmt.run(id));
        return res.json({ message: `${taskIds.length} tasks deleted`, count: taskIds.length });
      default:
        return res.status(400).json({ error: 'Invalid action. Must be complete, uncomplete, or delete' });
    }

    taskIds.forEach(id => updateStmt.run(now, id));
    res.json({ message: `${taskIds.length} tasks updated`, count: taskIds.length });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({ error: 'Failed to perform bulk action' });
  }
});

module.exports = { app, db };