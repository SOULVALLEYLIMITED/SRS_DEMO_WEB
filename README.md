# SRS — School Report System

A Soul Valley demo application. Free-text report submissions are extracted,
structured, and summarized automatically, then made available on a dashboard
and as a downloadable Word document.

## Features

- Chat-style submission (no form fields) with AI follow-up questions
- Automatic extraction of class, subject, date, and author from free text
- Document upload with text extraction: `.docx`, `.pdf`, `.txt`, `.md`
- AI-structured output rendered as a table, including a live preview mid-conversation
- Downloadable `.docx` summary per report
- Dashboard with status and subject charts
- Light and dark mode
- Deterministic rule-based fallback when no AI key is configured

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| AI | [Groq](https://groq.com) (`openai/gpt-oss-120b`), with a rule-based fallback |
| Document parsing | `mammoth` (`.docx`), `unpdf` (`.pdf`) |
| Document generation | `docx` |
| Storage | Redis via `ioredis` — any standard provider (production); local JSON file (development) |

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment file:
   ```bash
   cp .env.local.example .env.local
   ```
3. Add a `GROQ_API_KEY` (optional — see [Environment variables](#environment-variables))
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Routes

| Route | Purpose |
|---|---|
| `/teacher` | Submit a report through the chat interface |
| `/headmaster` | Dashboard: charts and structured report list |
| `/headmaster/[id]` | Full structured result and original submission |

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `GROQ_API_KEY` | No | Enables AI structuring and chat replies. Without it, a rule-based extractor is used instead. |
| `GROQ_MODEL` | No | Defaults to `openai/gpt-oss-120b`. |
| `REDIS_URL` | No¹ | Standard Redis connection string (`redis://` or `rediss://`), for persistent storage in production. |

¹ Without it, the app falls back to a local JSON file (`data/reports.json`).
That works for local development only — see [Storage](#storage).

## Storage

| Environment | Backend | Notes |
|---|---|---|
| Local development | `data/reports.json` | No setup required. |
| Production (Vercel or similar) | Redis (via `ioredis`) | Required — see below. |

Most serverless platforms, including Vercel, run each request on an ephemeral,
read-only filesystem, so the local JSON file cannot persist reports in
production.

To enable persistent storage:

1. Create a Redis database with any provider — Redis Cloud
   ([redis.io](https://redis.io)), Upstash, or self-hosted all work, since
   `ioredis` speaks the standard Redis protocol
2. Copy its connection string (`redis://default:<password>@<host>:<port>`)
3. Set it as `REDIS_URL` in the Vercel project's environment variables
   (Settings → Environment Variables), for Production and Preview
4. Redeploy

No code changes are needed: [`lib/store.ts`](lib/store.ts) selects the Redis
backend automatically whenever `REDIS_URL` is present.

## Design notes

- The AI never invents facts and never replaces the original submission — the
  original text is always stored and shown alongside the structured summary.
- Chart colors follow a validated, colorblind-safe palette (see
  [`lib/palette.ts`](lib/palette.ts)) with separate light/dark steps.
