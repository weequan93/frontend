
export interface DeriwTxStates {
  data: {
    list: DeriwTxState[];
  }
  isPlaceholderData: boolean;
}

export interface DeriwTxState {
  coin_name: string;
  is_long: boolean;
  size: string;
  order_type: string;
}

