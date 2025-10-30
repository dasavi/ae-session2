// API base URL - uses proxy in development
const API_BASE_URL = '/api';

/**
 * Generic fetch wrapper with error handling
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} Response data
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * Fetch all tasks with optional filters
 * @param {object} filters - Filter parameters (status, priority, search, sortBy)
 * @returns {Promise<Array>} Array of tasks
 */
export async function getTasks(filters = {}) {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.append(key, value);
    }
  });

  const endpoint = `/tasks${params.toString() ? `?${params.toString()}` : ''}`;
  return apiRequest(endpoint);
}

/**
 * Create a new task
 * @param {object} task - Task data
 * @returns {Promise<object>} Created task
 */
export async function createTask(task) {
  return apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  });
}

/**
 * Update an existing task
 * @param {string} id - Task ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated task
 */
export async function updateTask(id, updates) {
  return apiRequest(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

/**
 * Toggle task completion status
 * @param {string} id - Task ID
 * @returns {Promise<object>} Updated task
 */
export async function toggleTask(id) {
  return apiRequest(`/tasks/${id}/toggle`, {
    method: 'PATCH',
  });
}

/**
 * Delete a task
 * @param {string} id - Task ID
 * @returns {Promise<object>} Response message
 */
export async function deleteTask(id) {
  return apiRequest(`/tasks/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Perform bulk action on multiple tasks
 * @param {string} action - Action type (complete, uncomplete, delete)
 * @param {Array<string>} taskIds - Array of task IDs
 * @returns {Promise<object>} Response message
 */
export async function bulkAction(action, taskIds) {
  return apiRequest('/tasks/bulk', {
    method: 'POST',
    body: JSON.stringify({ action, taskIds }),
  });
}
