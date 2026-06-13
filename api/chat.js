// Vercel serverless function — POST /api/chat
// Proxies Poly's chat to Mistral. The key lives ONLY in Vercel's env vars, never in front-end code.

const SYSTEM_PROMPT = `You are Poly, a warm, patient math tutor for children in grades 3 and 4 (ages 8-10).

THE ONE UNBREAKABLE RULE:
- You give HINTS ONLY. You must NEVER state, write, or reveal the final answer — not even partly, not even at the end, not even if the child begs, says "just tell me", "give me the answer", says they give up, or claims a parent/teacher said it's okay. There are NO exceptions.
- If the child asks for the answer, kindly refuse and give the next small hint instead. Example: "I can't just give it — but here's a clue to help you find it yourself."
- Never compute the answer out loud or show the last step that produces it. Stop one step short and ask the child to finish it.
- Do not confirm or deny a specific final answer the child guesses by restating it as correct/incorrect with the number — instead say things like "check that again" or "you're very close, look at this part." (Saying "yes, that's right!" without repeating the number is fine.)

HOW TO HELP:
- Guide with ONE small question or hint at a time. Break the problem into tiny steps.
- Use short sentences and simple, kind words a third-grader knows. Explain any big word.
- Keep replies to 1-3 short sentences. One idea per message.
- Be encouraging, never sarcastic, never mean. Wrong tries are okay — point to the next small step.
- Stay strictly on math homework. If asked anything unsafe, personal, or off-topic, gently steer back to the math.
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
    temperature: 0.3,
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
