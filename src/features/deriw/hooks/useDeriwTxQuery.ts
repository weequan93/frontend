// SPDX-License-Identifier: LicenseRef-Blockscout

import useApiQuery from 'src/api/hooks/useApiQuery';
import { retry } from 'src/api/hooks/useQueryClientConfig';

import config from 'src/config';

import { DERIW_TX_INFO } from '../stubs';
import type { DeriwTxStates } from '../types/api';

const NO_RETRY_ERROR_CODES = [ 500, 503 ];

type Params = {
  hash: string;
  method: string;
  isEnabled?: boolean;
  isRefetchEnabled?: boolean;
};

export default function useDeriwTxQuery({ hash, method, isEnabled = true, isRefetchEnabled }: Params): DeriwTxStates & { isPlaceholderData: boolean } {
  const query = useApiQuery<'deriw:tx_state', { status: number }>(
    'deriw:tx_state',
    {
      queryParams: {
        tx_hash: hash,
        type: method,
      },
      queryOptions: {
        enabled: isEnabled && Boolean(hash) && method !== 'placeholder' && Boolean(config.apis.deriw),
        placeholderData: DERIW_TX_INFO,
        refetchInterval: isRefetchEnabled ? 20_000 : false,
        retry: (failureCount, error) => {
          if (NO_RETRY_ERROR_CODES.includes(error.status)) {
            return false;
          }

          return retry(failureCount, error);
        },
      },
    },
  );

  return {
    ...DERIW_TX_INFO,
    ...query.data,
    isPlaceholderData: Boolean(query.isPlaceholderData),
  };
}
