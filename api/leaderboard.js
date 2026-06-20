// GET /api/leaderboard?subject=<slug> — top scores from Redis.
import { lbTop, kvConfigured } from './_kv.js';

export default async function handler(req, res) {
  const subject = String((req.query && req.query.subject) || '').replace(/[^a-z0-9-]/gi, '').slice(0, 40);
  if (!subject) return res.status(400).json({ error: 'subject required' });
  if (!kvConfigured()) return res.status(200).json({ configured: false, scores: [] });
  try {
    const scores = await lbTop(subject, 10);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ configured: true, scores });
  } catch (e) {
    console.error('leaderboard get', e);
    return res.status(200).json({ configured: true, scores: [] });
  }
}
