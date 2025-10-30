# Functional Requirements — TODO App

Last updated: 2025-10-30

This document lists the core functional requirements for the TODO application. Each requirement includes a short description, acceptance criteria, the minimal data shape (when applicable), and notes/edge-cases.

## Overview

The TODO app lets users create and manage tasks. Tasks should be quick to add, easy to edit, and easy to find. The app will support sorting, filtering, persistence, and basic validation.

## Core Functional Requirements

1. Create a task
	- Description: A user can add a new task with a title and optional metadata.
	- Acceptance criteria: Submitting the "new task" form with a valid title creates a task that appears in the task list immediately.
	- Minimal data shape:
	  - id: string (uuid)
	  - title: string (required)
	  - description: string (optional)
	  - dueDate: ISO 8601 string or null (optional)
	  - priority: enum {low, medium, high} (default: medium)
	  - tags: string[] (optional)
	  - completed: boolean (default: false)
	  - createdAt: ISO 8601 string
	  - updatedAt: ISO 8601 string
	- Notes / edge cases: Title must not be empty; trim whitespace. If dueDate is provided it must be a valid date.

2. Edit a task
	- Description: A user can edit any task field (title, description, due date, priority, tags).
	- Acceptance criteria: After saving edits, the task list shows the updated fields and updatedAt is changed.
	- Notes / edge cases: Prevent saving an empty title. Concurrent edits should be last-write-wins (for now).

3. Delete a task
	- Description: A user can delete a single task.
	- Acceptance criteria: After deletion the task is removed from the UI and persistence layer.
	- Notes / edge cases: Consider an optional undo for a short window (e.g., 5-10s) to avoid accidental deletes.

4. Mark task complete / incomplete
	- Description: A user can toggle a task's completed state.
	- Acceptance criteria: Toggling updates the task's completed boolean and moves the task according to the current sort/filter rules.
	- Notes / edge cases: Completed tasks should retain metadata (due date, priority) and be searchable.

5. Add and edit due date
	- Description: A user can set or change a due date on a task.
	- Acceptance criteria: Due date displays in the task list and is used for sorting and reminders (if implemented).
	- Notes / edge cases: Support date-only and date-time. Validate the date format; allow empty/null to represent no due date.

6. Sort tasks
	- Description: Tasks can be sorted by at least these criteria: due date (ascending), priority (high to low), created date (newest first), and completed state.
	- Acceptance criteria: When a user changes the sort option the list reorders accordingly.
	- Default sort rule: tasks with a due date come first, ordered by nearest due date; then tasks without a due date ordered by priority (high → low), then createdAt (newest first).
	- Notes / edge cases: Completed tasks may be shown at the bottom or hidden depending on the current filter.

7. Filter tasks
	- Description: Users can filter the list by status (all/active/completed), priority, tag(s), and date range.
	- Acceptance criteria: Applying a filter updates the displayed tasks only and can be combined (e.g., active + high priority + tag:work).

8. Search tasks
	- Description: Users can search tasks by title and description (case-insensitive substring match).
	- Acceptance criteria: Search returns matching tasks quickly and highlights matches in the UI (optional).

9. Persistence
	- Description: Tasks persist between sessions.
	- Acceptance criteria: After refreshing the page or restarting the app tasks remain available.
	- Implementation notes: Minimal viable persistence is `localStorage`. The backend API (if present) should provide endpoints to create/read/update/delete tasks for server persistence.

10. Bulk actions
	 - Description: Users can select multiple tasks to complete, un-complete, delete, or change priority.
	 - Acceptance criteria: The selected action applies to all selected tasks and updates the persistence layer.

11. Validation & error handling
	 - Description: The app validates inputs and surfaces errors to the user.
	 - Acceptance criteria: Submitting invalid data (empty title, malformed date) shows a clear inline error and prevents the action. Network or persistence errors show a transient/global error message.

12. Undo for destructive actions (optional but recommended)
	 - Description: Provide a short undo window after delete or bulk-delete.
	 - Acceptance criteria: Undo restores deleted tasks and their metadata.

13. Import / Export (optional)
	 - Description: Allow users to export tasks as JSON and import tasks from JSON.
	 - Acceptance criteria: Export produces valid JSON; importing merges tasks without duplicating existing ones (use id to dedupe).

## Acceptance / Non-functional notes

- Performance: UI actions (create/edit/delete/toggle) should happen instantly (optimistic updates) and then persist in the background.
- Accessibility: UI controls must be keyboard accessible and use semantic HTML to support screen readers.
- Internationalization: Dates should be stored as ISO strings; display may be localized.
- Security: If a backend is used, APIs must validate and sanitize input.

## Minimal API contract (if backend used)

GET /tasks -> returns Task[]
POST /tasks -> creates a Task
PUT /tasks/:id -> updates a Task
DELETE /tasks/:id -> deletes a Task

Each payload uses the data shape defined above.

## Edge cases to test

- Creating a task with only whitespace as the title (should be rejected).
- Setting a due date in the past (allowed, but consider an indicator).
- Large number of tasks (UI should remain usable; consider pagination or virtualized lists).
- Conflicting edits from multiple clients (last write wins, show updatedAt).

---

If you want, I can also add a short acceptance-test checklist or convert each requirement into Jest/react-testing-library tests under the `packages/frontend/__tests__` folder.

