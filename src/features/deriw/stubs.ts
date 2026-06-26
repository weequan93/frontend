// SPDX-License-Identifier: LicenseRef-Blockscout

import type { DeriwAccountInfo, DeriwTxStates } from './types/api';

export const DERIW_ACCOUNT_INFO: DeriwAccountInfo = {
  data: {
    address: '',
    position_value: '0',
    pending_order_book_value: '0',
    sum_account_value: '0',
  },
};

export const DERIW_TX_INFO: DeriwTxStates = {
  data: {
    list: [],
  },
};
