/**
 * Follow-up utility functions
 * Formatting, validation, and business logic for follow-up scheduling
 */

import { formatDistanceToNow, parseISO, isValid as isValidDate, format } from "date-fns";

/**
 * Format next action due date for display
 */
export const formatNextActionDue = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "Not scheduled";
  try {
    const date = parseISO(dateStr);
    if (!isValidDate(date)) return "Invalid date";
    return format(date, "MMM dd, yyyy");
  } catch {
    return "Invalid date";
  }
};

/**
 * Get relative time for next follow-up (e.g., "in 2 days")
 */
export const getFollowUpRelativeTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";
  try {
    const date = parseISO(dateStr);
    if (!isValidDate(date)) return "";
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "";
  }
};

/**
 * Format approach date (lead capture date) for display
 */
export const formatApproachDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "Not captured";
  try {
    const date = parseISO(dateStr);
    if (!isValidDate(date)) return "Invalid date";
    return format(date, "MMM dd, yyyy 'at' HH:mm");
  } catch {
    return "Invalid date";
  }
};

/**
 * Validate follow-up date is in the future
 */
export const isValidFollowUpDate = (dateStr: string | null | undefined): boolean => {
  if (!dateStr) return false;
  try {
    const date = parseISO(dateStr);
    return isValidDate(date) && date > new Date();
  } catch {
    return false;
  }
};

/**
 * Get status badge color for follow-up urgency
 */
export const getFollowUpUrgencyClass = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "text-gray-500 dark:text-white/50";
  
  try {
    const date = parseISO(dateStr);
    if (!isValidDate(date)) return "text-gray-500 dark:text-white/50";
    
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    if (diffDays < 0) return "text-red-500 dark:text-red-400"; // Overdue
    if (diffDays <= 1) return "text-orange-500 dark:text-orange-400"; // Today/Tomorrow
    if (diffDays <= 3) return "text-yellow-500 dark:text-yellow-400"; // Soon
    return "text-green-500 dark:text-green-400"; // Later
  } catch {
    return "text-gray-500 dark:text-white/50";
  }
};

/**
 * Check if follow-up is overdue
 */
export const isFollowUpOverdue = (dateStr: string | null | undefined): boolean => {
  if (!dateStr) return false;
  try {
    const date = parseISO(dateStr);
    return isValidDate(date) && date < new Date();
  } catch {
    return false;
  }
};

/**
 * Convert form state to GraphQL input
 */
export const convertFollowUpToInput = (
  leadId: string,
  formState: {
    nextActionDueAt: string;
    actionType?: string;
    description?: string;
    priority?: string;
  }
) => {
  return {
    leadId,
    nextActionDueAt: formState.nextActionDueAt,
    actionType: formState.actionType || undefined,
    description: formState.description?.trim() || undefined,
    priority: formState.priority || undefined,
  };
};
