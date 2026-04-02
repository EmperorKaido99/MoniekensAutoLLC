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

### Design System

Design tokens are CSS variables in `app/globals.css`: `--navy` (#0D1B2A), `--amber` (#E8970A), `--bg` (#F4F5F7), `--card` (#FFFFFF), `--success`, `--danger`, `--info`. Use utility classes `bg-navy`, `text-amber`, etc. — do not hardcode hex values in components.

All buttons minimum `min-h-[48px]`, body text minimum `text-base` (16px). The primary user is an elderly man — clarity over density on every screen.

### Component Conventions

Built UI primitives in `components/ui/`: `Button`, `Input`, `Card`, `Badge`, `Modal`, `ConfirmDialog`, `LoadingSpinner`. Always use these — do not create one-off inline equivalents.

Layout components in `components/layout/`:
- `BottomNav` — fixed 4-tab nav (Home, Quotes, Documents, Scan), highlights active tab in amber
- `TopHeader` — navy header with optional branding row, title, subtitle, and action slot
- `AuthGuard` — client-side session check wrapper; redirects to `/login` if no session

Every protected page uses the pattern: Server Component checks session via `lib/supabase/server.ts` → redirects if none, renders `<BottomNav />` at the bottom with `pb-24` on the page wrapper.

Pages stay thin — delegate rendering to components, data fetching stays in the Server Component above the return.

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
