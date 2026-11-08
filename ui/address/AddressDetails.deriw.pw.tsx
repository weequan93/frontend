import React from 'react';

import * as addressMock from 'mocks/address/address';
import * as countersMock from 'mocks/address/counters';
import { test, expect } from 'playwright/lib';

import AddressDetails from './AddressDetails';
import type { AddressCountersQuery } from './utils/useAddressCountersQuery';
import type { AddressQuery } from './utils/useAddressQuery';

const hooksConfig = { router: { query: { hash: addressMock.hash } } };

test('adds the configured token balance to Deriw account value +@mobile', async({ render, page, mockEnvs, mockApiResponse }) => {
  await mockEnvs([
    [ 'NEXT_PUBLIC_DERIW_API_HOST', 'http://localhost:3020' ],
    [ 'NEXT_PUBLIC_DERIW_USDT_ADDRESS', '0x' + '1'.repeat(40) ],
  ]);
  await mockApiResponse('general:address', addressMock.contract, { pathParams: { hash: addressMock.hash } });
  await page.route('**/client/account/info?**', route => route.fulfill({
    json: { data: { address: addressMock.hash, position_value: '40.25', pending_order_book_value: '0', sum_account_value: '40.25' } },
  }));
  await page.route('https://localhost:1111', route => {
    const payload = route.request().postDataJSON();
    const value = payload.params?.[0]?.data?.startsWith('0x70a08231') ? 2250000 : 6;
    return route.fulfill({ json: { id: payload.id, jsonrpc: '2.0', result: '0x' + value.toString(16).padStart(64, '0') } });
  });
  const component = await render(
    <AddressDetails
      addressQuery={{ data: addressMock.contract } as AddressQuery}
      countersQuery={{ data: countersMock.forContract } as AddressCountersQuery}
    />,
    { hooksConfig },
  );
  await expect(component.getByText('Account Value', { exact: true })).toBeVisible();
  await expect(component.getByText('$42.50', { exact: true })).toBeVisible();
});

test('omits custom account value when the integration is unset', async({ render, mockEnvs, mockApiResponse }) => {
  await mockEnvs([ [ 'NEXT_PUBLIC_DERIW_API_HOST', '' ] ]);
  await mockApiResponse('general:address', addressMock.contract, { pathParams: { hash: addressMock.hash } });
  const component = await render(
    <AddressDetails
      addressQuery={{ data: addressMock.contract } as AddressQuery}
      countersQuery={{ data: countersMock.forContract } as AddressCountersQuery}
    />,
    { hooksConfig },
  );
  await expect(component.getByText('Account Value', { exact: true })).toHaveCount(0);
});
