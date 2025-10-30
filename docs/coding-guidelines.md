# Coding Guidelines — TODO App

Last updated: 2025-10-30

This document outlines the coding style, quality principles, and best practices for the TODO application. Following these guidelines ensures consistency, maintainability, and collaboration across the codebase.

## Code Quality Principles

### Core Values
- **Clarity over cleverness**: Write code that is easy to understand, not code that shows off
- **Consistency**: Follow established patterns within the codebase
- **Simplicity**: Prefer simple solutions over complex ones (YAGNI - You Aren't Gonna Need It)
- **Maintainability**: Write code that is easy to change and extend
- **Testability**: Design code that is easy to test in isolation

### DRY (Don't Repeat Yourself)
- Extract repeated logic into reusable functions or components
- Use shared utilities for common operations (date formatting, validation)
- Create custom hooks for shared React stateful logic
- Avoid copy-paste programming; refactor instead

### SOLID Principles (where applicable)
- **Single Responsibility**: Each function/component should do one thing well
- **Open/Closed**: Code should be open for extension but closed for modification
- **Dependency Inversion**: Depend on abstractions (interfaces), not concrete implementations

## JavaScript/TypeScript Style

### General Formatting

#### Indentation & Spacing
- Use **2 spaces** for indentation (no tabs)
- Maximum line length: **100 characters**
- Use blank lines to separate logical blocks
- Always use semicolons (enforced by ESLint)

#### Quotes
- Use **single quotes** for strings: `'hello'`
- Use backticks for template literals: `` `Hello ${name}` ``
- Use double quotes for JSX attributes: `<Button label="Click me" />`

#### Naming Conventions
- **camelCase** for variables, functions, methods: `getUserName`, `taskList`
- **PascalCase** for components, classes, types: `TaskItem`, `UserService`
- **UPPER_SNAKE_CASE** for constants: `MAX_TASKS`, `API_BASE_URL`
- **kebab-case** for file names: `task-item.js`, `use-tasks.js`
- Prefix boolean variables with `is`, `has`, `should`: `isCompleted`, `hasError`
- Prefix event handlers with `handle`: `handleClick`, `handleSubmit`

```javascript
// ✅ Good
const isTaskCompleted = true;
const MAX_TITLE_LENGTH = 100;
function handleTaskClick() { }

// ❌ Bad
const TaskCompleted = true;
const maxTitleLength = 100;
function taskClick() { }
```

### Variables & Constants

#### Variable Declarations
- Use `const` by default; only use `let` when reassignment is needed
- Never use `var`
- Declare one variable per statement
- Initialize variables when possible

```javascript
// ✅ Good
const tasks = [];
let activeFilter = 'all';

// ❌ Bad
var tasks = [];
let activeFilter, selectedTask, isLoading;
```

#### Object & Array Destructuring
Use destructuring to extract values from objects and arrays:

```javascript
// ✅ Good
const { title, completed, priority } = task;
const [first, second] = tasks;

// ❌ Bad
const title = task.title;
const completed = task.completed;
```

### Functions

#### Function Declarations
- Use arrow functions for callbacks and anonymous functions
- Use function declarations for named top-level functions
- Keep functions small (aim for < 20 lines)
- Use descriptive names that explain what the function does

```javascript
// ✅ Good: Arrow function for callback
const filteredTasks = tasks.filter(task => task.completed);

// ✅ Good: Named function declaration
function calculateTaskPriority(task) {
  // ...
}

// ❌ Bad: Anonymous function for complex logic
const result = function(x, y) { /* 50 lines */ };
```

#### Function Parameters
- Limit parameters to 3 or fewer; use an options object for more
- Use default parameters instead of conditionals
- Use destructuring for options objects

```javascript
// ✅ Good
function createTask(title, { priority = 'medium', tags = [] } = {}) {
  // ...
}

// ❌ Bad
function createTask(title, priority, tags, dueDate, description, assignee) {
  // ...
}
```

### Imports & Exports

#### Import Organization
Group and order imports as follows:
1. Node built-ins (if applicable)
2. External dependencies (npm packages)
3. Internal modules (absolute imports)
4. Relative imports (parent directories)
5. Relative imports (same directory)
6. CSS/style imports

Separate groups with a blank line.

```javascript
// ✅ Good
import React, { useState, useEffect } from 'react';
import { Button, TextField } from '@mui/material';

import { validateTask } from '@/utils/validation';
import { useTasks } from '@/hooks/useTasks';

import TaskItem from './TaskItem';
import { filterTasks } from './taskUtils';

import './TaskList.css';

// ❌ Bad: Random order
import './TaskList.css';
import TaskItem from './TaskItem';
import React, { useState } from 'react';
import { Button } from '@mui/material';
```

#### Named vs. Default Exports
- Prefer **named exports** for utilities, hooks, and multiple exports
- Use **default exports** for React components (one per file)
- Avoid mixing both in the same file

```javascript
// ✅ Good: Component (default export)
export default function TaskList({ tasks }) {
  // ...
}

// ✅ Good: Utilities (named exports)
export function sortTasks(tasks) { }
export function filterTasks(tasks, filter) { }

// ❌ Bad: Mixing
export default function TaskList() { }
export function helperFunction() { }
```

## React Best Practices

### Component Structure

#### Functional Components
- Use functional components with hooks (no class components)
- Keep components focused (single responsibility)
- Aim for < 200 lines; split into smaller components if needed

```javascript
// ✅ Good: Clean functional component
function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className="task-item">
      <Checkbox checked={task.completed} onChange={() => onToggle(task.id)} />
      <span>{task.title}</span>
      <IconButton onClick={() => onDelete(task.id)}>
        <DeleteIcon />
      </IconButton>
    </div>
  );
}

export default TaskItem;
```

#### Component Organization
Order component code as follows:
1. Imports
2. Component definition
3. PropTypes/TypeScript types (if used)
4. Default export

Within the component:
1. Props destructuring
2. State hooks (`useState`)
3. Effect hooks (`useEffect`)
4. Custom hooks
5. Event handlers
6. Render helpers
7. Return statement (JSX)

```javascript
function TaskList({ tasks, onTaskUpdate }) {
  // 1. State
  const [filter, setFilter] = useState('all');
  
  // 2. Effects
  useEffect(() => {
    // ...
  }, [tasks]);
  
  // 3. Custom hooks
  const { sortedTasks } = useSortedTasks(tasks);
  
  // 4. Handlers
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };
  
  // 5. Render helpers
  const filteredTasks = filterTasks(sortedTasks, filter);
  
  // 6. JSX
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

### Props & State

#### Prop Validation
- Use PropTypes or TypeScript for prop validation
- Mark required props explicitly
- Provide default props where appropriate

```javascript
import PropTypes from 'prop-types';

TaskItem.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    completed: PropTypes.bool,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
};

