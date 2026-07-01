# Evora Dental — Lab Management System

An intelligent dental-lab management web app: dashboard, room-based production
flow, QR scanner, case management, inventory, technicians, professional
accounting (invoices, payments, expenses, multi-currency, VAT), analytics,
a live TV display board, and an AI assistant. Bilingual (Arabic / English,
full RTL).

**Pro features**

- **Multi-user login with roles** — Manager / Reception / Technician /
  Accountant, each with a PIN and role-limited navigation. Users are managed
  in Settings; every action is recorded in an audit log.
- **Cloud sync across devices** — powered by Netlify Blobs (no external
  database needed). Pick a lab code + PIN in Settings → Cloud Sync, connect
  every device (reception PC, TV, phone) with the same pair, and data syncs
  automatically (~1 min).
- **Installable PWA** — add it to the home screen on tablets/phones; the app
  shell works offline.

Built with **React + Vite + TypeScript + Tailwind**. Data is stored locally in
the browser (`localStorage`) with JSON export/import for backups, and shared
across devices when Cloud Sync is enabled.

> Default sign-in after a fresh install: **Lab Manager, PIN 1234** (change it
> in Settings → Users & Roles).

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve the production build
```

## Deploy to Netlify

This repo is Netlify-ready (`netlify.toml`):

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Functions directory:** `netlify/functions`

Steps:

1. Push this branch to GitHub.
2. In Netlify: **Add new site → Import from Git**, pick this repo.
3. Netlify reads `netlify.toml` automatically — no manual settings needed.
4. Deploy. Then connect your custom domain under **Domain settings**.

### AI assistant (optional)

The assistant calls Claude through a serverless function
(`netlify/functions/claude.ts`) so the API key stays server-side. Pick **one**
provider and set its key as a site environment variable in Netlify:

- **Groq (free, recommended)** — `GROQ_API_KEY` (get one at
  https://console.groq.com/keys). Optional `GROQ_MODEL`
  (defaults to `llama-3.3-70b-versatile`).
- **Google Gemini (free tier, region-dependent)** — `GEMINI_API_KEY` (get one
  at https://aistudio.google.com/apikey). Optional `GEMINI_MODEL`
  (defaults to `gemini-2.0-flash`).
- **Anthropic Claude (paid)** — `ANTHROPIC_API_KEY`. Optional `CLAUDE_MODEL`
  (defaults to `claude-opus-4-8`).

Selection order is Groq → Gemini → Claude. Without any key, the assistant
automatically falls back to a fast **offline local search** engine over your
lab data — so it works either way.

## Data & backups

All data lives in the browser. Use **Settings → Export Data (JSON)** to back up
and **Import** to restore. CSV export of cases is also available.
