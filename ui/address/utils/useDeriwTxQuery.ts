import type { DeriwTxStates } from 'types/api/deriwTx';

import config from 'configs/app';
import { retryDeriwRequest, shouldPollDeriwError } from 'lib/api/deriwRetry';
import useApiQuery from 'lib/api/useApiQuery';
import { DERIW_TX_INFO } from 'stubs/deriw';
import { SECOND } from 'toolkit/utils/consts';

interface Params {
  hash?: string;
  method: string;
  isEnabled?: boolean;
}

export default function useDeriwTxQuery({ hash, method, isEnabled = true }: Params): DeriwTxStates {
  const enabled = isEnabled && Boolean(config.apis.deriw && hash) && method !== 'placeholder';
  const query = useApiQuery('deriw:tx_state', {
    queryParams: { tx_hash: hash, type: method },
    queryOptions: {
      enabled,
      placeholderData: DERIW_TX_INFO,
      refetchOnMount: false,
      retry: retryDeriwRequest,
      refetchInterval: (query) => enabled && query.state.status === 'error' && shouldPollDeriwError(query.state.error) ? 15 * SECOND : false,
    },
  });

  const items = query.data?.data?.list;
  return {
    data: { list: Array.isArray(items) ? items : [] },
    isPlaceholderData: enabled && (query.isPlaceholderData || query.isPending),
  };
}
