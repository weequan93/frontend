import React from 'react';

import type { Transaction } from 'types/api/transaction';

import { Button } from 'toolkit/chakra/button';
import { Skeleton } from 'toolkit/chakra/skeleton';
import useDeriwTxQuery from 'ui/address/utils/useDeriwTxQuery';
import * as DetailedInfo from 'ui/shared/DetailedInfo/DetailedInfo';

interface Props {
  data: Pick<Transaction, 'hash' | 'method'>;
  isLoading: boolean;
}

const TxDetailsDeriw = ({ data, isLoading }: Props) => {
  const [ showAll, setShowAll ] = React.useState(false);
  const handleToggle = React.useCallback(() => setShowAll(value => !value), []);
  const query = useDeriwTxQuery({ hash: data.hash, method: data.method || '', isEnabled: !isLoading });
  const items = query.data.list;
  const visibleItems = showAll ? items : items.slice(0, 1);
  const loading = isLoading || query.isPlaceholderData;

  return (
    <>
      { visibleItems.map((tx, index) => {
        const number = items.length > 1 ? ` #${ index + 1 }` : '';
        const orderType = tx.order_type ? tx.order_type.charAt(0).toUpperCase() + tx.order_type.slice(1) : '-';

        return (
          <React.Fragment key={ index }>
            <DetailedInfo.ItemLabel hint="Order" isLoading={ loading }>Action{ number }</DetailedInfo.ItemLabel>
            <DetailedInfo.ItemValue>
              <Skeleton loading={ loading }>{ tx.is_long ? 'Long' : 'Short' } { tx.coin_name }</Skeleton>
            </DetailedInfo.ItemValue>
            <DetailedInfo.ItemLabel hint="Execution type" isLoading={ loading }>Price{ number }</DetailedInfo.ItemLabel>
            <DetailedInfo.ItemValue><Skeleton loading={ loading }>{ orderType }</Skeleton></DetailedInfo.ItemValue>
            <DetailedInfo.ItemLabel hint="Number of quantity" isLoading={ loading }>Size{ number }</DetailedInfo.ItemLabel>
            <DetailedInfo.ItemValue>
              <Skeleton loading={ loading }>{ tx.size || '-' }{ tx.size && tx.size !== '-' ? ` ${ tx.coin_name }` : '' }</Skeleton>
            </DetailedInfo.ItemValue>
          </React.Fragment>
        );
      }) }
      { items.length > 1 && (
        <>
          <DetailedInfo.ItemLabel>Deriw Transactions</DetailedInfo.ItemLabel>
          <DetailedInfo.ItemValue>
            <Button variant="plain" color="link" height="auto" p={ 0 } onClick={ handleToggle }>
              { showAll ? 'Show only first transaction' : `Show all ${ items.length } transactions` }
            </Button>
          </DetailedInfo.ItemValue>
        </>
      ) }
    </>
  );
};

export default TxDetailsDeriw;
