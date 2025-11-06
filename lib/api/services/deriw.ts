import type { ApiResource } from '../types';
import type { AccountAddress } from 'types/api/deriwAccount';
import type { DeriwTxStates } from 'types/api/deriwTx';

export const DERIW_API_RESOURCES = {
  address_account: {
    path: '/client/account/info',
    queryParams: [ 'address' ] as const,
  },
  tx_state: {
    path: '/client/transaction/status',
    queryParams: [ 'tx_hash', 'type' ] as const,
  },
} as const satisfies Record<string, ApiResource>;

export type DeriwApiResourceName = `deriw:${ keyof typeof DERIW_API_RESOURCES }`;

// Define return types for each deriw API resource
export type DeriwApiResourcePayload<R extends DeriwApiResourceName> =
    R extends 'deriw:address_account' ? AccountAddress :
      R extends 'deriw:tx_state' ? DeriwTxStates :
        never;
