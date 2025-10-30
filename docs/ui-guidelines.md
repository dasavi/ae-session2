# UI Guidelines — TODO App

Last updated: 2025-10-30

This document outlines the UI/UX design guidelines for the TODO application. These guidelines ensure consistency, accessibility, and a modern user experience across the application.

## Design System

### Component Library
- **Framework**: Material-UI (MUI) v5+ for React components
- **Rationale**: Material-UI provides a comprehensive, accessible, and well-documented component library that follows Material Design principles
- **Installation**: `@mui/material @mui/icons-material @emotion/react @emotion/styled`

### Icons
- **Primary**: Material Icons (via `@mui/icons-material`)
- **Usage**: Use semantic icons (e.g., `CheckCircle` for complete, `Delete` for delete, `Edit` for edit)

## Color Palette

### Primary Colors
- **Primary**: `#1976d2` (Material Blue 700)
  - Use for: primary buttons, active states, links, headers
- **Primary Light**: `#42a5f5` (Material Blue 400)
  - Use for: hover states, accents
- **Primary Dark**: `#1565c0` (Material Blue 800)
  - Use for: pressed states, emphasis

### Secondary Colors
- **Secondary**: `#9c27b0` (Material Purple 500)
  - Use for: secondary actions, tags, highlights
- **Secondary Light**: `#ba68c8` (Material Purple 300)
- **Secondary Dark**: `#7b1fa2` (Material Purple 700)

### Semantic Colors
- **Success**: `#2e7d32` (Green 800)
  - Use for: completed tasks, success messages
- **Warning**: `#ed6c02` (Orange 700)
  - Use for: overdue tasks, warnings
- **Error**: `#d32f2f` (Red 700)
  - Use for: error messages, destructive actions
- **Info**: `#0288d1` (Light Blue 700)
  - Use for: informational messages

### Neutral Colors
- **Background**: `#fafafa` (Grey 50)
- **Surface**: `#ffffff` (White)
- **Text Primary**: `rgba(0, 0, 0, 0.87)`
- **Text Secondary**: `rgba(0, 0, 0, 0.6)`
- **Text Disabled**: `rgba(0, 0, 0, 0.38)`
- **Divider**: `rgba(0, 0, 0, 0.12)`

### Priority Colors
- **High Priority**: `#d32f2f` (Red 700)
- **Medium Priority**: `#ed6c02` (Orange 700)
- **Low Priority**: `#0288d1` (Light Blue 700)

## Typography

### Font Family
- **Primary**: `'Roboto', 'Helvetica', 'Arial', sans-serif`
- **Monospace**: `'Roboto Mono', 'Courier New', monospace` (for timestamps, IDs)

### Font Weights
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Bold**: 700

### Text Styles
- **H1 (Page Title)**: 32px, Bold, Primary Text
- **H2 (Section Header)**: 24px, Medium, Primary Text
- **H3 (Subsection)**: 20px, Medium, Primary Text
- **Body 1 (Task Title)**: 16px, Regular, Primary Text
- **Body 2 (Description)**: 14px, Regular, Secondary Text
- **Caption (Metadata)**: 12px, Regular, Secondary Text
- **Button Text**: 14px, Medium, uppercase

## Component Guidelines

### Buttons

#### Primary Button
- **Style**: Contained button with primary color
- **Usage**: Main actions (e.g., "Add Task", "Save")
- **States**: Default, Hover, Pressed, Disabled
- **Example**: `<Button variant="contained" color="primary">Add Task</Button>`

#### Secondary Button
- **Style**: Outlined button with primary color
- **Usage**: Secondary actions (e.g., "Cancel", "Filter")
- **Example**: `<Button variant="outlined" color="primary">Cancel</Button>`

#### Text Button
- **Style**: Text-only button
- **Usage**: Tertiary actions (e.g., "Clear filters", "Undo")
- **Example**: `<Button variant="text">Clear</Button>`

#### Icon Button
- **Style**: Circular or square icon-only button
- **Usage**: Compact actions (e.g., edit, delete, complete)
- **Size**: 40x40px (default), 32x32px (small)
- **Example**: `<IconButton><DeleteIcon /></IconButton>`

### Task List Items

#### Task Card/Item
- **Container**: White background with subtle shadow or border
- **Padding**: 16px
- **Border Radius**: 4px
- **Hover**: Slight elevation increase (shadow)
- **Layout**: Checkbox | Task Details | Metadata | Actions

#### Task States
- **Default**: Full opacity, standard text
- **Completed**: Checkbox checked, strikethrough title, reduced opacity (0.6)
- **Overdue**: Red accent on due date, optional warning icon
- **Selected**: Light blue background (`rgba(25, 118, 210, 0.08)`)

### Forms

#### Text Input
- **Component**: `TextField` with outlined variant
- **Label**: Floating label
- **Helper Text**: Show character count, validation errors
- **Example**: `<TextField label="Task Title" variant="outlined" fullWidth />`

#### Date Picker
- **Component**: MUI `DatePicker` or `DateTimePicker`
- **Format**: Localized (e.g., MM/DD/YYYY for US)
- **Validation**: Highlight invalid dates in red

