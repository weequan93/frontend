// SPDX-License-Identifier: LicenseRef-Blockscout

import type { ApiResource } from '../types';
import type { DeriwAccountInfo, DeriwTxStates } from 'src/features/deriw/types/api';

export const DERIW_API_RESOURCES = {
  address_account: {
    path: '/client/account/info',
  },
  tx_state: {
    path: '/client/transaction/status',
  },
} satisfies Record<string, ApiResource>;

export type DeriwApiResourceName = `deriw:${ keyof typeof DERIW_API_RESOURCES }`;

/* eslint-disable @stylistic/indent */
export type DeriwApiResourcePayload<R extends DeriwApiResourceName> =
R extends 'deriw:address_account' ? DeriwAccountInfo :
R extends 'deriw:tx_state' ? DeriwTxStates :
never;
/* eslint-enable @stylistic/indent */
