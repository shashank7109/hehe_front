/**
 * Shared utility helpers used across all dashboard pages.
 * Import from here — do NOT copy-paste into individual pages.
 */

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'
).replace('/api', '');

/** Formats a date string to "2 Apr 2026" */
export const formatDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

/** Builds an absolute URL for an uploaded file path stored in DB */
export const formatFileUrl = (dbPath) => {
  if (!dbPath) return '#';
  if (dbPath.startsWith('http')) return dbPath; // Cloudinary URL
  const cleanPath = dbPath.includes('uploads/')
    ? dbPath.substring(dbPath.indexOf('uploads/'))
    : dbPath;
  return `${API_BASE}/${cleanPath}`;
};

/** Returns duration between two dates as "N Days" */
export const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  const diffMs = Math.abs(new Date(endDate) - new Date(startDate));
  return `${Math.ceil(diffMs / (1000 * 60 * 60 * 24))} Days`;
};

/** Derives academic year label from roll number prefix (e.g. "3rd Year") */
export const calculateStudentYear = (rollNumber) => {
  if (!rollNumber) return 'N/A';
  const prefix = parseInt(rollNumber.substring(0, 2));
  if (isNaN(prefix)) return 'N/A';
  const currentYearSuffix = new Date().getFullYear() % 100;
  let yearNum = currentYearSuffix - prefix;
  if (yearNum <= 0) yearNum = 1;
  if (yearNum > 4) yearNum = 4;
  const suffixes = ['th', 'st', 'nd', 'rd', 'th'];
  return `${yearNum}${suffixes[yearNum] || 'th'} Year`;
};

/** Returns today's date as "Wednesday, April 2" */
export const formatTodayDate = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

/** Greeting based on time of day */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};
