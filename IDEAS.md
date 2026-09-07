# Samwise — change backlog

Sean's running list of changes wanted for the app itself. Ideas are captured
on the go in the app's **Workshop** page (`/ideas`, synced across devices) and
brought here when we work on the app. Claude reads this file at the start of
every session, asks whether the Workshop page has new entries, proposes how
open items could be integrated (or why they shouldn't be), and moves items
between sections as they're decided and built.

## New ideas (to discuss)

_None right now — paste new entries from the Workshop page here._

## Claude's proposals (not yet decided)

- **Update toast**: the PWA applies new versions on the next launch, which
  confused us twice. A small "A new version is ready — reload" banner via
  `registerSW`'s `onNeedRefresh` would make deploys visible.
- **Local-only mode**: the sign-in gate blocks the whole app when offline on
  a fresh device. A "continue without an account" path (sync off until
  sign-in) would match the local-first pitch.
- **Someday shelf**: dropped tasks are visible on All tasks now, but there's
  no gentle "not now, maybe later" state distinct from Quick Add. Could be a
  simple "Someday" section on All tasks.
- **Conflict review**: sync detects conflicting edits on long-text fields
  and stores them, but no screen shows them. Only worth building once a
  second device is used regularly.
- **Drag to reorder**: the up/down arrows work but feel mechanical; touch
  drag-and-drop on Today would be smoother. Moderate effort, cosmetic win.
- **Assistant revival**: the AI planner page is parked. When core flows feel
  settled, rebuild it around drafts that reference real Big Picture plans.

## Decided / planned

_Nothing queued._

## Built

_Shipped changes live in the git log; this section only tracks items that
came from this backlog._
