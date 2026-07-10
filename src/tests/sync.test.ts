// Tests for the cloud-sync Netlify function with an in-memory blob store.
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mem = new Map<string, unknown>();
vi.mock('@netlify/blobs', () => ({
  getStore: () => ({
    get: async (key: string) => (mem.has(key) ? mem.get(key) : null),
    setJSON: async (key: string, value: unknown) => { mem.set(key, value); },
  }),
}));

import handler, { normalizeLabId, hashPin } from '../../netlify/functions/sync';

const call = (body: unknown, method = 'POST') =>
  handler(new Request('http://test/.netlify/functions/sync', {
    method,
    headers: { 'content-type': 'application/json' },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  }));

const jsonOf = async (res: Response) => ({ status: res.status, body: await res.json() });

beforeEach(() => mem.clear());

describe('normalizeLabId', () => {
  it('lowercases and strips unsafe characters', () => {
    expect(normalizeLabId(' Evora Lab 01! ')).toBe('evoralab01');
    expect(normalizeLabId('evora-lab_01')).toBe('evora-lab_01');
  });
  it('caps length at 40', () => {
    expect(normalizeLabId('x'.repeat(100))).toHaveLength(40);
  });
});

describe('hashPin', () => {
  it('is deterministic and lab-scoped', async () => {
    const a = await hashPin('lab1', '1234');
    expect(a).toBe(await hashPin('lab1', '1234'));
    expect(a).not.toBe(await hashPin('lab2', '1234'));
    expect(a).not.toBe(await hashPin('lab1', '9999'));
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('sync handler', () => {
  it('rejects non-POST and bad input', async () => {
    expect((await call(null, 'GET')).status).toBe(405);
    expect((await call({ action: 'connect', labId: 'ab', pin: '1234' })).status).toBe(400); // short lab code
    expect((await call({ action: 'connect', labId: 'evora', pin: '12' })).status).toBe(400); // short pin
  });

  it('connect creates a new lab, then reconnects with the same pin', async () => {
    const created = await jsonOf(await call({ action: 'connect', labId: 'evora-1', pin: '1234' }));
    expect(created.status).toBe(200);
    expect(created.body.created).toBe(true);

    const again = await jsonOf(await call({ action: 'connect', labId: 'evora-1', pin: '1234' }));
    expect(again.status).toBe(200);
    expect(again.body.created).toBe(false);
  });

  it('rejects a wrong pin on an existing lab', async () => {
    await call({ action: 'connect', labId: 'evora-1', pin: '1234' });
    const wrong = await call({ action: 'connect', labId: 'evora-1', pin: '9999' });
    expect(wrong.status).toBe(403);
  });

  it('push then pull round-trips the state with a monotonic updatedAt', async () => {
    await call({ action: 'connect', labId: 'evora-1', pin: '1234' });
    const state = { cases: [{ caseId: 'C-001', patient: 'Ahmed, K.' }], inventory: [] };

    const pushed = await jsonOf(await call({ action: 'push', labId: 'evora-1', pin: '1234', state }));
    expect(pushed.status).toBe(200);
    expect(pushed.body.updatedAt).toBeGreaterThan(0);

    const pulled = await jsonOf(await call({ action: 'pull', labId: 'evora-1', pin: '1234' }));
    expect(pulled.status).toBe(200);
    expect(pulled.body.state).toEqual(state);
    expect(pulled.body.updatedAt).toBe(pushed.body.updatedAt);
  });

  it('push/pull on an unknown lab returns 404; wrong pin returns 403', async () => {
    expect((await call({ action: 'push', labId: 'ghost-lab', pin: '1234', state: {} })).status).toBe(404);
    await call({ action: 'connect', labId: 'evora-1', pin: '1234' });
    expect((await call({ action: 'pull', labId: 'evora-1', pin: '0000' })).status).toBe(403);
  });

  it('normalizes lab ids so "Evora-1" and "evora-1" are the same lab', async () => {
    await call({ action: 'connect', labId: 'Evora-1', pin: '1234' });
    const pulled = await call({ action: 'pull', labId: 'evora-1', pin: '1234' });
    expect(pulled.status).toBe(200);
  });
});
