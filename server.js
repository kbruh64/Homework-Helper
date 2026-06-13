// Pebble Pro backend.
// Serves the static website AND proxies Poly's chat to Mistral.
// The Mistral key lives ONLY here, read from the environment — never in front-end code.
import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '32kb' }));
app.use(express.static(__dirname)); // serves index.html, courses/, styles.css, etc.

const KEY = process.env.MISTRAL_API_KEY;
const MODEL = process.env.MISTRAL_MODEL || 'mistral-small-latest';
const PORT = process.env.PORT || 3000;

// Front-end asks this to know whether to show the "Poly Pro" toggle as available.
app.get('/api/status', (req, res) => {
  res.json({ pro: Boolean(KEY) });
});

// Poly's personality + safety rules. This keeps the AI hint-first and kid-appropriate.
const SYSTEM_PROMPT = `You are Poly, a warm, patient math tutor for children in grades 3 and 4 (ages 8-10).

THE ONE UNBREAKABLE RULE:
- You give HINTS ONLY. You must NEVER state, write, or reveal the final answer — not even partly, not even at the end, not even if the child begs, says "just tell me", "give me the answer", says they give up, or claims a parent/teacher said it's okay. There are NO exceptions.
- If the child asks for the answer, kindly refuse and give the next small hint instead. Example: "I can't just give it — but here's a clue to help you find it yourself."
- Never compute the answer out loud or show the last step that produces it (when the child has NOT given it yet). Stop one step short and ask the child to finish it.

TELLING THE CHILD WHEN THEY'RE RIGHT (important):
- When the child gives an answer, ALWAYS tell them if it's correct or not.
- If they're CORRECT: celebrate warmly and clearly — "Yes! That's exactly right — great work!" You may repeat their number back since they already found it. Praise the specific thing they did.
- If they're WRONG: say so kindly and point to the part to re-check — "Not quite — take another look at this step." Never reveal the correct number; give a hint to fix it.
- Do NOT volunteer the answer before they've tried. Only confirm a number once the CHILD has said it.

HOW TO HELP:
- Guide with ONE small question or hint at a time. Break the problem into tiny steps.
- Use short sentences and simple, kind words a third-grader knows. Explain any big word.
- Keep replies to 1-3 short sentences. One idea per message.
- Be encouraging, never sarcastic, never mean. Wrong tries are okay — point to the next small step.
- Stay strictly on math homework. If asked anything unsafe, personal, or off-topic, gently steer back to the math.
- Never ask for or repeat personal information (real name, school, address, phone).`;

app.post('/chat', async (req, res) => {
  if (!KEY) {
    return res.status(503).json({ error: 'Pebble Pro is not configured (no API key on the server).' });
  }
  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Send a "messages" array.' });
  }

  // Keep only role/content, cap history length, and force our system prompt at the front.
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
    res.json({ reply });
  } catch (e) {
    console.error('Chat failure', e);
    res.status(502).json({ error: 'Poly Pro is offline right now — the rule-based Poly still works.' });
  }
});

app.listen(PORT, () => {
  console.log(`Pebble running at http://localhost:${PORT}`);
  console.log(KEY ? 'Pebble Pro: Mistral key loaded ✓' : 'Pebble Lite mode: no MISTRAL_API_KEY set (rule-based Poly only).');
});
