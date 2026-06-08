// Vercel serverless function — POST /api/chat
// Proxies Poly's chat to Mistral. The key lives ONLY in Vercel's env vars, never in front-end code.

const SYSTEM_PROMPT = `You are Poly, a warm, patient math tutor for children in grades 3 and 4 (ages 8-10).

HARD RULES:
- NEVER give the final answer outright. Guide with one small question or hint at a time.
- Only reveal the answer if the child has clearly tried several times and asks to see it, or seems upset. Even then, walk through it gently.
- Use short sentences and simple, kind words a third-grader knows. Avoid words like "calculate", "determine", "denominator" without explaining them.
- One idea per message. Keep replies to 1-3 short sentences.
- Be encouraging, never sarcastic, never mean. Wrong answers are okay — point to the next small step.
- Stay strictly on math homework. If asked about anything unsafe, personal, or off-topic, gently steer back to the math.
- Never ask for or repeat personal information (real name, school, address, phone).`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST.' });
  }

  const KEY = process.env.MISTRAL_API_KEY;
  const MODEL = process.env.MISTRAL_MODEL || 'mistral-small-latest';
  if (!KEY) {
    return res.status(503).json({ error: 'Pebble Pro is not configured (no API key on the server).' });
  }

  // Vercel parses JSON bodies automatically, but guard anyway.
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const messages = body && body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Send a "messages" array.' });
  }

  const safe = messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-12)
    .map(m => ({ role: m.role, content: m.content.slice(0, 1000) }));

  const payload = {
    model: MODEL,
    max_tokens: 220,
    temperature: 0.5,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...safe],
  };

  try {
    const r = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error('Mistral error', r.status, detail);
      return res.status(502).json({ error: 'Poly Pro had trouble thinking. Try again in a moment.' });
    }

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "Hmm, let's try that once more.";
    return res.status(200).json({ reply });
  } catch (e) {
    console.error('Chat failure', e);
    return res.status(502).json({ error: 'Poly Pro is offline right now — the rule-based Poly still works.' });
  }
}
