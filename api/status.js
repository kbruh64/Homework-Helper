// Vercel serverless function — GET /api/status
// Tells the front-end whether Poly Pro is configured (a key is present).
export default function handler(req, res) {
  res.status(200).json({ pro: Boolean(process.env.MISTRAL_API_KEY) });
}
