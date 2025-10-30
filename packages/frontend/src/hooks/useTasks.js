import { useState, useCallback, useEffect } from 'react';
import * as api from '../utils/apiClient';

/**
 * Custom hook for managing tasks
 * Provides CRUD operations, filtering, and sorting for tasks
 */
export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: null,
    search: '',
    sortBy: 'default',
  });

  /**
   * Fetch tasks from the API
   */
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filterParams = {};
      if (filters.status !== 'all') {
        filterParams.status = filters.status;
      }
      if (filters.priority) {
        filterParams.priority = filters.priority;
      }
      if (filters.search) {
        filterParams.search = filters.search;
      }
      if (filters.sortBy) {
        filterParams.sortBy = filters.sortBy;
      }
      
      const fetchedTasks = await api.getTasks(filterParams);
      setTasks(fetchedTasks);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Create a new task
   */
  const addTask = useCallback(async (taskData) => {
    try {
      setError(null);
      const newTask = await api.createTask(taskData);
      
      // Optimistic update
      setTasks(prev => [newTask, ...prev]);
      
      return newTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Update an existing task
   */
  const updateTaskData = useCallback(async (id, updates) => {
    try {
      setError(null);
      
      // Optimistic update
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      ));
      
      const updatedTask = await api.updateTask(id, updates);
      
      // Update with server response
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
      
      return updatedTask;
    } catch (err) {
      setError(err.message);
      // Revert on error
      await fetchTasks();
      throw err;
    }
  }, [fetchTasks]);

  /**
   * Toggle task completion status
   */
  const toggleTaskCompletion = useCallback(async (id) => {
    try {
      setError(null);
      
      // Optimistic update
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      ));
      
      const updatedTask = await api.toggleTask(id);
      
      // Update with server response
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
      
      return updatedTask;
    } catch (err) {
      setError(err.message);
      // Revert on error
      await fetchTasks();
      throw err;
    }
  }, [fetchTasks]);

  /**
   * Delete a task
   */
  const removeTask = useCallback(async (id) => {
    try {
      setError(null);
      
      // Store task for potential undo
      const taskToDelete = tasks.find(task => task.id === id);
      
      // Optimistic update
      setTasks(prev => prev.filter(task => task.id !== id));
      
      await api.deleteTask(id);
      
      return taskToDelete;
    } catch (err) {
      setError(err.message);
      // Revert on error
      await fetchTasks();
      throw err;
    }
  }, [tasks, fetchTasks]);

  /**
   * Bulk action on multiple tasks
   */
  const performBulkAction = useCallback(async (action, taskIds) => {
    try {
      setError(null);
      
      await api.bulkAction(action, taskIds);
      
      // Refresh after bulk action
      await fetchTasks();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchTasks]);

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({
      status: 'all',
      priority: null,
      search: '',
      sortBy: 'default',
    });
  }, []);

  // Fetch tasks when filters change
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    filters,
    addTask,
    updateTask: updateTaskData,
    toggleTask: toggleTaskCompletion,
    deleteTask: removeTask,
    bulkAction: performBulkAction,
    updateFilters,
    clearFilters,
    refetch: fetchTasks,
  };
}
