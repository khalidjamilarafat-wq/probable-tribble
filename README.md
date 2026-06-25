# Evora Dental — Lab Management System

An intelligent dental-lab management web app: dashboard, room-based production
flow, QR scanner, case management, inventory, technicians, professional
accounting (invoices, payments, expenses, multi-currency, VAT), analytics, and
an AI assistant. Bilingual (Arabic / English, full RTL).

Built with **React + Vite + TypeScript + Tailwind**. Data is stored locally in
the browser (`localStorage`) with JSON export/import for backups.

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

- **Google Gemini (free tier)** — `GEMINI_API_KEY` (get one at
  https://aistudio.google.com/apikey). Optional `GEMINI_MODEL`
  (defaults to `gemini-2.0-flash`).
- **Anthropic Claude (paid)** — `ANTHROPIC_API_KEY`. Optional `CLAUDE_MODEL`
  (defaults to `claude-opus-4-8`).

If `GEMINI_API_KEY` is set it is used first. Without any key, the assistant
automatically falls back to a fast **offline local search** engine over your
lab data — so it works either way.

## Data & backups

All data lives in the browser. Use **Settings → Export Data (JSON)** to back up
and **Import** to restore. CSV export of cases is also available.
