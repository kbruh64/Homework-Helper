# Pebble

A patient math homework helper for grades 3–4. Poly the slime gives hints, not answers.

There are two ways to run it:

| | **Pebble Lite** | **Pebble Pro** |
|---|---|---|
| Poly runs on | Rule-based code (built in) | Mistral AI |
| Needs the server | No — open the HTML | Yes — needs the key |
| Internet | Works offline | Needs internet |
| Cost | Free | Uses your Mistral API credits |
| Answers always correct | Yes (math is computed in code) | Usually (AI can slip) |

The website is the same for both. **Pro is an opt-in toggle** in the helper chat — it only turns on if the server is running with a key.

---

## Run Pebble Lite (no AI)

Just open `index.html` in a browser. The toggle for Pro will appear disabled. Everything else works.

## Run Pebble Pro (with Mistral)

You need [Node.js](https://nodejs.org) installed.

1. **Install dependencies** (first time only):
   ```
   npm install
   ```

2. **Add your key.** Copy `.env.example` to `.env`, then paste your **own** Mistral key:
   ```
   MISTRAL_API_KEY=your-new-key-here
   ```
   > `.env` is git-ignored on purpose. **Never commit it or paste the key anywhere public.**
   > Get a key at https://console.mistral.ai. If a key ever leaks, revoke it there and make a new one.

3. **Start the server:**
   ```
   npm start
   ```

4. Open **http://localhost:3000**. In the helper chat, flip the **Pro** toggle (top-right of the chat) to switch Poly to AI.

If no key is set, the server still runs in **Lite mode** and the Pro toggle stays disabled — the rule-based Poly works exactly as before.

---

## How the key stays safe

The Mistral key lives **only on the server** (in `.env`, read by `server.js`). The browser never sees it — it just sends messages to `/chat`, and the server talks to Mistral. That's why the key must never be written into any `.html`/`.js` file: those are downloaded by every visitor.

---

## Rebuilding the topic & course pages

The pages in `topics/` and `courses/` are generated:
```
npm run build
```
Edit the question banks and content in `build-topics.cjs`, then re-run it.
