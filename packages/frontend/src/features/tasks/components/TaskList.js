import React from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import TaskItem from './TaskItem';

/**
 * TaskList Component
 * Displays a list of tasks or appropriate empty/loading/error states
 */
function TaskList({
  tasks,
  loading,
  error,
  onToggle,
  onEdit,
  onDelete,
  selectedTasks = [],
  onSelectTask,
}) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        py={8}
        textAlign="center"
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No tasks found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add a new task to get started!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          selected={selectedTasks.includes(task.id)}
          onSelect={onSelectTask}
        />
      ))}
    </Box>
  );
}

export default TaskList;