TaskItem.defaultProps = {
  onDelete: () => {},
};
```

#### State Management
- Keep state as local as possible (lift only when needed)
- Use `useState` for simple state
- Use `useReducer` for complex state with multiple actions
- Consider Context API for deeply nested props (avoid prop drilling)

### Hooks

#### Custom Hooks
- Extract reusable stateful logic into custom hooks
- Prefix hook names with `use`: `useTasks`, `useTaskFilter`
- Return arrays for multiple values: `[value, setValue]`
- Return objects for many values or when order doesn't matter

```javascript
// ✅ Good: Custom hook
function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const addTask = useCallback((task) => {
    setTasks(prev => [...prev, task]);
  }, []);
  
  return { tasks, loading, addTask };
}
```

#### Hook Dependencies
- Always include all dependencies in the dependency array
- Use `useCallback` to memoize callbacks passed as deps
- Use `useMemo` for expensive computations
- Avoid disabling ESLint's `exhaustive-deps` rule without good reason

### JSX

#### Formatting
- Use self-closing tags when there are no children: `<Component />`
- Break long JSX into multiple lines
- Use parentheses for multi-line JSX
- Limit JSX nesting depth (max 3-4 levels)

```javascript
// ✅ Good
return (
  <div className="task-list">
    {tasks.map(task => (
      <TaskItem
        key={task.id}
        task={task}
        onToggle={handleToggle}
      />
    ))}
  </div>
);

// ❌ Bad
return <div className="task-list">{tasks.map(task => <TaskItem key={task.id} task={task} onToggle={handleToggle} />)}</div>;
```

#### Conditional Rendering
- Use ternary for simple if/else: `condition ? <A /> : <B />`
- Use `&&` for conditional rendering: `condition && <Component />`
- Extract complex conditions into variables

```javascript
// ✅ Good
const hasCompletedTasks = tasks.some(t => t.completed);

return (
  <div>
    {hasCompletedTasks && <CompletedTasksSummary />}
  </div>
);

