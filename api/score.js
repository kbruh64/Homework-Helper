// Vercel serverless function — POST /api/score  { subject, name, score }
// Records a speed score into the subject's leaderboard (keeps each player's BEST).
import { kvCmd, kvConfigured } from './_kv.js';

// Lightweight name safety (mirror of the client filter)
const BAD = ['fuck','shit','bitch','asshole','dick','piss','crap','bastard','damn','cunt','slut','whore','fag','retard','nigger','nigga','sex','porn','rape','kill','nazi','penis','vagina'];
function cleanName(raw) {
  let n = String(raw || '').trim().slice(0, 20);
  if (!n) return 'Player';
  const low = n.toLowerCase().replace(/[\s._'-]/g, '');
  if (BAD.some(w => low.includes(w))) return 'Player';
  if (!/^[\p{L}\p{N} _.'-]+$/u.test(n)) return 'Player';
  return n;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const subject = String((body && body.subject) || '').replace(/[^a-z0-9-]/gi, '').slice(0, 40);
  const name = cleanName(body && body.name);
  const score = Math.max(0, Math.min(9999, Math.floor(Number(body && body.score) || 0)));
  if (!subject) return res.status(400).json({ error: 'subject required' });

  if (!kvConfigured()) return res.status(200).json({ configured: false });

  try {
    const key = `lb:${subject}`;
    const member = JSON.stringify({ n: name }); // unique-ish per name
    // Keep the player's BEST: only update if new score is higher
    const cur = await kvCmd(['ZSCORE', key, member]);
    const prev = cur && cur.result != null ? Number(cur.result) : -1;
    if (score > prev) {
      await kvCmd(['ZADD', key, String(score), member]);
      // trim to top 50 to bound storage
      await kvCmd(['ZREMRANGEBYRANK', key, '0', '-51']);
    }
    return res.status(200).json({ configured: true, best: Math.max(score, prev) });
  } catch (e) {
    console.error('score post', e);
    return res.status(200).json({ configured: true });
  }
}
