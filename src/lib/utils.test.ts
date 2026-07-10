import { describe, it, expect } from 'vitest';
import {
  uid, futureDateStr, daysUntil, hoursIn, timeSince,
  fmt, fmt2, fmt3, csvEscape, turnaroundFor, TURNAROUND_DAYS,
} from './utils';

describe('uid', () => {
  it('produces unique non-empty ids', () => {
    const ids = new Set(Array.from({ length: 500 }, () => uid()));
    expect(ids.size).toBe(500);
    ids.forEach((id) => expect(id.length).toBeGreaterThan(4));
  });
});

describe('futureDateStr / daysUntil', () => {
  it('round-trips: a date N days ahead reports N days left', () => {
    for (const n of [0, 1, 3, 7, 30]) {
      expect(daysUntil(futureDateStr(n))).toBe(n);
    }
  });
  it('is negative for past dates (overdue)', () => {
    expect(daysUntil(futureDateStr(-2))).toBe(-2);
  });
  it('returns null for missing deadline', () => {
    expect(daysUntil(null)).toBeNull();
    expect(daysUntil('')).toBeNull();
  });
  it('formats as YYYY-MM-DD', () => {
    expect(futureDateStr(5)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('hoursIn', () => {
  it('measures elapsed hours from an ISO timestamp', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600000).toISOString();
    expect(hoursIn(threeHoursAgo)).toBeCloseTo(3, 1);
  });
  it('returns 0 for missing input', () => {
    expect(hoursIn(null)).toBe(0);
  });
});

describe('timeSince', () => {
  const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
  it('buckets into now/minutes/hours/days (en)', () => {
    expect(timeSince(ago(10_000), 'en')).toBe('just now');
    expect(timeSince(ago(5 * 60_000), 'en')).toBe('5m');
    expect(timeSince(ago(3 * 3_600_000), 'en')).toBe('3h');
    expect(timeSince(ago(2 * 86_400_000), 'en')).toBe('2d');
  });
  it('localizes to Arabic', () => {
    expect(timeSince(ago(10_000), 'ar')).toBe('للتو');
    expect(timeSince(ago(5 * 60_000), 'ar')).toContain('د.');
  });
  it('handles missing input', () => {
    expect(timeSince(null, 'en')).toBe('—');
  });
});

describe('formatters', () => {
  it('fmt2/fmt3 fix decimals and tolerate junk', () => {
    expect(fmt2(1.005)).toBe('1.00');
    expect(fmt2(undefined)).toBe('0.00');
    expect(fmt3(1.5)).toBe('1.500');
    expect(fmt(1234)).toBe((1234).toLocaleString());
  });
});

describe('csvEscape', () => {
  it('passes plain values through', () => {
    expect(csvEscape('Ahmed K.')).toBe('Ahmed K.');
    expect(csvEscape(42)).toBe('42');
  });
  it('quotes commas, quotes, and newlines', () => {
    expect(csvEscape('Salem, Clinic')).toBe('"Salem, Clinic"');
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""');
    expect(csvEscape('a\nb')).toBe('"a\nb"');
  });
  it('empties null/undefined', () => {
    expect(csvEscape(null)).toBe('');
    expect(csvEscape(undefined)).toBe('');
  });
});

describe('turnaroundFor', () => {
  it('uses the per-material table', () => {
    expect(turnaroundFor('zirconia')).toBe(TURNAROUND_DAYS.zirconia);
    expect(turnaroundFor('denture')).toBe(8);
  });
  it('halves (rounded up) for rush', () => {
    expect(turnaroundFor('zirconia', 'rush')).toBe(3);
    expect(turnaroundFor('implant', 'rush')).toBe(4);
    expect(turnaroundFor('pmma', 'rush')).toBe(1);
  });
  it('defaults unknown materials to 5 days', () => {
    expect(turnaroundFor('unknown-material')).toBe(5);
  });
});
