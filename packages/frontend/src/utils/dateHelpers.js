import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isTomorrow);

/**
 * Format a date for display
 * @param {string|Date} date - Date to format
 * @param {string} format - Format string (default: 'MMM D, YYYY')
 * @returns {string} Formatted date
 */
export function formatDate(date, format = 'MMM D, YYYY') {
  if (!date) return '';
  return dayjs(date).format(format);
}

/**
 * Get relative time from now (e.g., "2 hours ago", "in 3 days")
 * @param {string|Date} date - Date to compare
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
  if (!date) return '';
  return dayjs(date).fromNow();
}

/**
 * Check if a date is overdue
 * @param {string|Date} dueDate - Due date to check
 * @returns {boolean} True if overdue
 */
export function isOverdue(dueDate) {
  if (!dueDate) return false;
  return dayjs(dueDate).isBefore(dayjs(), 'day');
}

/**
 * Check if a date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if today
 */
export function isDateToday(date) {
  if (!date) return false;
  return dayjs(date).isToday();
}

/**
 * Check if a date is tomorrow
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if tomorrow
 */
export function isDateTomorrow(date) {
  if (!date) return false;
  return dayjs(date).isTomorrow();
}

/**
 * Get a friendly due date label
 * @param {string|Date} dueDate - Due date
 * @returns {string} Friendly label (e.g., "Today", "Tomorrow", "Overdue", or formatted date)
 */
export function getDueDateLabel(dueDate) {
  if (!dueDate) return '';
  
  if (isOverdue(dueDate)) {
    return 'Overdue';
  }
  
  if (isDateToday(dueDate)) {
    return 'Today';
  }
  
  if (isDateTomorrow(dueDate)) {
    return 'Tomorrow';
  }
  
  const daysUntilDue = dayjs(dueDate).diff(dayjs(), 'day');
  if (daysUntilDue <= 7) {
    return dayjs(dueDate).format('dddd'); // Day of week
  }
  
  return formatDate(dueDate);
}

/**
 * Parse and validate a date string
 * @param {string} dateString - Date string to parse
 * @returns {string|null} ISO date string or null if invalid
 */
export function parseDate(dateString) {
  if (!dateString) return null;
  const parsed = dayjs(dateString);
  return parsed.isValid() ? parsed.toISOString() : null;
}
