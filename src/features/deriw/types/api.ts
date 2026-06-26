// SPDX-License-Identifier: LicenseRef-Blockscout

export interface DeriwAccountInfo {
  data: {
    address: string;
    position_value: string;
    pending_order_book_value: string;
    sum_account_value: string;
  };
}

export interface DeriwTxState {
  coin_name: string;
  is_long: boolean;
  order_type: string;
  size: string;
}

export interface DeriwTxStates {
  data: {
    list: Array<DeriwTxState>;
  };
}
