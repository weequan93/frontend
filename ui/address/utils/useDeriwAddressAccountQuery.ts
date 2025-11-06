import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

import type { Address } from 'types/api/address';

import config from 'configs/app';
import type { ResourceError } from 'lib/api/resources';
import useApiQuery from 'lib/api/useApiQuery';
import { retry } from 'lib/api/useQueryClientConfig';
import { publicClient } from 'lib/web3/client';
import { ADDRESS_INFO } from 'stubs/address';
import { GET_BALANCE } from 'stubs/RPC';
import { SECOND } from 'toolkit/utils/consts';
import { DERIW_ACCOUNT_INFO } from 'stubs/deriw';
import { AccountTokenBalance } from 'types/api/deriwAccount';

// ERC20 ABI for balanceOf and decimals functions
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
] as const;

type RpcResponseType = [
    bigint | null, // USDT balance
    number | null, // USDT decimals
];

export type AddressQuery =  {
  balance: string;
  isPlaceholderData: boolean;
};

interface Params {
  address: string;
  isEnabled?: boolean;
}

const NO_RPC_FALLBACK_ERROR_CODES = [ 403 ];

export default function useDeriwAddressAccountQuery({ address, isEnabled = true }: Params): AddressQuery {
  const [ isRefetchEnabled, setRefetchEnabled ] = React.useState(false);

  const apiQuery = useApiQuery<'deriw:address_account', { status: number }>('deriw:address_account', {
    queryParams: { address: address },
    queryOptions: {
      enabled: isEnabled && Boolean(address),
      placeholderData: DERIW_ACCOUNT_INFO,
      refetchOnMount: false,
      retry: (failureCount, error) => {
        
        if (isRefetchEnabled) {
          return false;
        }

        return retry(failureCount, error);
      },
      refetchInterval: (): number | false => {
        return isRefetchEnabled ? 15 * SECOND : false;
      },
    },
  });

  // Debug API query errors
  React.useEffect(() => {
    if (apiQuery.isError && apiQuery.error) {
      console.error('API Query Error:', {
        error: apiQuery.error,
        status: apiQuery.error.status,
        errorUpdateCount: apiQuery.errorUpdateCount,
        failureCount: apiQuery.failureCount,
        failureReason: apiQuery.failureReason,
      });
    }
  }, [apiQuery.isError, apiQuery.error, apiQuery.errorUpdateCount]);

  const rpcQuery = useQuery<RpcResponseType, unknown, AccountTokenBalance | null>({
    queryKey: ['RPC', 'address', 'balance', { address } ],
    queryFn: async() => {
      if (!publicClient) {
        throw new Error('No public RPC client');
      }

      // Get USDT balance and decimals
      let usdtBalance: bigint | null = null;
      let usdtDecimals: number | null = null;
      if (config.app.deriwUsdtAddress) {
        try {
          // Get balance
          usdtBalance = await publicClient.readContract({
            address: config.app.deriwUsdtAddress as `0x${ string }`,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [address as `0x${ string }` ],
          }) as bigint;
          // Get decimals
          usdtDecimals = await publicClient.readContract({
            address: config.app.deriwUsdtAddress as `0x${ string }`,
            abi: ERC20_ABI,
            functionName: 'decimals',
          }) as number;
        } catch (error) {
          usdtBalance = null;
          usdtDecimals = null;
        }
      }

      return Promise.all([
        Promise.resolve(usdtBalance),
        Promise.resolve(usdtDecimals),
      ]);
    },
    select: (response) => {
      const [ usdtBalance, usdtDecimals ] = response;

      if (!usdtBalance || usdtDecimals === null) {
        return {
          coin_balance: 0,
        };
      }

      // Convert USDT balance using actual decimals from contract to 2 decimal format
      const usdtFormatted = (Number(usdtBalance) / Math.pow(10, usdtDecimals))//.toFixed(2);
      return {
        coin_balance: (usdtFormatted),
      };
    },
    placeholderData: [ BigInt(0), 6 ], // USDT placeholder balance and decimals
    enabled: isEnabled && Boolean(address),
    retry: false,
    refetchOnMount: false,
  });

  React.useEffect(() => {
    if (apiQuery.isPlaceholderData || !publicClient) {
      return;
    }

    if (apiQuery.isError && apiQuery.errorUpdateCount === 1) {
      setRefetchEnabled(true);
    } else if (!apiQuery.isError) {
      setRefetchEnabled(false);
    }
  }, [ apiQuery.errorUpdateCount, apiQuery.isError, apiQuery.isPlaceholderData, apiQuery.error?.status ]);

  React.useEffect(() => {
    if (!rpcQuery.isPlaceholderData && !rpcQuery.data) {
      setRefetchEnabled(false);
    }
  }, [ rpcQuery.data, rpcQuery.isPlaceholderData ]);
  // Get USDT balance from RPC query if available, otherwise from API query
  const rpcBalance = Number(rpcQuery.data?.coin_balance) || 0;
  const apiBalance = Number(apiQuery.data?.data?.sum_account_value) || 0;
  const usdtBalance = rpcBalance + apiBalance;
  const balance = usdtBalance.toFixed(2);
  return {
    balance,
    isPlaceholderData: apiQuery.isPlaceholderData || rpcQuery.isPlaceholderData,
  };
}
