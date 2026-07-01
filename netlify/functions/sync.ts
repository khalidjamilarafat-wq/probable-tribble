// Netlify serverless function: cloud sync for lab data using Netlify Blobs.
//
// The lab creates an account with a lab code + PIN. Devices connect with the
// same pair and push/pull the whole app state (last-write-wins by updatedAt).
// The PIN is never stored in plain text — only a salted SHA-256 hash.
//
// Actions (POST JSON):
//   { action: 'connect', labId, pin }            -> creates the lab if new, else
//                                                    verifies the PIN and returns
//                                                    { state, updatedAt }
//   { action: 'push', labId, pin, state }        -> stores state, returns { updatedAt }
//   { action: 'pull', labId, pin }               -> returns { state, updatedAt }

import { getStore } from '@netlify/blobs';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const normalizeLabId = (v: unknown) =>
  String(v || '').trim().toLowerCase().replace(/[^a-z0-9-_]/g, '').slice(0, 40);

async function hashPin(labId: string, pin: string): Promise<string> {
  const data = new TextEncoder().encode(`evora:${labId}:${pin}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

type LabRecord = { pinHash: string; state: unknown; updatedAt: number };

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  let body: { action?: string; labId?: string; pin?: string; state?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }

  const labId = normalizeLabId(body.labId);
  const pin = String(body.pin || '');
  const action = body.action;
  if (!labId || labId.length < 3) return json(400, { error: 'Lab code must be at least 3 characters' });
  if (pin.length < 4) return json(400, { error: 'PIN must be at least 4 characters' });

  let store;
  try {
    store = getStore('labs');
  } catch (err: any) {
    return json(503, { error: 'Cloud storage unavailable', detail: String(err?.message || err) });
  }

  try {
    const pinHash = await hashPin(labId, pin);
    const rec = (await store.get(labId, { type: 'json' })) as LabRecord | null;

    if (action === 'connect') {
      if (!rec) {
        await store.setJSON(labId, { pinHash, state: null, updatedAt: 0 });
        return json(200, { created: true, state: null, updatedAt: 0 });
      }
      if (rec.pinHash !== pinHash) return json(403, { error: 'Wrong PIN for this lab code' });
      return json(200, { created: false, state: rec.state, updatedAt: rec.updatedAt || 0 });
    }

    if (!rec) return json(404, { error: 'Lab not found — connect first' });
    if (rec.pinHash !== pinHash) return json(403, { error: 'Wrong PIN' });

    if (action === 'push') {
      const updatedAt = Date.now();
      await store.setJSON(labId, { pinHash: rec.pinHash, state: body.state ?? null, updatedAt });
      return json(200, { updatedAt });
    }

    if (action === 'pull') {
      return json(200, { state: rec.state, updatedAt: rec.updatedAt || 0 });
    }

    return json(400, { error: 'Unknown action' });
  } catch (err: any) {
    return json(500, { error: 'Sync failed', detail: String(err?.message || err) });
  }
};
