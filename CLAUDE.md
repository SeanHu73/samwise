# Samwise

A local-first PWA day planner ("a steady companion"). React 19 + Vite + Tailwind
+ Dexie (IndexedDB) on the client; Supabase for auth, sync, storage, and Edge
Functions; OpenAI (via the `planner` Edge Function) for optional AI planning.

## At the start of every session

Read [IDEAS.md](IDEAS.md) — the user's backlog of changes they want for the
app. Bring it up unprompted early in the session: ask whether the in-app
Workshop page (`/ideas`) has new entries to paste in (that page lives in the
user's synced database, which you cannot read — its "Copy for Claude" button
puts the text on their clipboard), then propose how open items could be
integrated (or argue why they shouldn't be), and keep IDEAS.md's sections
up to date as items are discussed, decided, and built.

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
- **Quick Add flow**: capture asks "when?" (Today / Pick a date via
  [MonthCalendar](src/components/MonthCalendar.tsx) / Set aside), not
  priority — priority defaults to 3 and is edited in TaskDetail.
  `captureTask` creates `status: "inbox"` with no `plannedForDate`; day-less,
  project-less active tasks are "Quick Add" and appear at the bottom of Today
  and Plan until the user gives them a day — there is no Inbox page anymore.
- **Multi-day planning**: a task can be scheduled onto several work days.
  `plannedForDates` (sorted array, server column `planned_for_dates` jsonb)
  holds them all; `plannedForDate` stays the first day for index/sync compat.
  Always go through `setPlannedDays` and the helpers in
  [src/lib/taskDays.ts](src/lib/taskDays.ts) (`taskDays`/`taskOnDay`/
  `isOverflow`) — never compare `plannedForDate` directly.
- **Overflow**: active tasks whose every planned day is in the past show under
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
