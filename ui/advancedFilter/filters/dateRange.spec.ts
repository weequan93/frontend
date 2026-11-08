import dayjs from 'lib/date/dayjs';
import { describe, expect, test } from 'vitest';

import clampDateRange from './dateRange';

describe('Deriw custom date range', () => {
  test('limits the end date when the start changes', () => {
    expect(clampDateRange('2026-01-01', '2026-05-01', 31)).toEqual({ from: '2026-01-01', to: '2026-02-01' });
  });

  test('limits the start date when the end changes', () => {
    expect(clampDateRange('2026-01-01', '2026-05-01', 31, 'to')).toEqual({ from: '2026-03-31', to: '2026-05-01' });
  });

  test('normalizes reversed dates according to the edited side', () => {
    expect(clampDateRange('2026-05-01', '2026-01-01', 31)).toEqual({ from: '2026-05-01', to: '2026-05-01' });
    expect(clampDateRange('2026-05-01', '2026-01-01', 31, 'to')).toEqual({ from: '2026-01-01', to: '2026-01-01' });
  });

  test('retains an exact 31-day interval and narrower selections', () => {
    const exact = { from: '2026-01-01', to: '2026-02-01' };
    expect(clampDateRange(exact.from, exact.to, 31)).toEqual(exact);
    expect(clampDateRange('2026-01-01', '2026-01-02', 31)).toEqual({ from: '2026-01-01', to: '2026-01-02' });
  });

  test('preserves upstream filters that have no custom maximum', () => {
    expect(clampDateRange('2026-01-01', '2026-05-01')).toEqual({ from: '2026-01-01', to: '2026-05-01' });
    expect(clampDateRange('', '2026-05-01', 31)).toEqual({ from: '', to: '2026-05-01' });
  });

  test('keeps calendar-day bounds across a daylight-saving transition', () => {
    const range = clampDateRange('2026-03-01', '2026-05-01', 31);
    expect(dayjs(range.to).diff(dayjs(range.from), 'day')).toBe(31);
  });
});