#### Select/Dropdown
- **Component**: `Select` with outlined variant
- **Usage**: Priority selection, filter options
- **Example**: `<Select label="Priority" variant="outlined">`

#### Checkbox
- **Component**: MUI `Checkbox`
- **Usage**: Task completion, bulk selection
- **Size**: 24x24px (default)

### Chips/Tags
- **Component**: MUI `Chip`
- **Usage**: Task tags, filter pills
- **Variant**: Outlined (default), Filled (selected)
- **Deletable**: Show close icon for removable tags
- **Colors**: Use secondary color or custom tag colors

### Dialogs/Modals
- **Component**: MUI `Dialog`
- **Usage**: Task editing, confirmations, bulk actions
- **Width**: 500px (default), 600px (large forms)
- **Actions**: Right-aligned buttons (Cancel on left, Confirm on right)

### Snackbars/Toasts
- **Component**: MUI `Snackbar` with `Alert`
- **Position**: Bottom-center
- **Duration**: 4s (info), 6s (warning/error)
- **Variants**: Success, Error, Warning, Info

## Layout

### Spacing System
Use MUI spacing units (8px base):
- **xs**: 4px (0.5 units)
- **sm**: 8px (1 unit)
- **md**: 16px (2 units)
- **lg**: 24px (3 units)
- **xl**: 32px (4 units)

### Grid System
- **Container**: Max-width 1200px, centered
- **Responsive**: Mobile-first approach
  - **xs**: < 600px (single column)
  - **sm**: 600px - 960px
  - **md**: 960px - 1280px (default)
  - **lg**: > 1280px

### App Structure
```
┌─────────────────────────────────┐
│         App Bar (Header)        │
├─────────────────────────────────┤
│  ┌──────────┐  ┌─────────────┐ │
│  │ Filters  │  │  Task List  │ │
│  │ & Search │  │             │ │
│  └──────────┘  └─────────────┘ │
│                                 │
└─────────────────────────────────┘
```

## Accessibility (WCAG 2.1 Level AA)

### Color Contrast
- **Text on background**: Minimum 4.5:1 ratio
- **Large text (18pt+)**: Minimum 3:1 ratio
- **Interactive elements**: Ensure sufficient contrast in all states

### Keyboard Navigation
- **Tab order**: Logical flow (top to bottom, left to right)
- **Focus indicators**: Visible focus ring on all interactive elements
- **Keyboard shortcuts**: 
  - `Enter`: Confirm/submit
  - `Escape`: Cancel/close dialogs
  - `Space`: Toggle checkboxes
  - Arrow keys: Navigate lists

### Screen Readers
- **Semantic HTML**: Use proper heading hierarchy (h1-h6)
- **ARIA labels**: Label all icons, buttons without text
- **Live regions**: Announce dynamic updates (task added, deleted)
- **Alt text**: Descriptive text for all icons

### Touch Targets
- **Minimum size**: 44x44px for all interactive elements
- **Spacing**: Minimum 8px between adjacent touch targets

## Responsive Design

### Mobile (< 600px)
- Single-column layout
- Full-width task cards
- Floating action button (FAB) for "Add Task"
- Bottom sheet for filters
- Swipe gestures for complete/delete

### Tablet (600px - 960px)
- Two-column layout option
- Side drawer for filters
- Larger touch targets

### Desktop (> 960px)
- Multi-column layout
- Persistent filter sidebar
- Hover states enabled
- Keyboard shortcuts prominently featured

## Animation & Motion

### Transitions
- **Duration**: 200-300ms for most transitions
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` (Material ease)

### Common Animations
- **Task add**: Fade in + slide down (300ms)
- **Task remove**: Fade out + slide up (200ms)
- **Task complete**: Checkbox animation + strikethrough
- **Dialog open/close**: Fade + scale (250ms)
- **Snackbar**: Slide up from bottom (225ms)

### Loading States
- **Component**: MUI `CircularProgress` or `Skeleton`
- **Color**: Primary color
- **Placement**: Center of container or inline

## Best Practices

### Do's
✅ Use consistent spacing (8px grid)
✅ Provide immediate visual feedback for actions
✅ Use semantic colors (green for success, red for errors)
✅ Keep primary actions prominent
✅ Support both mouse and keyboard navigation
✅ Test with screen readers
✅ Use optimistic UI updates

### Don'ts
❌ Don't use color alone to convey information
❌ Don't disable buttons without explanation
❌ Don't use tiny touch targets on mobile
❌ Don't auto-focus inputs on page load (mobile)
❌ Don't use more than 3 levels of hierarchy
❌ Don't override browser scroll behavior
❌ Don't use animation for critical state changes

## Implementation Notes

### MUI Theme Configuration
Create a custom theme in `src/theme.js`:
```javascript
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    success: { main: '#2e7d32' },
    warning: { main: '#ed6c02' },
    error: { main: '#d32f2f' },
    info: { main: '#0288d1' },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
  spacing: 8,
});

export default theme;
```

### Dark Mode (Optional)
- Support system preference detection
- Toggle in app settings
- Adjust color palette for dark backgrounds
- Maintain WCAG contrast ratios

---

These guidelines should be followed consistently throughout the application to ensure a cohesive and accessible user experience.
