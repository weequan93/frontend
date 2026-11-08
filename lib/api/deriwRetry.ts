import getErrorObjStatusCode from 'lib/errors/getErrorObjStatusCode';

import { retry } from './useQueryClientConfig';

export function shouldPollDeriwError(error: unknown) {
  const status = getErrorObjStatusCode(error);
  return !status || (status >= 500 && status !== 500 && status !== 503);
}

export function retryDeriwRequest(failureCount: number, error: unknown) {
  return shouldPollDeriwError(error) && retry(failureCount, error);
}
