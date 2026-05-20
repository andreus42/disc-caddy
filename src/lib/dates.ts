/** Date utilities used by the Scorecards history list (spec §5.7). */

const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];

/** "MAY 19, 2026" — uppercase. */
export function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** "9:30 AM" — 12-hour clock without seconds. */
export function formatTimeOfDay(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const min = d.getMinutes();
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = min.toString().padStart(2, '0');
  return `${h12}:${mm} ${period}`;
}

/**
 * Group records by local calendar day, preserving the input order within
 * each group (history is already newest-first, so groups end up newest-day
 * first, with newest-of-day at the top of each).
 */
export function groupByDay<T extends { date: string }>(
  records: T[],
): Array<{ key: string; label: string; items: T[] }> {
  const map = new Map<string, T[]>();
  for (const r of records) {
    const d = new Date(r.date);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const arr = map.get(key) ?? [];
    arr.push(r);
    map.set(key, arr);
  }
  return Array.from(map.entries()).map(([key, items]) => ({
    key,
    label: formatDateLabel(items[0].date),
    items,
  }));
}
