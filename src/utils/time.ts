import { format, parse, isValid } from "date-fns";

/**
 * Safely formats a time string (HH:mm or HH:mm:ss) into 12-hour format (h:mm a)
 * @param timeStr The time string from the database
 * @returns Formatted time string or the original string if parsing fails
 */
export function formatTime12h(timeStr: string | undefined | null): string {
  if (!timeStr) return "";

  // Try HH:mm:ss first (Standard Postgres time format)
  let date = parse(timeStr, "HH:mm:ss", new Date());
  
  if (!isValid(date)) {
    // Try HH:mm
    date = parse(timeStr, "HH:mm", new Date());
  }

  if (!isValid(date)) {
    // Fallback: If it's already in some form of HH:mm... just try to take the first 5 chars
    // but date-fns parse is preferred.
    return timeStr;
  }

  return format(date, "h:mm a");
}
