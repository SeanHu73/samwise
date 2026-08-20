# Samwise

A calm, local-first personal planner PWA. Capture, planning, notes, reviews, and preferences work from IndexedDB; user-authored mutations enter an idempotent two-way sync outbox. Today is intentionally small and incomplete work requires an explicit decision.

## Setup

1. Install Node 22 and run `npm install`.
2. Copy `.env.example` to `.env.local` and add the Supabase project URL and browser-safe publishable key.
3. Apply `supabase/migrations` and deploy `sync`, `planner`, and `google-calendar`. Email/password auth must be enabled in Supabase.
4. Run `npm run dev`. Use the browser install action to install the PWA.

The app remains useful without Supabase configuration; changes stay locally and show as pending. Secrets and service-role keys must never use `VITE_` variables.

## Commands

- `npm run dev` — local development
- `npm run build` — type-check and production build
- `npm test` — rollover, capacity, and conflict rules
- `npm run lint` — static checks

## Server-only secrets

Set these with `npx supabase secrets set`; never put them in `.env.local` or a `VITE_` variable.

- AI: `OPENAI_API_KEY`; optional `OPENAI_MODEL` (default `gpt-5.4`).
- Google: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_STATE_SECRET`, `GOOGLE_TOKEN_ENCRYPTION_KEY`, and optional `GOOGLE_REDIRECT_URI`/`APP_URL`.
- The Google redirect URI defaults to `https://YOUR_PROJECT_REF.supabase.co/functions/v1/google-calendar?action=callback`.

## Current scope

Inbox, Today, Focus, seven-day intentions, project journeys, directions/outcomes, milestones, notes, private attachments, daily/weekly reviews, planning preferences, duration insights, offline sync, Google Calendar constraints, and reviewable AI breakdown drafts. Calendar and AI screens remain safely inactive until their server secrets are configured.
