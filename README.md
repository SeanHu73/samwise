# Samwise

A calm, local-first personal planner PWA implementing Milestones 0–1 of the build guide. Capture works offline, data lives in IndexedDB, and every mutation enters an idempotent sync outbox. Today is limited to three commitments; incomplete work requires an explicit defer decision.

## Setup

1. Install Node 22 and run `npm install`.
2. Copy `.env.example` to `.env` and add the Supabase project URL and anon key.
3. Run `supabase start`, apply `supabase/migrations`, and deploy the `sync` Edge Function. Email/password auth must be enabled in Supabase.
4. Run `npm run dev`. Use the browser install action to install the PWA.

The app remains useful without Supabase configuration; changes stay locally and show as pending. Secrets and service-role keys must never use `VITE_` variables.

## Commands

- `npm run dev` — local development
- `npm run build` — type-check and production build
- `npm test` — rollover, capacity, and conflict rules
- `npm run lint` — static checks

## Current scope

Inbox capture/clarification, project creation, Today commitments, focus timer, actual-time events, completion, mandatory defer choices, device IDs, IndexedDB outbox, a sync Edge Function, RLS, and private attachment storage. Calendar, AI, Notion, planning horizons, and duration learning are intentionally deferred to later milestones.
