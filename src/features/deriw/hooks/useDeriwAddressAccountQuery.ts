// SPDX-License-Identifier: LicenseRef-Blockscout

import { useQuery } from '@tanstack/react-query';
import React from 'react';
import type { Address } from 'viem';
import { formatUnits } from 'viem';

import useApiQuery from 'src/api/hooks/useApiQuery';
import { retry } from 'src/api/hooks/useQueryClientConfig';

import config from 'src/config';
import { publicClient } from 'src/features/connect-wallet/utils/public-client';

import { DERIW_ACCOUNT_INFO } from '../stubs';

const NO_RETRY_ERROR_CODES = [ 500, 503 ];

const erc20Abi = [
  {
    constant: true,
    inputs: [ { name: '_owner', type: 'address' } ],
    name: 'balanceOf',
    outputs: [ { name: 'balance', type: 'uint256' } ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [ { name: '', type: 'uint8' } ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

type Params = {
  address: string;
  isEnabled?: boolean;
};

type UsdtBalance = {
  balance: bigint | null;
  decimals: number | null;
};

export default function useDeriwAddressAccountQuery({ address, isEnabled = true }: Params) {
  const isDeriwApiEnabled = isEnabled && Boolean(address) && Boolean(config.apis.deriw);
  const isUsdtBalanceEnabled = isEnabled && Boolean(address) && Boolean(config.app.deriwUsdtAddress) && Boolean(publicClient);

  const apiQuery = useApiQuery<'deriw:address_account', { status: number }, { balance: number }>(
    'deriw:address_account',
    {
      queryParams: {
        address,
      },
      queryOptions: {
        enabled: isDeriwApiEnabled,
        placeholderData: DERIW_ACCOUNT_INFO,
        select: (data) => ({
          balance: Number(data.data.sum_account_value) || 0,
        }),
        retry: (failureCount, error) => {
          if (NO_RETRY_ERROR_CODES.includes(error.status)) {
            return false;
          }

          return retry(failureCount, error);
        },
      },
    },
  );

  const usdtQuery = useQuery<UsdtBalance>({
    queryKey: [ 'deriw:usdt_balance', address, config.app.deriwUsdtAddress ],
    enabled: isUsdtBalanceEnabled,
    placeholderData: {
      balance: 0n,
      decimals: 18,
    },
    queryFn: async() => {
      if (!publicClient || !config.app.deriwUsdtAddress) {
        return {
          balance: null,
          decimals: null,
        };
      }

      const contractAddress = config.app.deriwUsdtAddress as Address;
      const userAddress = address as Address;
      const [ balance, decimals ] = await Promise.all([
        publicClient.readContract({
          address: contractAddress,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [ userAddress ],
        }),
        publicClient.readContract({
          address: contractAddress,
          abi: erc20Abi,
          functionName: 'decimals',
        }),
      ]);

      return { balance, decimals };
    },
    retry: (failureCount, error) => retry(failureCount, error),
  });

  const isDeriwAccountPlaceholderData = Boolean(isDeriwApiEnabled && apiQuery.isPlaceholderData);
  const refetchDeriwAccount = apiQuery.refetch;

  React.useEffect(() => {
    if (!isDeriwApiEnabled || isDeriwAccountPlaceholderData || !publicClient) {
      return;
    }

    const interval = window.setInterval(() => {
      refetchDeriwAccount();
    }, 10_000);

    return () => window.clearInterval(interval);
  }, [ isDeriwAccountPlaceholderData, isDeriwApiEnabled, refetchDeriwAccount ]);

  const usdtBalance = (() => {
    if (!usdtQuery.data?.balance || !usdtQuery.data.decimals) {
      return 0;
    }

    return Number(formatUnits(usdtQuery.data.balance, usdtQuery.data.decimals)) || 0;
  })();

  const deriwBalance = isDeriwApiEnabled ? apiQuery.data?.balance || 0 : 0;

  return {
    balance: (deriwBalance + usdtBalance).toFixed(2),
    isPlaceholderData: isDeriwAccountPlaceholderData || Boolean(isUsdtBalanceEnabled && usdtQuery.isPlaceholderData),
  };
}
