# Testing Guidelines — TODO App

Last updated: 2025-10-30

This document outlines the testing principles, strategies, and requirements for the TODO application. All code should be tested to ensure reliability, maintainability, and confidence in changes.

## Testing Philosophy

### Core Principles
- **Test behavior, not implementation**: Tests should validate what the code does, not how it does it
- **Write tests first when possible**: TDD (Test-Driven Development) helps design better APIs
- **Keep tests simple and readable**: Tests are documentation; they should be easy to understand
- **Fast feedback loops**: Tests should run quickly to encourage frequent execution
- **Maintainable tests**: Avoid brittle tests that break with minor refactors

### Test Coverage Goals
- **Minimum coverage**: 80% for critical paths (create, edit, delete, persistence)
- **100% coverage**: Core business logic (sorting, filtering, validation)
- **Focus on value**: High coverage isn't the goal; meaningful tests are

## Testing Pyramid

We follow the testing pyramid strategy:

```
        /\
       /  \
      / E2E \         <- Few (5-10%)
     /______\
    /        \
   /Integration\      <- Some (20-30%)
  /____________\
 /              \
/   Unit Tests   \    <- Many (60-75%)
/__________________\
```

### Unit Tests (60-75%)
- **Scope**: Individual functions, components, utilities
- **Speed**: Very fast (milliseconds)
- **Purpose**: Validate logic in isolation
- **Tools**: Jest, React Testing Library

### Integration Tests (20-30%)
- **Scope**: Multiple components/modules working together
- **Speed**: Fast (seconds)
- **Purpose**: Validate interactions between parts
- **Tools**: Jest, React Testing Library, MSW (Mock Service Worker)

### End-to-End Tests (5-10%)
- **Scope**: Full user workflows
- **Speed**: Slow (minutes)
- **Purpose**: Validate critical user journeys
- **Tools**: Playwright, Cypress (optional)

## Testing Requirements

### Mandatory Test Coverage

#### All New Features Must Include:
1. **Unit tests** for business logic and utilities
2. **Component tests** for React components
3. **Integration tests** for feature workflows
4. **E2E tests** for critical user paths (if applicable)

#### All Bug Fixes Must Include:
1. **Regression test** that reproduces the bug
2. Test should fail before the fix, pass after

### Test Quality Standards

#### Tests Must Be:
- ✅ **Isolated**: Each test should run independently
- ✅ **Deterministic**: Same input = same output, every time
- ✅ **Fast**: Unit tests < 100ms, integration < 5s
- ✅ **Readable**: Clear arrange-act-assert structure
- ✅ **Maintainable**: Easy to update when requirements change

#### Tests Should NOT:
- ❌ Test implementation details (internal state, private methods)
- ❌ Depend on execution order
- ❌ Use arbitrary timeouts (`setTimeout` without justification)
- ❌ Access real external services (use mocks/stubs)
- ❌ Include magic numbers without explanation

## Testing Strategy by Layer

### Frontend (React) Testing

#### Component Tests
Use React Testing Library to test components from the user's perspective:

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import TaskItem from './TaskItem';

