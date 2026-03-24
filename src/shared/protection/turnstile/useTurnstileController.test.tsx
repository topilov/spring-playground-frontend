/* @vitest-environment jsdom */

import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  TURNSTILE_INCOMPLETE_MESSAGE,
  useTurnstileController,
} from './useTurnstileController';

describe('useTurnstileController', () => {
  it('does not auto-execute the widget when the visible captcha is still incomplete', async () => {
    const execute = vi.fn();
    const { result } = renderHook(() => useTurnstileController());

    result.current.attach(
      {
        render: vi.fn(),
        execute,
        reset: vi.fn(),
      },
      'widget-id'
    );

    await expect(result.current.acquireToken()).rejects.toThrow(
      TURNSTILE_INCOMPLETE_MESSAGE
    );
    expect(execute).not.toHaveBeenCalled();
  });

  it('returns the solved token after the widget callback provides it', async () => {
    const { result } = renderHook(() => useTurnstileController());

    result.current.attach(
      {
        render: vi.fn(),
        execute: vi.fn(),
        reset: vi.fn(),
      },
      'widget-id'
    );
    result.current.handleToken('captcha-token');

    await expect(result.current.acquireToken()).resolves.toBe('captcha-token');
  });
});
