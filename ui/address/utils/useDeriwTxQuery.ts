import React from 'react';

import type { ResourceError } from 'lib/api/resources';
import useApiQuery from 'lib/api/useApiQuery';
import { retry } from 'lib/api/useQueryClientConfig';
import { SECOND } from 'toolkit/utils/consts';
import { DERIW_ACCOUNT_INFO, DERIW_TX_INFO } from 'stubs/deriw';
import { DeriwTxState, DeriwTxStates } from 'types/api/deriwTx';



interface Params {
  hash: string;
  method: string;
  isEnabled?: boolean;
}

const NO_RPC_FALLBACK_ERROR_CODES = [403];

export default function useDeriwTxQuery({ hash, method, isEnabled = true }: Params): DeriwTxStates {
  const [isRefetchEnabled, setRefetchEnabled] = React.useState(false);

  // Determine which API endpoint to use based on the method
  const getApiResource = (method: string) => {
    switch (method) {

      default:
        return 'deriw:tx_state' as const; // default fallback
    }
  };

  const apiResource = getApiResource(method);
  const apiQuery = useApiQuery<typeof apiResource, { status: number }>(apiResource, {
    queryParams: { tx_hash: hash, type: method },
    queryOptions: {
      enabled: isEnabled && Boolean(hash) && method !=="placeholder",
      placeholderData: DERIW_TX_INFO,
      refetchOnMount: false,
      retry: (failureCount, error) => {
        if (isRefetchEnabled) {
          return false;
        }

        return retry(failureCount, error);
      },
      refetchInterval: (): number | false => {
        return isRefetchEnabled ? 15 * SECOND : false;
      },
    },
  });

  // Handle refetch logic
  React.useEffect(() => {
    if (apiQuery.isPlaceholderData) {
      return;
    }

    if (apiQuery.isError && apiQuery.errorUpdateCount === 1) {
      setRefetchEnabled(true);
    } else if (!apiQuery.isError) {
      setRefetchEnabled(false);
    }
  }, [apiQuery.errorUpdateCount, apiQuery.isError, apiQuery.isPlaceholderData, apiQuery.error?.status]);
  // Return the API data, fallback to placeholder if undefined
  return apiQuery.data || DERIW_TX_INFO;
}
