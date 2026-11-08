import type { ApiResource } from '../types';
import type { AccountAddress } from 'types/api/deriwAccount';
import type { DeriwTxResponse } from 'types/api/deriwTx';

export const DERIW_API_RESOURCES = {
  address_account: {
    path: '/client/account/info',
  },
  tx_state: {
    path: '/client/transaction/status',
  },
} as const satisfies Record<string, ApiResource>;

export type DeriwApiResourceName = `deriw:${ keyof typeof DERIW_API_RESOURCES }`;

/* eslint-disable @stylistic/indent */
export type DeriwApiResourcePayload<R extends DeriwApiResourceName> =
R extends 'deriw:address_account' ? AccountAddress :
R extends 'deriw:tx_state' ? DeriwTxResponse :
never;
/* eslint-enable @stylistic/indent */
