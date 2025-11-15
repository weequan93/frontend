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
const NO_RETRY_ERROR_CODES = [500, 503]; // Don't retry on server errors

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
        
        // Don't retry if it's a server error (500, 503, etc.)
        if (error?.status && NO_RETRY_ERROR_CODES.includes(error.status)) {
          return false;
        }
        
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

    
    // Don't enable refetch if it's a server error
    if (apiQuery.isError && apiQuery.error?.status && NO_RETRY_ERROR_CODES.includes(apiQuery.error.status)) {
      setRefetchEnabled(false);
      return;
    }
    
    if (apiQuery.isError && apiQuery.errorUpdateCount === 1) {
      setRefetchEnabled(true);
    } else if (!apiQuery.isError) {
      setRefetchEnabled(false);
    } else {
      setRefetchEnabled(false);
    }
  }, [apiQuery.errorUpdateCount, apiQuery.isError, apiQuery.isPlaceholderData, apiQuery.error?.status]);
  // Return the API data, fallback to placeholder if undefined
  return apiQuery.data || DERIW_TX_INFO;
}
