import React from 'react';

import { test, expect } from 'playwright/lib';

import TxDetailsDeriwStory from './testUtils/TxDetailsDeriwStory';

const data = { hash: '0x' + '1'.repeat(64), method: 'Multicall' };

test('shows all Deriw trades and collapses them again +@mobile', async({ render, mockEnvs, page }) => {
  await mockEnvs([ [ 'NEXT_PUBLIC_DERIW_API_HOST', 'http://localhost:3020' ] ]);
  await page.route('**/client/transaction/status?**', route => route.fulfill({ json: { data: { list: [
    { coin_name: 'BTC', is_long: true, size: '2', order_type: 'market' },
    { coin_name: 'ETH', is_long: false, size: '3', order_type: 'limit' },
  ] } } }));
  const component = await render(<TxDetailsDeriwStory data={ data } isLoading={ false }/>);

  await expect(component.getByText('Long BTC')).toBeVisible();
  await expect(component.getByText('Short ETH')).toHaveCount(0);
  await component.getByRole('button', { name: 'Show all 2 transactions' }).click();
  await expect(component.getByText('Short ETH')).toBeVisible();
  await expect(component.getByText('Limit', { exact: true })).toBeVisible();
  await component.getByRole('button', { name: 'Show only first transaction' }).click();
  await expect(component.getByText('Short ETH')).toHaveCount(0);
});

for (const status of [ 500, 503 ]) {
  test(`does not keep retrying HTTP ${ status }`, async({ render, mockEnvs, page }) => {
    await page.clock.install();
    await mockEnvs([ [ 'NEXT_PUBLIC_DERIW_API_HOST', 'http://localhost:3020' ] ]);
    let requests = 0;
    await page.route('**/client/transaction/status?**', route => {
      requests++;
      return route.fulfill({ status, json: { error: 'unavailable' } });
    });
    await render(<TxDetailsDeriwStory data={ data } isLoading={ false }/>);
    await expect.poll(() => requests).toBe(1);
    await page.clock.runFor(46_000);
    expect(requests).toBe(1);
  });
}

test('makes no custom API request when the integration is unset', async({ render, mockEnvs, page }) => {
  await mockEnvs([ [ 'NEXT_PUBLIC_DERIW_API_HOST', '' ] ]);
  let requests = 0;
  await page.route('**/client/transaction/status?**', route => {
    requests++;
    return route.fulfill({ json: { data: { list: [] } } });
  });
  const component = await render(<TxDetailsDeriwStory data={ data } isLoading={ false }/>);
  await expect(component.getByText('Action', { exact: true })).toHaveCount(0);
  expect(requests).toBe(0);
});

for (const data of [ null, {} ]) {
  test(`keeps the page usable for an empty trade payload ${ JSON.stringify(data) }`, async({ render, mockEnvs, page }) => {
    await mockEnvs([ [ 'NEXT_PUBLIC_DERIW_API_HOST', 'http://localhost:3020' ] ]);
    const errors: Array<string> = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/client/transaction/status?**', route => route.fulfill({ json: { data } }));
    const response = page.waitForResponse(url => url.url().includes('/client/transaction/status?'));
    const component = await render(<TxDetailsDeriwStory data={{ hash: '0x' + '1'.repeat(64), method: 'Multicall' }} isLoading={ false }/>);
    await response;
    await expect(component.getByText('Action', { exact: true })).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
