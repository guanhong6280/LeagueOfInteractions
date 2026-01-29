/**
 * Date formatting helpers (DRY).
 *
 * NOTE: We keep a few variants because different screens intentionally display
 * dates differently (relative vs absolute, uppercase vs lowercase, etc.).
 */

// Patch discussion cards/detail: "JUST NOW", "3H AGO", "2D AGO", else locale date.
export const formatRelativeDateUpper = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

  if (diffInHours < 1) return 'JUST NOW';
  if (diffInHours < 24) return `${diffInHours}H AGO`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}D AGO`;
  return date.toLocaleDateString();
};

// Activity timeline: "12m ago", "3h ago", "2d ago", else locale date.
export const formatRelativeDateLower = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return d.toLocaleDateString();
};

// Video display: "Jan 26, 2026" (or similar), else empty.
export const formatDateShort = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Moderation cards: locale datetime, fallback to "Unknown date".
export const formatDateTimeOrUnknown = (value) => {
  try {
    if (!value) return 'Unknown date';
    return new Date(value).toLocaleString();
  } catch (error) {
    return value || 'Unknown date';
  }
};

