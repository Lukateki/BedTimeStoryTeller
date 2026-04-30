# 📖 Bedtime Story Teller

An AI-powered bedtime story generator with an animated book UI, genre-reactive backgrounds, chapter illustrations, and full narration.

## Stack

- **Frontend**: React 18 + Vite (Vercel)
- **Story service**: Express + GPT-4o — structured JSON with chapters (port 3001)
- **Image service**: Express + DALL-E 3 — per-chapter + cover illustrations (port 3003)
- **TTS service**: Express + OpenAI TTS — full story narration (port 3002)
- **Orchestration**: Docker Compose (local) / Render (production)

## Quick Start

```bash
# 1. Copy and fill in your API key
cp .env.example .env
# edit .env → OPENAI_API_KEY=sk-...

# 2. Start all backend services
docker-compose up --build

# 3. Start frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
# → http://localhost:5173
```

## Without Docker

```bash
# Terminal 1 — story service
cd services/story-service && npm install
echo "OPENAI_API_KEY=sk-..." > .env
npm start

# Terminal 2 — image service
cd services/image-service && npm install
echo "OPENAI_API_KEY=sk-..." > .env
npm start

# Terminal 3 — TTS service
cd services/tts-service && npm install
echo "OPENAI_API_KEY=sk-..." > .env
npm start

# Terminal 4 — frontend
cd frontend && npm install && npm run dev
```

## Deployment

**Frontend → Vercel**
Push frontend/ to GitHub, import to vercel.com, set env vars in dashboard.

**Backend → Render (one service per repo subfolder)**
- story-service: root dir `services/story-service`, start cmd `npm start`
- image-service: root dir `services/image-service`, start cmd `npm start`
- tts-service: root dir `services/tts-service`, start cmd `npm start`
- Set `OPENAI_API_KEY` as env var in each service

Then update frontend env vars to point at Render URLs.

## Estimated Cost (rare/personal use)

| Call | Cost |
|------|------|
| GPT-4o story | ~$0.03–0.06 |
| DALL-E 3 cover | ~$0.04 |
| DALL-E 3 × 4 chapters | ~$0.16 |
| OpenAI TTS (1500 words) | ~$0.12 |
| **Total per story** | **~$0.35–0.40** |

For a small group using it rarely: **~$5–15/month** max.

## Genre Themes

The background, book color, and narrator voice all shift with genre:

| Genre | Background | Voice |
|-------|-----------|-------|
| Fantasy | Deep forest greens + gold | Onyx (deep) |
| Sci-Fi | Deep space blue ↔ red glow | Echo |
| Fairy Tale | Purple + gold sparkles | Shimmer |
| Adventure | Warm amber + earth tones | Alloy |
| Mystery | Deep navy + muted glow | Alloy |
| Horror | Blood red on black | Fable |
| Romance | Deep rose + warm pink | Shimmer |
| Fable | Forest green + earthy gold | Nova |
