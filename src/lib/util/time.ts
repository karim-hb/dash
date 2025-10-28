// Time utilities for the tracker

// Get current timestamp in seconds
export function now(): number {
  return Math.floor(Date.now() / 1000);
}

// Get current timestamp in milliseconds
export function nowMs(): number {
  return Date.now();
}

// Format timestamp for display
export function formatTimestamp(ts: number): string {
  const date = new Date(ts * 1000);
  return date.toLocaleTimeString();
}

// Format relative time
export function formatRelativeTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.floor(seconds)}s`;
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m`;
  } else if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}h`;
  } else {
    return `${Math.floor(seconds / 86400)}d`;
  }
}

// Calculate time difference
export function timeDiff(start: number, end: number): number {
  return Math.max(0, end - start);
}

// Check if timestamp is recent (within last N seconds)
export function isRecent(ts: number, withinSeconds: number = 300): boolean {
  return now() - ts <= withinSeconds;
}

// Format age for display
export function formatAge(ageSeconds: number): string {
  if (ageSeconds < 0) return 'N/A';

  if (ageSeconds < 60) {
    return `${ageSeconds}s`;
  } else if (ageSeconds < 3600) {
    const minutes = Math.floor(ageSeconds / 60);
    const seconds = ageSeconds % 60;
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  } else if (ageSeconds < 86400) {
    const hours = Math.floor(ageSeconds / 3600);
    const minutes = Math.floor((ageSeconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  } else {
    const days = Math.floor(ageSeconds / 86400);
    const hours = Math.floor((ageSeconds % 86400) / 3600);
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }
}

// Sleep utility for async operations
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
