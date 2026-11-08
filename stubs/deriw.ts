import type { AccountAddress } from 'types/api/deriwAccount';
import type { DeriwTxResponse } from 'types/api/deriwTx';

export const DERIW_ACCOUNT_INFO: AccountAddress = {
  data: { address: '', position_value: '0', pending_order_book_value: '0', sum_account_value: '0' },
};

export const DERIW_TX_INFO: DeriwTxResponse = { data: { list: [] } };
