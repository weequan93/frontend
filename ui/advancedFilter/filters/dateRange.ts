import dayjs from 'lib/date/dayjs';

export default function clampDateRange(from: string, to: string, maximumDays?: number, changed: 'from' | 'to' = 'from') {
  if (!from || !to || maximumDays === undefined) {
    return { from, to };
  }
  const start = dayjs(from).startOf('day');
  const end = dayjs(to).startOf('day');
  if (!start.isValid() || !end.isValid()) {
    return { from, to };
  }
  if (end.isBefore(start)) {
    return changed === 'from' ? { from, to: from } : { from: to, to };
  }
  if (end.diff(start, 'day') > maximumDays) {
    return changed === 'from' ? { from, to: start.add(maximumDays, 'day').format('YYYY-MM-DD') } :
      { from: end.subtract(maximumDays, 'day').format('YYYY-MM-DD'), to };
  }
  return { from, to };
}
