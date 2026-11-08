import { describe, expect, test } from 'vitest';

import { retryDeriwRequest, shouldPollDeriwError } from './deriwRetry';
import { retry } from './useQueryClientConfig';

describe('Deriw API outage policy', () => {
  test.each([ 400, 403, 404, 429, 500, 503 ])('stops retry and polling for HTTP %i', (status) => {
    expect(retryDeriwRequest(0, { status })).toBe(false);
    expect(shouldPollDeriwError({ status })).toBe(false);
  });

  test.each([ 502, 504 ])('retains bounded retries for transient HTTP %i', (status) => {
    expect(retryDeriwRequest(0, { status })).toBe(true);
    expect(retryDeriwRequest(2, { status })).toBe(false);
  });

  test('retains bounded retries for a transport failure', () => {
    expect(retryDeriwRequest(0, new Error('network unavailable'))).toBe(true);
    expect(retryDeriwRequest(2, new Error('network unavailable'))).toBe(false);
  });

  test('does not disable general backend recovery on HTTP 500', () => {
    expect(retry(0, { status: 500 })).toBe(true);
    expect(retry(2, { status: 500 })).toBe(false);
  });
});
