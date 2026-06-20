# Creator Media OS AI

AI-powered media management, YouTube trend research, shorts generation, content
repurposing, voiceover and captioning SaaS.

> Research trends, manage media, generate shorts, and publish content from one AI dashboard.

Built with **Next.js (App Router)**, **Tailwind CSS**, **Prisma + PostgreSQL (Neon)**,
**OpenRouter** (AI), **YouTube Data API**, and **FFmpeg** for video rendering.

---

## ✨ Features (working)

| Module | What it does |
|--------|--------------|
| **Auth + Workspaces** | Email/password (JWT + bcrypt). Each user gets a workspace, role & free plan automatically. |
| **Dashboard** | Live stats from the database — media, shorts, AI tokens, storage, recent projects & activity. |
| **YouTube URL Analyzer** | Paste a URL → real metadata (views/likes/comments via Data API, or title/channel via oEmbed) + AI summary, key points, viral reason, shorts ideas, titles & hashtags. |
| **Trend Finder** | Country + category-wise real trending videos via the YouTube Data API. One-click "Analyze". |
| **AI Script Generator** | Topic + tone + duration + language → full short-form script (hook, voiceover, captions, music mood, hashtags). |
| **Projects** | Create / list / delete projects (niche, platform) scoped to the workspace. |
| **Media Library** | Real drag-&-drop upload with progress, type filters, search, image/video/audio preview, download & delete. |
| **Voice Studio** | Script-to-voice preview (browser TTS), speed/pitch controls, save voiceovers. |
| **Shorts Generator** | Convert any uploaded video to a **9:16 vertical short** with FFmpeg — trim, **burned captions**, **AI auto-caption**, and **logo/watermark** overlay. |
| **Settings → API Keys (BYOK)** | Add your own OpenRouter key (validated + AES-256-GCM encrypted), view AI usage. |

### AI provider — OpenRouter
- Free models by default (e.g. `openai/gpt-oss-120b:free`) — no cost.
- BYOK (bring your own key), automatic **model fallback**, per-call **timeout**, robust **JSON repair**, **prompt caching**, and **usage logging**.

---

## 🧱 Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS, custom shadcn-style UI, lucide-react, sonner
- **Backend:** Next.js Route Handlers, Prisma ORM
- **Database:** PostgreSQL (Neon)
- **AI:** OpenRouter (chat + JSON)
- **YouTube:** YouTube Data API v3 (+ public oEmbed fallback)
- **Video:** FFmpeg (via `ffmpeg-static`, no system install)
- **Storage:** local filesystem (`/storage`) — swap to Cloudflare R2 / S3 later
- **Auth:** JWT (jose) in HTTP-only cookies, bcrypt

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- A PostgreSQL database (free: [Neon](https://neon.tech))
- An [OpenRouter](https://openrouter.ai/keys) API key (free models available)
- _(optional)_ A [YouTube Data API](https://console.cloud.google.com/apis/library/youtube.googleapis.com) key (enables real views/likes + Trend Finder)

### 2. Install
```bash
npm install
```

### 3. Configure environment
Copy `.env.example` to `.env` and fill in:
```bash
DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"
JWT_SECRET="<long-random-string>"
ENCRYPTION_KEY="<64-char hex — node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\">"
OPENROUTER_API_KEY="sk-or-v1-..."
OPENROUTER_DEFAULT_MODEL="openai/gpt-oss-120b:free"
OPENROUTER_FALLBACK_MODELS="openai/gpt-oss-20b:free,meta-llama/llama-3.3-70b-instruct:free"
YOUTUBE_API_KEY="AIza..."   # optional
```

### 4. Create the database tables
```bash
npx prisma db push
```

### 5. Run
```bash
npm run dev
```
Open **http://localhost:3000/register**, create an account, and explore the dashboard.

### Build for production
```bash
npm run build && npm start
```

---

## 📂 Project Structure

```
app/
  (app)/                 # Authenticated dashboard (shared sidebar+navbar shell)
    dashboard, projects, media, youtube, shorts, shorts/editor,
    scripts, ai-voice, analytics, settings
  api/                   # Route handlers
    auth/  ai/  youtube/  media/  shorts/  voice/  keys/  usage/  projects/  dashboard/
  login, register
components/
  dashboard/             # sidebar, navbar, app-shell, dashboard-content, ...
  ui/                    # card, badge, table, dropdown, modal, charts, skeleton, ...
  settings/ youtube/
lib/
  prisma, auth, session, workspace, validations
  openrouter, prompts          # AI service + prompt templates
  youtube                      # metadata + trending helpers
  storage, ffmpeg, crypto      # file storage, video render, encryption
prisma/schema.prisma           # 23-table PostgreSQL schema
storage/                       # uploaded + rendered files (gitignored)
```

---

## 🔌 Key API Routes

```
POST /api/auth/register | login        GET /api/auth/me        POST /api/auth/logout
GET  /api/dashboard                     GET /api/usage
GET/POST /api/projects                  PUT/DELETE /api/projects/:id
POST /api/media/upload   GET /api/media   GET /api/media/file/:id   DELETE /api/media/:id
POST /api/youtube/analyze-url           GET /api/youtube/trending
POST /api/ai/summarize | generate-script | caption
GET/POST /api/scripts                   GET/POST /api/voice
POST /api/shorts/generate               GET /api/shorts
GET/POST/DELETE /api/keys
```

---

## 🔒 Compliance

This platform only processes **user-uploaded videos** and the user's own media.
For non-owned YouTube URLs it fetches **public metadata only** (official API / oEmbed)
— it does **not** download or reuse copyrighted videos.

---

## 🗺️ Roadmap (not yet built)

- YouTube OAuth upload & scheduling (requires Google app verification)
- Whisper transcription for real spoken-word subtitles
- Background music mixing
- Cloudflare R2 / S3 storage for production
- Stripe / Razorpay billing
- Team invites & client approval workflow

---

Built module-by-module with real, tested backends. Each feature persists to PostgreSQL.
