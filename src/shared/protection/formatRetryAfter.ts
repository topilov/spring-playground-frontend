function pluralize(value: number, singular: string): string {
  return value === 1 ? singular : `${singular}s`;
}

function toWholeSeconds(retryAfterSeconds: number): number {
  return Math.max(0, Math.ceil(retryAfterSeconds));
}

export function formatRetryAfter(retryAfterSeconds: number | undefined): string | undefined {
  if (retryAfterSeconds === undefined || !Number.isFinite(retryAfterSeconds)) {
    return undefined;
  }

  const totalSeconds = toWholeSeconds(retryAfterSeconds);

  if (totalSeconds <= 0) {
    return undefined;
  }

  if (totalSeconds < 60) {
    return `Try again in ${totalSeconds} ${pluralize(totalSeconds, 'second')}.`;
  }

  if (totalSeconds < 3600) {
    const totalMinutes = Math.ceil(totalSeconds / 60);
    return `Try again in ${totalMinutes} ${pluralize(totalMinutes, 'minute')}.`;
  }

  const totalHours = Math.ceil(totalSeconds / 3600);
  return `Try again in ${totalHours} ${pluralize(totalHours, 'hour')}.`;
}
