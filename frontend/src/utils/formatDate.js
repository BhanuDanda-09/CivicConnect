// ==============================================================================
// Date and Relative Time Formatting Helper
// ==============================================================================

export function formatDate(isoString) {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (err) {
    return isoString;
  }
}

export function formatDateTime(isoString) {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (err) {
    return isoString;
  }
}

export function formatRelativeTime(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return formatDate(isoString);
  } catch (err) {
    return isoString;
  }
}
