import { describe, expect, it } from 'vitest';

import { formatRetryAfter } from './formatRetryAfter';

describe('formatRetryAfter', () => {
  it('formats short delays in seconds', () => {
    expect(formatRetryAfter(45)).toBe('Try again in 45 seconds.');
  });

  it('formats minute-based delays', () => {
    expect(formatRetryAfter(120)).toBe('Try again in 2 minutes.');
  });

  it('formats hour-based delays', () => {
    expect(formatRetryAfter(3600)).toBe('Try again in 1 hour.');
  });

  it('returns undefined when no retry delay is available', () => {
    expect(formatRetryAfter(undefined)).toBeUndefined();
  });
});
