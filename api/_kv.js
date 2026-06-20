// Redis helper using the node-redis client (works with Vercel Marketplace Redis,
// which provides a redis:// connection URL). Also accepts Upstash REST-style vars.
import { createClient } from 'redis';

const REDIS_URL =
  process.env.REDIS_URL ||
  process.env.KV_URL ||
  process.env.KV_REST_API_REDIS_URL ||   // marketplace sometimes uses this name
  process.env.UPSTASH_REDIS_URL;

export function kvConfigured() {
  return Boolean(REDIS_URL);
}

let client = null;
async function getClient() {
  if (!REDIS_URL) return null;
  if (client && client.isOpen) return client;
  client = createClient({ url: REDIS_URL, socket: { reconnectStrategy: false } });
  client.on('error', () => {}); // swallow; callers handle failures
  if (!client.isOpen) await client.connect();
  return client;
}

// Leaderboard ops — return plain values the API functions expect.
export async function lbTop(subject, n = 10) {
  const c = await getClient();
  if (!c) return [];
  const key = `lb:${subject}`;
  // node-redis v4: zRangeWithScores + REV
  const rows = await c.zRangeWithScores(key, 0, n - 1, { REV: true });
  return rows.map(r => {
    let name = r.value;
    try { name = JSON.parse(r.value).n || r.value; } catch {}
    return { name, score: Number(r.score) };
  });
}

export async function lbSubmit(subject, name, score) {
  const c = await getClient();
  if (!c) return;
  const key = `lb:${subject}`;
  const member = JSON.stringify({ n: name });
  const prev = await c.zScore(key, member);
  if (prev == null || score > Number(prev)) {
    await c.zAdd(key, [{ score, value: member }]);
    // keep top 50
    await c.zRemRangeByRank(key, 0, -51);
  }
}
