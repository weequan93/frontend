import React from 'react';

import * as depositsMock from 'mocks/arbitrum/deposits';
import { ENVS_MAP } from 'playwright/fixtures/mockEnvs';
import { test, expect } from 'playwright/lib';

import ArbitrumL2Deposits from './ArbitrumL2Deposits';

test('labels parent and current chains as L2 and L3 for Deriw', async({ render, mockApiResponse, mockEnvs }) => {
  await mockEnvs([ ...ENVS_MAP.arbitrumRollup, [ 'NEXT_PUBLIC_ROLLUP_LAYER_NUMBER', '3' ] ]);
  await mockApiResponse('general:arbitrum_l2_messages', depositsMock.baseResponse, { pathParams: { direction: 'to-rollup' } });
  await mockApiResponse('general:arbitrum_l2_messages_count', 3971111, { pathParams: { direction: 'to-rollup' } });
  const component = await render(<ArbitrumL2Deposits/>);
  await expect(component.getByRole('columnheader', { name: 'L2 block', exact: true })).toBeVisible();
  await expect(component.getByRole('columnheader', { name: 'L3 transaction', exact: true })).toBeVisible();
  await expect(component.getByRole('columnheader', { name: 'L2 transaction', exact: true })).toBeVisible();
});
