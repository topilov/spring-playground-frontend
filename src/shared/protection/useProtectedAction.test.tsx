/* @vitest-environment jsdom */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ApiClientError, buildApiUrl } from '../api/apiClient';
import { useProtectedAction } from './useProtectedAction';

describe('useProtectedAction', () => {
  it('acquires a token before calling execute', async () => {
    const acquireToken = vi.fn().mockResolvedValue('captcha-token');
    const reset = vi.fn();
    const execute = vi.fn().mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useProtectedAction({ acquireToken, reset }));

    const response = await result.current.execute({ execute });

    expect(acquireToken).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith('captcha-token');
    expect(response).toEqual({ ok: true });
  });

  it('resets captcha on success', async () => {
    const acquireToken = vi.fn().mockResolvedValue('captcha-token');
    const reset = vi.fn();
    const execute = vi.fn().mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useProtectedAction({ acquireToken, reset }));

    await result.current.execute({ execute });

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('keeps a successful result when captcha reset throws', async () => {
    const acquireToken = vi.fn().mockResolvedValue('captcha-token');
    const reset = vi.fn().mockImplementation(() => {
      throw new Error('widget disappeared');
    });
    const execute = vi.fn().mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useProtectedAction({ acquireToken, reset }));

    await expect(result.current.execute({ execute })).resolves.toEqual({ ok: true });
  });

  it('resets captcha on protection failures', async () => {
    const acquireToken = vi.fn().mockResolvedValue('captcha-token');
    const reset = vi.fn();
    const protectionError = new ApiClientError({
      status: 400,
      statusText: 'Bad Request',
      url: buildApiUrl('/api/auth/login'),
      responseBody: {
        error: 'Captcha validation failed.',
        code: 'CAPTCHA_INVALID',
      },
    });
    const execute = vi.fn().mockRejectedValue(protectionError);
    const { result } = renderHook(() => useProtectedAction({ acquireToken, reset }));

    await expect(result.current.execute({ execute })).rejects.toBe(protectionError);

    expect(reset).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(result.current.protection).toEqual({
        kind: 'captcha_invalid',
      });
    });
    expect(result.current.wasHandledError(protectionError)).toBe(true);
  });

  it('rethrows the original protection error when captcha reset throws', async () => {
    const acquireToken = vi.fn().mockResolvedValue('captcha-token');
    const reset = vi.fn().mockImplementation(() => {
      throw new Error('widget disappeared');
    });
    const protectionError = new ApiClientError({
      status: 400,
      statusText: 'Bad Request',
      url: buildApiUrl('/api/auth/login'),
      responseBody: {
        error: 'Captcha validation failed.',
        code: 'CAPTCHA_INVALID',
      },
    });
    const execute = vi.fn().mockRejectedValue(protectionError);
    const { result } = renderHook(() => useProtectedAction({ acquireToken, reset }));

    await expect(result.current.execute({ execute })).rejects.toBe(protectionError);

    await waitFor(() => {
      expect(result.current.protection).toEqual({
        kind: 'captcha_invalid',
      });
    });
  });

  it('does not reuse a stale token after a non-protection business error', async () => {
    let nextTokenId = 0;
    let cachedToken: string | null = null;
    const acquireToken = vi.fn().mockImplementation(async () => {
      if (!cachedToken) {
        nextTokenId += 1;
        cachedToken = `captcha-token-${nextTokenId}`;
      }

      return cachedToken;
    });
    const reset = vi.fn().mockImplementation(() => {
      cachedToken = null;
    });
    const businessError = new ApiClientError({
      status: 400,
      statusText: 'Bad Request',
      url: buildApiUrl('/api/auth/login'),
      responseBody: {
        error: 'Invalid credentials.',
        code: 'INVALID_CREDENTIALS',
      },
    });
    const execute = vi
      .fn()
      .mockRejectedValueOnce(businessError)
      .mockResolvedValueOnce({ ok: true });
    const { result } = renderHook(() => useProtectedAction({ acquireToken, reset }));

    await expect(result.current.execute({ execute })).rejects.toBe(businessError);
    await expect(result.current.execute({ execute })).resolves.toEqual({ ok: true });

    expect(execute).toHaveBeenNthCalledWith(1, 'captcha-token-1');
    expect(execute).toHaveBeenNthCalledWith(2, 'captcha-token-2');
    expect(reset).toHaveBeenCalledTimes(2);
  });

  it('returns a stable user-facing error when token acquisition fails', async () => {
    const acquireToken = vi.fn().mockRejectedValue(new Error('turnstile unavailable'));
    const reset = vi.fn();
    const execute = vi.fn();
    const { result } = renderHook(() => useProtectedAction({ acquireToken, reset }));

    await expect(result.current.execute({ execute })).rejects.toThrow(
      'We could not verify that you are human. Please try again.'
    );

    expect(execute).not.toHaveBeenCalled();
    expect(reset).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(result.current.errorMessage).toBe(
        'We could not verify that you are human. Please try again.'
      );
    });
  });

  it('only marks the exact handled error path as already handled', async () => {
    const acquireToken = vi.fn().mockRejectedValue(new Error('turnstile unavailable'));
    const reset = vi.fn();
    const execute = vi.fn();
    const { result } = renderHook(() => useProtectedAction({ acquireToken, reset }));

    const thrownError = await result.current.execute({ execute }).catch((error) => error);

    expect(result.current.wasHandledError(thrownError)).toBe(true);
    expect(
      result.current.wasHandledError(
        new Error('We could not verify that you are human. Please try again.')
      )
    ).toBe(false);

    result.current.resetStatus();

    expect(result.current.wasHandledError(thrownError)).toBe(false);
  });
});
