import React from 'react';
import {
  Card,
  CardContent,
  Checkbox,
  IconButton,
  Typography,
  Chip,
  Box,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { getDueDateLabel, isOverdue } from '../../../utils/dateHelpers';

/**
 * TaskItem Component
 * Displays a single task with actions
 */
function TaskItem({ task, onToggle, onEdit, onDelete, selected, onSelect }) {
  const { id, title, description, dueDate, priority, tags, completed } = task;
  
  const dueDateLabel = getDueDateLabel(dueDate);
  const overdue = isOverdue(dueDate) && !completed;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Card
      sx={{
        mb: 2,
        opacity: completed ? 0.6 : 1,
        backgroundColor: selected ? 'rgba(25, 118, 210, 0.08)' : 'background.paper',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 3,
        },
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="flex-start">
          {/* Checkbox for selection */}
          {onSelect && (
            <Checkbox
              checked={selected}
              onChange={() => onSelect(id)}
              sx={{ mt: -1, mr: 1 }}
            />
          )}
          
          {/* Completion checkbox */}
          <Checkbox
            checked={completed}
            onChange={() => onToggle(id)}
            sx={{ mt: -1, mr: 2 }}
            color="success"
          />

          {/* Task content */}
          <Box flex={1}>
            <Typography
              variant="body1"
              sx={{
                textDecoration: completed ? 'line-through' : 'none',
                fontWeight: 500,
                mb: description ? 0.5 : 0,
              }}
            >
              {title}
            </Typography>

            {description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                {description}
              </Typography>
            )}

            {/* Metadata: Due date, priority, tags */}
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
              {dueDate && (
                <Chip
                  label={dueDateLabel}
                  size="small"
                  color={overdue ? 'error' : 'default'}
                  icon={overdue ? <WarningIcon /> : undefined}
                  variant="outlined"
                />
              )}

              <Chip
                label={priority}
                size="small"
                color={getPriorityColor(priority)}
                variant="outlined"
              />

              {tags && tags.length > 0 && tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>

          {/* Actions */}
          <Box>
            {onEdit && (
              <IconButton
                onClick={() => onEdit(task)}
                size="small"
                aria-label="Edit task"
              >
                <EditIcon />
              </IconButton>
            )}
            {onDelete && (
              <IconButton
                onClick={() => onDelete(id)}
                size="small"
                color="error"
                aria-label="Delete task"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default TaskItem;
