// Netlify serverless function: AI proxy so the API key never reaches the browser.
//
// Provider is chosen by which environment variable is set (set ONE in the
// Netlify site settings):
//   GROQ_API_KEY       -> Groq (free, fast).        Optional GROQ_MODEL.
//   GEMINI_API_KEY     -> Google Gemini (free tier). Optional GEMINI_MODEL.
//   ANTHROPIC_API_KEY  -> Anthropic Claude (paid).   Optional CLAUDE_MODEL.
// If none is set, the client falls back to its offline local search engine.
//
// Frontend calls POST /.netlify/functions/claude with:
//   { messages: [{ role: 'user'|'assistant', content: string }], labContext: string }
// and receives { reply: string } on success.

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-opus-4-8';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const buildSystem = (labContext?: string) =>
  'You are the AI assistant embedded in "Evora Dental", a dental-lab management ' +
  'system. Answer questions about the lab\'s cases, inventory, technicians, ' +
  'production flow, and finances using the live snapshot below. Be concise and ' +
  'practical; reply in the same language the user writes in (Arabic or English). ' +
  'If the snapshot does not contain the answer, say so briefly.\n\n' +
  'LAB SNAPSHOT:\n' + (labContext || '(no data provided)');

// --- Google Gemini (free tier) ---
async function askGemini(apiKey: string, messages: Array<{ role: string; content: string }>, system: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { maxOutputTokens: 1024, temperature: 0.4 },
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    return { ok: false as const, status: res.status, detail };
  }
  const data: any = await res.json();
  const reply = (data?.candidates?.[0]?.content?.parts || [])
    .map((p: any) => p.text || '').join('').trim();
  return { ok: true as const, reply };
}

// --- Groq (free, OpenAI-compatible) ---
async function askGroq(apiKey: string, messages: Array<{ role: string; content: string }>, system: string) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'system', content: system }, ...messages],
      max_tokens: 1024,
      temperature: 0.4,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    return { ok: false as const, status: res.status, detail };
  }
  const data: any = await res.json();
  const reply = (data?.choices?.[0]?.message?.content || '').trim();
  return { ok: true as const, reply };
}

// --- Anthropic Claude (paid) ---
async function askClaude(apiKey: string, messages: Array<{ role: string; content: string }>, system: string) {
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 1024, system, messages }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    return { ok: false as const, status: res.status, detail };
  }
  const data: any = await res.json();
  if (data.stop_reason === 'refusal') return { ok: true as const, reply: 'I can’t help with that request.' };
  const reply = Array.isArray(data.content)
    ? data.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n').trim()
    : '';
  return { ok: true as const, reply };
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!groqKey && !geminiKey && !anthropicKey) {
    // No provider configured — client should use its offline fallback.
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
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content }));
  if (messages.length === 0) return json(400, { error: 'No messages' });

  const system = buildSystem(payload.labContext);

  try {
    // Prefer the free providers when their keys are present (Groq, then Gemini).
    const result = groqKey
      ? await askGroq(groqKey, messages, system)
      : geminiKey
      ? await askGemini(geminiKey, messages, system)
      : await askClaude(anthropicKey as string, messages, system);

    if (!result.ok) {
      return json(502, { error: 'Upstream error', status: result.status, detail: result.detail, fallback: true });
    }
    return json(200, { reply: result.reply || '(empty response)' });
  } catch (err: any) {
    return json(502, { error: 'Request failed', detail: String(err?.message || err), fallback: true });
  }
};
