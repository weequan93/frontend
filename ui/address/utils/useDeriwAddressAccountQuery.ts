import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { isAddress } from 'viem';

import config from 'configs/app';
import { retryDeriwRequest, shouldPollDeriwError } from 'lib/api/deriwRetry';
import useApiQuery from 'lib/api/useApiQuery';
import { publicClient } from 'lib/web3/client';
import { DERIW_ACCOUNT_INFO } from 'stubs/deriw';
import { SECOND } from 'toolkit/utils/consts';

const ERC20_ABI = [
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [ { name: 'owner', type: 'address' } ], outputs: [ { type: 'uint256' } ] },
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [ { type: 'uint8' } ] },
] as const;

interface Params {
  address: string;
  isEnabled?: boolean;
}

export default function useDeriwAddressAccountQuery({ address, isEnabled = true }: Params) {
  const enabled = isEnabled && Boolean(config.apis.deriw) && isAddress(address);
  const tokenAddress = config.app.deriwUsdtAddress;
  const rpcEnabled = enabled && Boolean(publicClient && tokenAddress && isAddress(tokenAddress));
  const apiQuery = useApiQuery('deriw:address_account', {
    queryParams: { address },
    queryOptions: {
      enabled,
      placeholderData: DERIW_ACCOUNT_INFO,
      retry: retryDeriwRequest,
      refetchOnMount: false,
      refetchInterval: (query) => enabled && query.state.status === 'error' && shouldPollDeriwError(query.state.error) ? 15 * SECOND : false,
    },
  });
  const rpcQuery = useQuery({
    queryKey: [ 'RPC', 'deriw-usdt-balance', { address, tokenAddress } ],
    queryFn: async() => {
      if (!publicClient || !tokenAddress || !isAddress(tokenAddress) || !isAddress(address)) {
        throw new Error('Deriw token balance is unavailable');
      }
      const [ balance, decimals ] = await Promise.all([
        publicClient.readContract({ address: tokenAddress, abi: ERC20_ABI, functionName: 'balanceOf', args: [ address ] }),
        publicClient.readContract({ address: tokenAddress, abi: ERC20_ABI, functionName: 'decimals' }),
      ]);
      return new BigNumber(balance.toString()).shiftedBy(-decimals).toFixed();
    },
    enabled: rpcEnabled,
    retry: false,
    refetchOnMount: false,
  });

  const isPlaceholderData = enabled && (apiQuery.isPlaceholderData || (rpcEnabled && rpcQuery.isPending));
  const unavailable = apiQuery.isError && (!rpcEnabled || rpcQuery.isError);
  const apiBalance = new BigNumber(apiQuery.data?.data?.sum_account_value || 0);
  const tokenBalance = new BigNumber(rpcQuery.data || 0);
  const balance = apiBalance.plus(tokenBalance);

  return {
    balance: enabled && !unavailable && balance.isFinite() ? balance.toFixed(2) : undefined,
    isPlaceholderData,
  };
}
