# Samwise

A local-first PWA day planner ("a steady companion"). React 19 + Vite + Tailwind
+ Dexie (IndexedDB) on the client; Supabase for auth, sync, storage, and Edge
Functions; OpenAI (via the `planner` Edge Function) for optional AI planning.

## Commands

- `npm run dev` — Vite dev server
- `npm run test` — Vitest (jsdom + fake-indexeddb)
- `npm run typecheck` / `npm run lint` / `npm run build`

## Architecture

- **Dexie is the source of truth** ([src/lib/db.ts](src/lib/db.ts)). All UI
  reads go through `useLiveQuery` hooks in
  [src/hooks/useData.ts](src/hooks/useData.ts).
- **Writes** go through [src/lib/repository.ts](src/lib/repository.ts): write
  to Dexie, then queue a `SyncOperation` in the `outbox` table.
  [src/lib/sync.ts](src/lib/sync.ts) pushes the outbox to the `sync` Edge
  Function and pulls a cursor-based op log back. Entities are versioned;
  the server bumps `version` on every update and detects conflicts on
  long-text fields (stored in `sync_conflicts`, currently surfaced nowhere).
- **Clearing a field over sync requires `null`, not `undefined`** — undefined
  keys are dropped by JSON serialization and never reach the server.
- **Text inputs that save to the database must debounce.** Use
  [AutoSaveText](src/components/AutoSaveText.tsx) — one save shortly after
  typing stops. A save per keystroke floods the outbox and version counter.

## Task model (deliberate product decisions)

- **No commitment cap**: Today holds as many tasks as the user plans. The old
  "max 3 commitments" limit was removed on purpose; do not reintroduce it.
- **Quick Add flow**: `captureTask` creates `status: "inbox"` with no
  `plannedForDate`. Day-less, project-less active tasks are "Quick Add" and
  appear at the bottom of Today and Plan until the user gives them a day
  (`planTask`) — there is no separate Inbox page anymore.
- **Overflow**: active tasks whose `plannedForDate` is in the past show under
  "From earlier days" on Today and Plan. Nothing rolls over silently and
  nothing disappears.
- Task editing happens in [TaskDetail](src/components/TaskDetail.tsx)
  (opened by clicking any task row); notes live in `descriptionMarkdown`.
- Dates are **local-time day keys** (`dateKey`/`todayKey` in
  [src/lib/ids.ts](src/lib/ids.ts), `YYYY-MM-DD`). Never derive a day key
  from `toISOString()` — that's UTC and breaks evenings.
- Legacy statuses `deferred`/`delegated`/`next` still exist in old data; the
  Quick Add query includes them so they stay visible.

## Removed on purpose (2026-08)

Defer dialog with reschedule/shrink/waiting/delegate/drop/someday choices,
`rollover.ts`, `mergeTask`, the hidden per-capture AI assessment
(`captureAssessment.ts`), and the Inbox page. The Assistant page is parked
until core flows are solid.