describe('TaskItem', () => {
  it('should toggle task completion when checkbox is clicked', () => {
    const mockToggle = jest.fn();
    const task = { id: '1', title: 'Test task', completed: false };
    
    render(<TaskItem task={task} onToggle={mockToggle} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(mockToggle).toHaveBeenCalledWith('1');
  });
});
```

**Guidelines:**
- Query by accessible roles/labels (not test IDs when possible)
- Test user interactions (click, type, submit)
- Verify visible output (text, ARIA attributes)
- Mock external dependencies (API calls, context)

#### Integration Tests
Test multiple components working together:

```javascript
describe('Task Management Flow', () => {
  it('should create, edit, and delete a task', async () => {
    render(<App />);
    
    // Create
    const input = screen.getByLabelText(/task title/i);
    fireEvent.change(input, { target: { value: 'New task' } });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    
    expect(screen.getByText('New task')).toBeInTheDocument();
    
    // Edit
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    const editInput = screen.getByDisplayValue('New task');
    fireEvent.change(editInput, { target: { value: 'Updated task' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    expect(screen.getByText('Updated task')).toBeInTheDocument();
    
    // Delete
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    
    expect(screen.queryByText('Updated task')).not.toBeInTheDocument();
  });
});
```

### Backend (Express) Testing

#### Unit Tests
Test individual route handlers, middleware, and utilities:

```javascript
const request = require('supertest');
const app = require('./app');

describe('GET /tasks', () => {
  it('should return all tasks', async () => {
    const response = await request(app).get('/tasks');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

#### Integration Tests
Test API endpoints with database interactions:

```javascript
describe('POST /tasks', () => {
  it('should create a new task and persist it', async () => {
    const newTask = {
      title: 'Test task',
      priority: 'high',
    };
    
    const response = await request(app)
      .post('/tasks')
      .send(newTask);
    
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: 'Test task',
      priority: 'high',
      completed: false,
    });
    expect(response.body.id).toBeDefined();
    
    // Verify persistence
    const getResponse = await request(app).get(`/tasks/${response.body.id}`);
    expect(getResponse.status).toBe(200);
  });
});
```

### End-to-End Tests

Use Playwright or Cypress for critical user journeys:

```javascript
// Example with Playwright
test('complete task workflow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Add task
  await page.fill('[aria-label="Task title"]', 'Buy groceries');
  await page.click('button:has-text("Add Task")');
  
  // Verify task appears
  await expect(page.locator('text=Buy groceries')).toBeVisible();
  
  // Complete task
  await page.click('[aria-label="Complete task"]');
  
  // Verify strikethrough
  const taskTitle = page.locator('text=Buy groceries');
  await expect(taskTitle).toHaveCSS('text-decoration', /line-through/);
});
```

## Test Organization

### File Structure
```
packages/
  frontend/
    src/
      components/
        TaskItem.js
        TaskItem.test.js          # Co-located unit tests
      features/
        tasks/
          TaskList.js
          TaskList.test.js
          __tests__/
            task-management.integration.test.js
      utils/
        dateHelpers.js
        dateHelpers.test.js
    __tests__/
      e2e/
        critical-flows.e2e.test.js
  backend/
    src/
      routes/
        tasks.js
        tasks.test.js
      __tests__/
        api.integration.test.js
```

### Naming Conventions
- **Unit tests**: `ComponentName.test.js` or `functionName.test.js`
- **Integration tests**: `feature-name.integration.test.js`
- **E2E tests**: `user-flow.e2e.test.js`

### Test Structure (AAA Pattern)
```javascript
describe('Feature/Component Name', () => {
  it('should do something specific when condition is met', () => {
    // Arrange: Set up test data and environment
    const input = 'test';
    
    // Act: Execute the code under test
    const result = functionUnderTest(input);
    
    // Assert: Verify the outcome
    expect(result).toBe('expected');
  });
});
```

## Mocking & Stubbing

### When to Mock
- **External APIs**: Always mock HTTP requests in unit/integration tests
- **Time/Dates**: Mock `Date.now()` for deterministic tests
- **Browser APIs**: Mock localStorage, sessionStorage, geolocation
- **Third-party libraries**: Mock when testing behavior, not the library

### Mock Service Worker (MSW)
Use MSW for API mocking in integration tests:

```javascript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(ctx.json([
      { id: '1', title: 'Task 1', completed: false },
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Test Data Management

### Use Test Factories
Create reusable test data factories:

```javascript
// testHelpers.js
export const createTask = (overrides = {}) => ({
  id: Math.random().toString(36).substr(2, 9),
  title: 'Default task',
  description: '',
  completed: false,
  priority: 'medium',
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});
```

### Avoid Hardcoded Values
```javascript
// ❌ Bad: Hardcoded, brittle
expect(task.id).toBe('abc123');

// ✅ Good: Test structure, not exact value
expect(task.id).toMatch(/^[a-z0-9]{9}$/);
expect(typeof task.id).toBe('string');
```

## Accessibility Testing

### Required Accessibility Tests
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader announcements (ARIA labels, live regions)
- Color contrast (programmatic checks where possible)
- Focus management (modals, dialogs)

### Tools
- **jest-axe**: Automated accessibility testing
- **eslint-plugin-jsx-a11y**: Lint-time checks

```javascript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<TaskList tasks={mockTasks} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Performance Testing

### Load Testing (Optional)
For APIs, consider load testing critical endpoints:
- Tools: Artillery, k6
- Target: 100 req/s with < 200ms response time

### Frontend Performance
- Test bundle size (alert if > 500KB)
- Measure render times for large lists (> 100 items)

## Continuous Integration

### CI Pipeline Requirements
1. **Run all tests** on every PR
2. **Enforce coverage thresholds** (80% minimum)
3. **Block merges** if tests fail
4. **Cache dependencies** for speed
5. **Parallelize tests** when possible

### Pre-commit Hooks
Use Husky + lint-staged:
```json
{
  "*.{js,jsx}": ["eslint --fix", "jest --findRelatedTests"]
}
```

## Test Maintenance

### Regular Test Reviews
- **Monthly**: Review and remove flaky tests
- **Quarterly**: Refactor tests to match current patterns
- **When refactoring**: Update tests to match new behavior

### Deprecation Strategy
When removing features:
1. Mark tests as `skip` with deprecation date
2. Remove tests when feature is fully removed
3. Archive E2E tests for historical reference

## Common Pitfalls to Avoid

### ❌ Don't Test Implementation Details
```javascript
// Bad: Testing internal state
expect(component.state.count).toBe(5);

// Good: Testing visible behavior
expect(screen.getByText('Count: 5')).toBeInTheDocument();
```

### ❌ Don't Use Brittle Selectors
```javascript
// Bad: Depends on DOM structure
container.querySelector('.task-list > div:nth-child(2) > span');

// Good: Use accessible queries
screen.getByRole('listitem', { name: /task title/i });
```

### ❌ Don't Write Slow Tests
```javascript
// Bad: Arbitrary timeout
await new Promise(resolve => setTimeout(resolve, 5000));

// Good: Wait for specific condition
await waitFor(() => expect(screen.getByText('Loaded')).toBeInTheDocument());
```

## Resources & Tools

### Testing Libraries
- **Jest**: Test runner and assertion library
- **React Testing Library**: React component testing
- **Supertest**: HTTP assertion library for Node.js
- **MSW**: API mocking
- **Playwright/Cypress**: E2E testing

### Useful Links
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

These guidelines should be followed consistently to maintain a high-quality, well-tested codebase.
