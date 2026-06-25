// Netlify serverless function: proxies chat requests to the Anthropic Messages
// API so the API key never reaches the browser. Set ANTHROPIC_API_KEY (and
// optionally CLAUDE_MODEL) in the Netlify site environment variables.
//
// The frontend calls POST /.netlify/functions/claude with:
//   { messages: [{ role: 'user'|'assistant', content: string }], labContext: string }
// and receives { reply: string } on success.

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-4-8';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // No key configured — tell the client to use its offline fallback.
    return json(503, { error: 'AI not configured', fallback: true });
  }

  let payload: { messages?: Array<{ role: string; content: string }>; labContext?: string };
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }

  const history = Array.isArray(payload.messages) ? payload.messages : [];
  const messages = history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-20) // cap history sent upstream
    .map((m) => ({ role: m.role, content: m.content }));

  if (messages.length === 0) return json(400, { error: 'No messages' });

  const system =
    'You are the AI assistant embedded in "Lumen Dental", a dental-lab management ' +
    'system. Answer questions about the lab\'s cases, inventory, technicians, ' +
    'production flow, and finances using the live snapshot below. Be concise and ' +
    'practical; reply in the same language the user writes in (Arabic or English). ' +
    'If the snapshot does not contain the answer, say so briefly.\n\n' +
    'LAB SNAPSHOT:\n' + (payload.labContext || '(no data provided)');

  try {
    const upstream = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 1024, system, messages }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      return json(502, { error: 'Upstream error', status: upstream.status, detail, fallback: true });
    }

    const data: any = await upstream.json();
    if (data.stop_reason === 'refusal') {
      return json(200, { reply: 'I can’t help with that request.' });
    }
    const reply = Array.isArray(data.content)
      ? data.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n').trim()
      : '';
    return json(200, { reply: reply || '(empty response)' });
  } catch (err: any) {
    return json(502, { error: 'Request failed', detail: String(err?.message || err), fallback: true });
  }
};
