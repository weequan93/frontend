import { afterEach, describe, expect, test, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('Deriw and backend v10 API routing', () => {
  test('routes custom account and trade requests to the separate API', async() => {
    vi.stubEnv('NEXT_PUBLIC_DERIW_API_HOST', 'https://deriw.example');
    vi.stubEnv('NEXT_PUBLIC_DERIW_API_BASE_PATH', '/api/');
    vi.resetModules();
    const { 'default': buildUrl } = await import('./buildUrl');
    expect(buildUrl('deriw:address_account', undefined, { address: '0x123' })).toBe('https://deriw.example/api/client/account/info?address=0x123');
    expect(buildUrl('deriw:tx_state', undefined, { tx_hash: '0x456', type: 'Multicall' }))
      .toBe('https://deriw.example/api/client/transaction/status?tx_hash=0x456&type=Multicall');
    expect(buildUrl('general:arbitrum_l2_messages', { direction: 'to-rollup' })).toBe('https://localhost:3003/api/v2/arbitrum/messages/to-rollup');
  });

  test('uses native L3 labels with a configured parent explorer', async() => {
    vi.stubEnv('NEXT_PUBLIC_ROLLUP_TYPE', 'arbitrum');
    vi.stubEnv('NEXT_PUBLIC_ROLLUP_LAYER_NUMBER', '3');
    vi.stubEnv('NEXT_PUBLIC_ROLLUP_PARENT_CHAIN', JSON.stringify({ name: 'Parent', baseUrl: 'https://parent.example' }));
    vi.resetModules();
    const { layerLabels } = await import('lib/rollups/utils');
    expect(layerLabels).toEqual({ current: 'L3', parent: 'L2' });
    const { 'default': rollup } = await import('configs/app/features/rollup');
    const { PAGE_TYPE_DICT } = await import('lib/mixpanel/getPageType');
    expect(rollup.title).toBe('Rollup (L3) chain');
    expect(PAGE_TYPE_DICT['/batches/[number]']).toBe('L3 txn batch details');
  });

  test('validates the optional custom API fields and rejects a malformed token address', async() => {
    const { 'default': schema } = await import('../../deploy/tools/envs-validator/schemas/apis');
    expect(schema.isValidSync({
      NEXT_PUBLIC_API_HOST: 'localhost',
      NEXT_PUBLIC_DERIW_API_HOST: 'https://deriw.example',
      NEXT_PUBLIC_DERIW_USDT_ADDRESS: '0x' + '1'.repeat(40),
    })).toBe(true);
    expect(schema.isValidSync({ NEXT_PUBLIC_API_HOST: 'localhost', NEXT_PUBLIC_DERIW_USDT_ADDRESS: 'invalid' })).toBe(false);
  });
});
