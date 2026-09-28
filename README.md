# SRS — School Report System

A Soul Valley demo: **Teacher Report → AI → Headmaster**.

A teacher submits a report the way they'd normally describe it — typed, spoken
naturally in a chat box, or uploaded as a document (`.docx`, `.pdf`, `.txt`,
`.md`). The AI extracts the class, subject, date, and teacher automatically,
then structures the report's content (topic, strengths, challenges, students
needing support, completion status, follow-up) into a table a headmaster can
scan at a glance — without ever replacing the teacher's original account,
which stays attached to every report.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4
- [Groq](https://groq.com) (`openai/gpt-oss-120b`) for the AI structuring step, with a
  deterministic keyword-based fallback if no API key is configured
- `mammoth` / `unpdf` for `.docx` / `.pdf` text extraction
- `docx` for generating a downloadable Word summary of each report
- File-based JSON storage (`data/reports.json`) — fine for a demo; swap for a
  real database before any production use

## Getting started

```bash
npm install
cp .env.local.example .env.local   # add your own GROQ_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `/teacher` submits a report,
`/headmaster` reviews the structured dashboard.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `GROQ_API_KEY` | No | Enables real AI structuring. Without it, the app falls back to a rule-based extractor. |
| `GROQ_MODEL` | No | Defaults to `openai/gpt-oss-120b`. |

## Note on deployment

`data/reports.json` is written to the local filesystem, which works for local
development but is **read-only on most serverless platforms (including
Vercel)**. Submitted reports won't persist in that kind of deployment — swap
in a real database (e.g. Postgres, Vercel KV) before relying on this beyond a
live demo.
