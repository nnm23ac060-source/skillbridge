/** Small display/format helpers shared across the UI. */

export const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || '?';

export const formatDate = (date, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  date ? new Date(date).toLocaleDateString('en-IN', opts) : '—';

export const formatDateTime = (date) =>
  date
    ? new Date(date).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

/** Relative time like "2 days ago" / "just now" */
export function timeAgo(date) {
  if (!date) return '—';
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  const units = [
    [31536000, 'year'],
    [2592000, 'month'],
    [604800, 'week'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ];
  for (const [sec, label] of units) {
    if (s >= sec) {
      const n = Math.floor(s / sec);
      return `${n} ${label}${n > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

export const firstName = (name = '') => name.trim().split(/\s+/)[0] || 'there';

/** ₹ formatting with Indian grouping, e.g. ₹25,000 */
export const formatCurrency = (n) =>
  n === null || n === undefined || Number.isNaN(Number(n))
    ? '—'
    : new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(Number(n));

/** Days until a date (negative = past) */
export const daysUntil = (date) =>
  date ? Math.ceil((new Date(date).getTime() - Date.now()) / 86400000) : null;
