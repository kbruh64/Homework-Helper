// Tiny Upstash Redis (REST) helper. Works on Vercel and Render.
// Configure with env vars (Vercel KV / Upstash both provide these):
//   KV_REST_API_URL   (or UPSTASH_REDIS_REST_URL)
//   KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_TOKEN)
const URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export function kvConfigured() {
  return Boolean(URL && TOKEN);
}

// Run a single Redis command, e.g. kvCmd(['ZADD','key','10','member'])
export async function kvCmd(args) {
  const r = await fetch(URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (!r.ok) throw new Error('kv ' + r.status);
  return r.json();
}
