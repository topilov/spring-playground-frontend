import { describe, expect, it } from 'vitest';

import { getQueryParamValue } from './queryParams';

describe('getQueryParamValue', () => {
  it('preserves raw plus signs in query values', () => {
    expect(getQueryParamValue('?token=email+change+token', 'token')).toBe(
      'email+change+token'
    );
  });

  it('decodes percent-encoded plus signs', () => {
    expect(getQueryParamValue('?token=email%2Bchange%2Btoken', 'token')).toBe(
      'email+change+token'
    );
  });

  it('decodes other percent-encoded characters normally', () => {
    expect(getQueryParamValue('?email=demo%40example.com', 'email')).toBe(
      'demo@example.com'
    );
  });
});