// ❌ Bad
return (
  <div>
    {tasks.filter(t => t.completed).length > 0 && <CompletedTasksSummary />}
  </div>
);
```

## Error Handling

### Try/Catch
- Always handle errors in async functions
- Provide meaningful error messages to users
- Log errors for debugging (but remove console logs in production)

```javascript
async function fetchTasks() {
  try {
    const response = await fetch('/api/tasks');
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return await response.json();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error; // Re-throw to let caller handle
  }
}
```

### Error Boundaries (React)
- Use Error Boundaries to catch rendering errors
- Provide fallback UI for better UX

## Comments & Documentation

### When to Comment
- **Do** explain *why* code does something non-obvious
- **Do** document complex algorithms or business logic
- **Don't** explain *what* code does (code should be self-explanatory)
- **Don't** leave commented-out code (use version control)

```javascript
// ✅ Good: Explains why
// Using debounce to avoid excessive API calls during typing
const debouncedSearch = useDebounce(searchTerm, 300);

// ❌ Bad: Explains what (obvious)
// Set the count to 0
const count = 0;
```

### JSDoc (Optional but Recommended)
Use JSDoc for complex functions, especially in utility files:

```javascript
/**
 * Filters and sorts tasks based on provided criteria
 * @param {Task[]} tasks - Array of task objects
 * @param {Object} options - Filter and sort options
 * @param {string} options.status - Filter by status (all/active/completed)
 * @param {string} options.sortBy - Sort field (dueDate/priority/createdAt)
 * @returns {Task[]} Filtered and sorted tasks
 */
function processTasks(tasks, { status, sortBy }) {
  // ...
}
```

## Linting & Formatting

### ESLint
- Run ESLint on all JavaScript/JSX files
- Fix linting errors before committing
- Recommended rules: `eslint:recommended`, `react/recommended`
- Use `// eslint-disable-next-line` sparingly and only with justification

### Prettier
- Use Prettier for consistent code formatting
- Configure to run on save in your editor
- Run Prettier in pre-commit hooks

### Configuration
```json
// .eslintrc.json
{
  "extends": ["eslint:recommended", "react-app"],
  "rules": {
    "no-console": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}

// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100,
  "trailingComma": "es5"
}
```

## Git Commit Messages

### Commit Message Format
Use conventional commits format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring (no feature or bug fix)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, build)

#### Examples
```
feat(tasks): add ability to set task priority

Implemented priority dropdown in task creation form
with high/medium/low options. Priority is stored in
task object and displayed with color-coded badges.

Closes #42
```

```
fix(task-list): prevent duplicate tasks on rapid clicks

Added loading state to prevent multiple submissions
when user clicks "Add Task" button repeatedly.
```

## Performance Best Practices

### React Performance
- Use `React.memo()` for expensive components that re-render often
- Use `useCallback` to memoize callbacks passed to child components
- Use `useMemo` for expensive calculations
- Avoid inline functions and object literals in JSX (causes re-renders)
- Use `key` prop correctly in lists (stable, unique IDs)

```javascript
// ✅ Good: Memoized callback
const handleDelete = useCallback((taskId) => {
  deleteTask(taskId);
}, [deleteTask]);

// ❌ Bad: New function on every render
<TaskItem onDelete={(id) => deleteTask(id)} />
```

### General Performance
- Debounce expensive operations (search, API calls)
- Use pagination or virtualization for long lists
- Lazy load images and heavy components
- Minimize bundle size (code splitting, tree shaking)

## Security Best Practices

### Input Validation
- Validate all user inputs on both frontend and backend
- Sanitize data before rendering (prevent XSS)
- Never trust client-side validation alone

### API Security
- Use HTTPS for all API calls
- Include CSRF tokens for state-changing requests
- Validate and sanitize all API inputs
- Implement rate limiting for API endpoints

## File Organization

### Directory Structure
```
packages/
  frontend/
    src/
      components/       # Reusable components
        Button/
          Button.js
          Button.test.js
          Button.css
      features/         # Feature-specific code
        tasks/
          components/
          hooks/
          utils/
      hooks/            # Shared custom hooks
      utils/            # Shared utilities
      styles/           # Global styles
      App.js
      index.js
  backend/
    src/
      routes/           # API route handlers
      middleware/       # Express middleware
      utils/            # Utility functions
      app.js
      index.js
```

### File Naming
- Use **kebab-case** for file names: `task-item.js`, `use-tasks.js`
- Use **PascalCase** for component files: `TaskItem.js`
- Suffix test files with `.test.js`
- Group related files in directories

## Code Review Guidelines

### Before Requesting Review
- Run linter and fix all errors
- Run all tests and ensure they pass
- Remove debug code and console logs
- Write descriptive PR description
- Self-review your changes first

### When Reviewing
- Check for code clarity and maintainability
- Verify tests cover new/changed code
- Look for performance issues
- Ensure consistent style with codebase
- Be constructive and respectful in feedback

---

Following these guidelines will help maintain a clean, consistent, and high-quality codebase that is easy to understand, test, and extend.
