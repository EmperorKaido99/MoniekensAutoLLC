# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dad's Auto Group** — a mobile-first PWA for a private auto dealer. Core features: generate export/container/towing quotes as PDFs, upload and manage vehicle documents, and scan QR codes linked to vehicles/records.

Stack: Next.js 14 App Router · TypeScript · Tailwind CSS · Supabase (auth, database, storage).

## Dev Commands

```bash
npm run dev        # start local dev server (localhost:3000)
npm run build      # production build
npm run lint       # ESLint
npm run type-check # tsc --noEmit
```

No test runner is configured yet.

## Architecture

### Auth & Session Flow

All routes are protected by `middleware.ts` (root), which delegates to `lib/supabase/middleware.ts`. The middleware uses `@supabase/ssr` to refresh the Supabase session cookie on every request. The `/login` route is the only public entry point — unauthenticated users are redirected there.

Two Supabase clients exist for a reason:
- `lib/supabase/client.ts` — browser client, use in `'use client'` components
- `lib/supabase/server.ts` — async cookie-based client, use in Server Components and API routes

Never use the browser client in server-side code.

### Data Flow

```
Page (Server Component)
  └── lib/supabase/server.ts  →  Supabase DB / Storage
  └── app/api/*               →  PDF generation, signed URLs

Client Component
  └── lib/supabase/client.ts  →  realtime subscriptions, auth state
```

### Quote System

Three quote types (`export` | `container` | `towing`) share the `Quote` interface in `types/quote.ts`. Each has its own form at `app/quotes/new/<type>/page.tsx`. Quote creation → PDF generation (`app/api/generate-pdf/`) → storage in Supabase → optional QR code linking via `lib/qr/`.

### Document Pipeline

Upload (`app/api/documents/upload/`) → store in Supabase Storage → record saved to DB. Signed URLs for private files come from `app/api/documents/signed-url/`.

### Component Conventions

- `components/ui/` — generic primitives (Button, Input, etc.), no domain logic
- `components/<domain>/` — domain-specific components tied to a feature (quotes, documents, scanner, layout)
- Pages stay thin — delegate rendering to components, data fetching to server actions or API routes
- Default to Server Components; add `'use client'` only when needed (interactivity, browser APIs, Supabase browser client)

### Skills

Project skills live in `.claude/skills/`:
- `/skill-builder` — interactive wizard to create new skills
- `/frontend-design` — mobile-first Tailwind UI patterns for this PWA

## Environment Variables

| Variable | Used in |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Both Supabase clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Both Supabase clients |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only privileged operations |

Copy `.env.local` and fill in real values before running locally. Never commit real credentials.
