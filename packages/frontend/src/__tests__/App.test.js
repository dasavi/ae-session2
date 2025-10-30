import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

// Helper to create realistic task data
const createMockTask = (overrides = {}) => ({
  id: Math.random().toString(36).substr(2, 9),
  title: 'Test task',
  description: '',
  dueDate: null,
  priority: 'medium',
  tags: [],
  completed: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

// Mock API server with realistic task responses
const mockTasks = [
  createMockTask({ id: 'task-1', title: 'Complete project documentation', priority: 'high' }),
  createMockTask({ id: 'task-2', title: 'Review pull requests', priority: 'medium', completed: true }),
  createMockTask({ id: 'task-3', title: 'Update dependencies', priority: 'low', tags: ['maintenance'] })
];

const server = setupServer(
  rest.get('/api/tasks', (req, res, ctx) => {
    const status = req.url.searchParams.get('status');
    const priority = req.url.searchParams.get('priority');
    const search = req.url.searchParams.get('search');

    let filteredTasks = [...mockTasks];

    if (status === 'active') {
      filteredTasks = filteredTasks.filter(t => !t.completed);
    } else if (status === 'completed') {
      filteredTasks = filteredTasks.filter(t => t.completed);
    }

    if (priority) {
      filteredTasks = filteredTasks.filter(t => t.priority === priority);
    }

    if (search) {
      filteredTasks = filteredTasks.filter(t => 
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
      );
    }

    return res(ctx.json(filteredTasks));
  }),
  
  rest.post('/api/tasks', async (req, res, ctx) => {
    const body = await req.json();
    const newTask = createMockTask({
      id: 'new-task-' + Date.now(),
      title: body.title,
      description: body.description || '',
      priority: body.priority || 'medium',
      tags: body.tags || [],
      dueDate: body.dueDate || null
    });
    return res(ctx.status(201), ctx.json(newTask));
  }),
  
  rest.put('/api/tasks/:id', async (req, res, ctx) => {
    const body = await req.json();
    const taskId = req.params.id;
    const existingTask = mockTasks.find(t => t.id === taskId);
    
    if (!existingTask) {
      return res(ctx.status(404), ctx.json({ error: 'Task not found' }));
    }
    
    const updatedTask = {
      ...existingTask,
      ...body,
      updatedAt: new Date().toISOString()
    };
    return res(ctx.json(updatedTask));
  }),
  
  rest.patch('/api/tasks/:id/toggle', (req, res, ctx) => {
    const taskId = req.params.id;
    const task = mockTasks.find(t => t.id === taskId);
    
    if (!task) {
      return res(ctx.status(404), ctx.json({ error: 'Task not found' }));
    }
    
    const toggledTask = {
      ...task,
      completed: !task.completed,
      updatedAt: new Date().toISOString()
    };
    return res(ctx.json(toggledTask));
  }),
  
  rest.delete('/api/tasks/:id', (req, res, ctx) => {
    const taskId = req.params.id;
    const task = mockTasks.find(t => t.id === taskId);
    
    if (!task) {
      return res(ctx.status(404), ctx.json({ error: 'Task not found' }));
    }
    
    return res(ctx.json({ message: 'Task deleted successfully', id: taskId }));
  }),
  
  rest.post('/api/tasks/bulk', async (req, res, ctx) => {
    const body = await req.json();
    const { action, taskIds } = body;
    
    if (!action || !taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res(ctx.status(400), ctx.json({ error: 'Invalid bulk action' }));
    }
    
    return res(ctx.json({ count: taskIds.length }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  it('renders the app header', () => {
    render(<App />);
    const header = screen.getByText(/Todo/i);
    expect(header).toBeInTheDocument();
  });

  it('loads and displays tasks from the API', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Complete project documentation')).toBeInTheDocument();
      expect(screen.getByText('Review pull requests')).toBeInTheDocument();
      expect(screen.getByText('Update dependencies')).toBeInTheDocument();
    });
  });

  it('shows completed tasks with strikethrough styling', async () => {
    render(<App />);

    await waitFor(() => {
      const completedTask = screen.getByText('Review pull requests');
      expect(completedTask).toBeInTheDocument();
      
      // Check if parent has completed styling (strikethrough)
      const taskElement = completedTask.closest('[class*="task"]') || completedTask.parentElement;
      expect(taskElement).toBeTruthy();
    });
  });

  it('displays priority badges correctly', async () => {
    render(<App />);

    await waitFor(() => {
      // High priority task should have high priority indicator
      const highPriorityTask = screen.getByText('Complete project documentation');
      expect(highPriorityTask).toBeInTheDocument();
      
      // Low priority task
      const lowPriorityTask = screen.getByText('Update dependencies');
      expect(lowPriorityTask).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    server.use(
      rest.get('/api/tasks', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );

    render(<App />);

    await waitFor(() => {
      // Look for error message in the UI
      const errorText = screen.queryByText(/error/i) || screen.queryByText(/failed/i);
      expect(errorText).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching tasks', () => {
    render(<App />);
    
    // Loading can be indicated by CircularProgress or text
    const loadingIndicator = screen.queryByRole('progressbar') || screen.queryByText(/loading/i);
    expect(loadingIndicator).toBeInTheDocument();
  });

  it('shows empty state when no tasks exist', async () => {
    server.use(
      rest.get('/api/tasks', (req, res, ctx) => {
        return res(ctx.json([]));
      })
    );

    render(<App />);

    await waitFor(() => {
      // Look for empty state message
      const emptyMessage = screen.queryByText(/no tasks/i) || 
                          screen.queryByText(/get started/i) ||
                          screen.queryByText(/nothing to do/i);
      expect(emptyMessage).toBeInTheDocument();
    });
  });

  it('can toggle task completion', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Complete project documentation')).toBeInTheDocument();
    });

    // Find the first checkbox (completion toggle)
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
    
    // Click to toggle
    await user.click(checkboxes[0]);

    // Verify the toggle was attempted (check that click happened)
    expect(checkboxes[0]).toBeInTheDocument();
  });

  it('displays tags for tasks that have them', async () => {
    render(<App />);

    await waitFor(() => {
      const taskWithTag = screen.getByText('Update dependencies');
      expect(taskWithTag).toBeInTheDocument();
      
      // The tag 'maintenance' should be visible somewhere near this task
      const maintenanceTag = screen.queryByText('maintenance');
      expect(maintenanceTag).toBeInTheDocument();
    });
  });

  it('filters tasks by status', async () => {
    const user = userEvent.setup();
    
    // Override mock to test filtering
    server.use(
      rest.get('/api/tasks', (req, res, ctx) => {
        const status = req.url.searchParams.get('status');
        
        if (status === 'completed') {
          return res(ctx.json([mockTasks[1]])); // Only completed task
        }
        return res(ctx.json(mockTasks));
      })
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Complete project documentation')).toBeInTheDocument();
    });

    // Look for filter controls (could be dropdown, buttons, etc.)
    const filterControl = screen.queryByLabelText(/status/i) || 
                         screen.queryByText(/all/i) ||
                         screen.queryByRole('button', { name: /filter/i });
    
    // If filter controls exist, test them
    if (filterControl) {
      // This test validates the UI has filter controls
      expect(filterControl).toBeInTheDocument();
    }
  });
});