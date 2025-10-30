import React, { useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Fab,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import theme from './theme';
import { useTasks } from './hooks/useTasks';
import TaskList from './features/tasks/components/TaskList';
import './App.css';

function App() {
  const {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
  } = useTasks();

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleToggle = async (id) => {
    try {
      await toggleTask(id);
      setSnackbar({ open: true, message: 'Task updated', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update task', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setSnackbar({ open: true, message: 'Task deleted', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete task', severity: 'error' });
    }
  };

  const handleAddTask = async () => {
    try {
      await addTask({
        title: 'New Task',
        description: '',
        priority: 'medium',
      });
      setSnackbar({ open: true, message: 'Task created', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to create task', severity: 'error' });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* App Bar */}
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              TODO App
            </Typography>
            <Button color="inherit" onClick={handleAddTask} startIcon={<AddIcon />}>
              Add Task
            </Button>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="md" sx={{ mt: 4, mb: 4, flex: 1 }}>
          <TaskList
            tasks={tasks}
            loading={loading}
            error={error}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        </Container>

        {/* Floating Action Button for mobile */}
        <Fab
          color="primary"
          aria-label="add task"
          onClick={handleAddTask}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', sm: 'none' },
          }}
        >
          <AddIcon />
        </Fab>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;