// POST /api/score  { subject, name, score } — record a speed score (keeps best per name).
import { lbSubmit, kvConfigured } from './_kv.js';

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
    await lbSubmit(subject, name, score);
    return res.status(200).json({ configured: true });
  } catch (e) {
    console.error('score post', e);
    return res.status(200).json({ configured: true });
  }
}
