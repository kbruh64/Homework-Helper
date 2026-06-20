// Vercel serverless function — GET /api/leaderboard?subject=<slug>
// Returns the top scores for a subject from Upstash Redis (sorted set).
// If no KV is configured, returns { configured:false } so the client falls back to localStorage.
import { kvCmd, kvConfigured } from './_kv.js';

export default async function handler(req, res) {
  const subject = String((req.query && req.query.subject) || '').replace(/[^a-z0-9-]/gi, '').slice(0, 40);
  if (!subject) return res.status(400).json({ error: 'subject required' });

  if (!kvConfigured()) return res.status(200).json({ configured: false, scores: [] });

  try {
    const key = `lb:${subject}`;
    // top 10, highest first, with scores
    const raw = await kvCmd(['ZREVRANGE', key, '0', '9', 'WITHSCORES']);
    const arr = (raw && raw.result) || [];
    const scores = [];
    for (let i = 0; i < arr.length; i += 2) {
      let name = arr[i];
      try { name = JSON.parse(arr[i]).n || arr[i]; } catch {}
      scores.push({ name, score: Number(arr[i + 1]) });
    }
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ configured: true, scores });
  } catch (e) {
    console.error('leaderboard get', e);
    return res.status(200).json({ configured: true, scores: [] });
  }
}
