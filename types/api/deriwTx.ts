export interface DeriwTxState {
  coin_name: string;
  is_long: boolean;
  size: string;
  order_type: string;
}

export interface DeriwTxResponse {
  data: { list: Array<DeriwTxState> };
}

export interface DeriwTxStates extends DeriwTxResponse {
  isPlaceholderData: boolean;
}
