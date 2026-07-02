// Pure, dependency-free helpers shared by the app and covered by unit tests
// (src/lib/utils.test.ts). Keep this module free of React and browser APIs
// beyond Date/Math so it stays trivially testable.

export const uid = () => Math.random().toString(36).slice(2, 11);
export const nowIso = () => new Date().toISOString();

// Date N days from today as YYYY-MM-DD (local-time based, matches intake UI).
export const futureDateStr = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

// Calendar days until a YYYY-MM-DD deadline: 0 = due today, negative = days
// overdue. Measured against the end of the deadline day with floor, so a
// deadline becomes overdue the moment its day has fully passed (the previous
// ceil version kept showing "today" for a deadline that ended last night).
export const daysUntil = (dateStr?: string | null) => {
  if (!dateStr) return null;
  const target = new Date(dateStr + 'T23:59:59');
  const diff = (target.getTime() - Date.now()) / 86400000;
  return Math.floor(diff);
};

// Hours elapsed since an ISO timestamp.
export const hoursIn = (iso?: string | null) => {
  if (!iso) return 0;
  return (Date.now() - new Date(iso).getTime()) / 3600000;
};

// Compact "time ago" label, localized ar/en.
export const timeSince = (iso: string | null | undefined, lang: string) => {
  if (!iso) return '—';
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return lang === 'ar' ? 'للتو' : 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return lang === 'ar' ? `${m} د.` : `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return lang === 'ar' ? `${h} س.` : `${h}h`;
  const d = Math.floor(h / 24);
  return lang === 'ar' ? `${d} ي.` : `${d}d`;
};

// Number formatters used across the UI.
export const fmt = (n: unknown, d = 0) =>
  Number((n as number) || 0).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
export const fmt2 = (n: unknown) => Number((n as number) || 0).toFixed(2);
export const fmt3 = (n: unknown) => Number((n as number) || 0).toFixed(3);

// CSV field escaping: quote and double internal quotes when the value contains
// a comma, quote, or newline — keeps Arabic names with commas in one column.
export const csvEscape = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Standard lab turnaround (working days) per material — drives the suggested
// deadline at intake. Rush cases get half the time (rounded up, min 1 day).
export const TURNAROUND_DAYS: Record<string, number> = {
  zirconia: 5, emax: 5, emaxCad: 4, veneer: 6, implant: 7,
  denture: 8, pmma: 2, acrylic: 3, ortho: 6, cadcam: 4,
};
export const turnaroundFor = (material: string, priority?: string) => {
  const base = TURNAROUND_DAYS[material] || 5;
  return priority === 'rush' ? Math.max(1, Math.ceil(base / 2)) : base;
};
