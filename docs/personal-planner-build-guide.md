# Samwise — ADHD-informed Personal Planner PWA Build Guide

## Product decision

Build a standalone, local-first personal planning Progressive Web App (PWA): an installable website that works on phone and desktop and retains data offline. It does not depend on Notion in version 1.

The product helps one person:

1. Capture and complete a small realistic daily list.
2. Turn vague projects into concrete next actions.
3. Learn duration patterns from estimated versus actual focused time.
4. Plan daily, weekly, and quarterly horizons.
5. Read Google Calendar as a source of commitments and constraints.
6. Synchronize offline changes across devices after reconnection.

This is an executive-function support tool, not a diagnostic or treatment tool. “ADD” is now generally described within ADHD (often the inattentive presentation); the system should be useful whether or not the user has a diagnosis. There is no evidence that one commercial task app is universally “best.” The useful design pattern is an external, forgiving system that reduces working-memory load and turns intentions into small observable actions.

Do not build a Notion clone. Exclude arbitrary databases, blocks, team collaboration, broad dashboards, and task time-blocking.

## Product principles

- Opinionated over infinitely configurable.
- Calendar is for meetings, appointments, travel, and booked events. Ordinary task intentions stay in the app.
- No silent rollover: after two deferrals, choose do, shrink, defer, delegate, or drop.
- The assistant proposes; the user accepts task drafts and confirms every external action.
- Improve with activity data rather than continuous model fine-tuning.
- Show duration ranges and confidence, never falsely exact estimates.
- The Today list is intentionally small: 1–3 commitments plus optional next actions.
- Make the next choice obvious. A user should never have to scan a giant database to decide what to start.
- Separate a _commitment_ from an _option_. Only commitments count toward today’s capacity; options remain available without creating failure.
- Treat capacity, attention, and energy as variable. A plan is a hypothesis to revise, not a promise to punish.
- Turn vague intentions into a definition of done, a first physical action, and an if–then start cue.
- Use gentle recovery rather than streaks, red overdue badges, guilt language, or automatic rescheduling.
- Keep long-term planning visible but shallow: direction → next milestone → next action. Do not require a complete life plan before action can begin.

## Evidence-informed operating model

The product should support a repeatable loop rather than merely store tasks:

```text
Capture → clarify → choose a small plan → start → notice time → close/replan → weekly reset
```

Why these parts matter:

- **External memory and a single capture point.** Adults with ADHD commonly use external aids to manage daily-life demands; reducing the need to remember, categorize, and act at the same moment is the point of the Inbox.
- **Concrete if–then start plans.** Prompting “If it is 9:30 at my desk, then I open the résumé document and write one bullet” converts a goal into a cue-action link. It is more useful than “work on résumé.”
- **Small, visible commitments.** Time perception and time estimation can be difficult for adults with ADHD, although the evidence is heterogeneous. Capacity must be based on observed data and buffers, not optimism.
- **Observed duration and feedback.** A visual countdown and estimated-versus-actual history give a reality-based sense of time. The system learns patterns; it never treats a missed prediction as a character flaw.
- **Frequent review and flexible replanning.** Organization/time-management interventions for adults with ADHD target planning, prioritization, and flexibility; a weekly reset is more valuable than an elaborate master schedule.
- **Motivation plus obstacle.** For longer goals, the planner should ask for the desired outcome, likely obstacle, and a practical response—not only a list of sub-tasks.

Research is directional rather than a prescription for a medical intervention. Build the behavioral supports above, measure whether they help this user, and make every prompt/reminder optional.

## Product requirements: what Samwise should do

### Essential daily supports — build first

| Function                                  | User benefit                        | Required behavior                                                                                                     |
| ----------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Frictionless Inbox                        | Capture before it disappears        | One field, voice/text later, no mandatory category or date.                                                           |
| Triage conversation                       | Removes “what is this?” paralysis   | Classify as task, project, calendar event, waiting, reference, or someday/maybe. Ask at most one question at a time.  |
| Definition of done + next physical action | Makes tasks startable               | A task can be marked “needs clarification”; active tasks need a verb-led next action such as “Open…” or “Email…”.     |
| Today commitments                         | Prevents overload                   | User selects 1–3 commitments; capacity warning is advisory. Keep a separate “available next” list.                    |
| Focus mode                                | Helps initiation and time awareness | One selected task, large elapsed/countdown timer, next action, pause/finish/defer. Hide all other lists by default.   |
| Flexible rollover                         | Replaces guilt with a decision      | At day close, choose finish, shrink, reschedule, waiting, delegate, drop, or move to someday. No automatic migration. |
| Daily close + weekly reset                | Restores trust in the plan          | A 2-minute close and a 15–30 minute weekly review; both may be skipped without penalties.                             |
| Duration calibration                      | Makes planning credible             | Log actual focus time; show wide ranges, sample count, and an outlier-exclude control.                                |

### Essential planning supports — build after the daily loop works

| Function               | User benefit                                          | Required behavior                                                                                                                 |
| ---------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Project map            | Holds multi-step work outside working memory          | Purpose, definition of done, current stage, milestone, next action, notes/files.                                                  |
| Exploration mode       | Makes unclear goals actionable                        | For uncertain projects, propose research, examples, conversations, decision criteria, and a decision date before execution tasks. |
| AI breakdown draft     | Lowers planning friction without surrendering control | Generate 3–7 meaningful steps, dependencies, risks, estimates, and first action; user edits/accepts drafts.                       |
| Weekly horizon         | Connects today to the near future                     | Pick 1–3 weekly outcomes and distribute only feasible next actions across seven days.                                             |
| Direction/quarter view | Scaffolds long-term thinking                          | Show a few active directions, one outcome per direction, next milestone, next review. Everything else is parked.                  |
| Calendar constraints   | Makes plans realistic                                 | Read events/travel/busy time; calculate remaining capacity. Planner tasks stay out of the calendar.                               |
| “Later” parking lot    | Stops false urgency                                   | Someday/maybe and paused projects are reviewable, not overdue.                                                                    |

### Helpful only once the core loop is trusted

- Optional start prompts and end-of-focus alerts, with quiet hours and per-project controls.
- Recurring routines/checklists for genuine repeating responsibilities—not a habit-streak system.
- A body-double/session link or “stay with me for 10 minutes” conversational mode. This is promising as a support pattern, but should be optional and tested with the user rather than treated as core evidence.
- File viewer/search for project materials (PDF, image, Markdown, common documents) and project-scoped notes.
- Natural-language weekly reflection: “What got in the way?” → tag a practical barrier and suggest one system change.
- Later controlled connectors: Drive/file search, email drafting, Notion import/linking, never broad autonomous computer control.

### Explicit non-goals

- A permanent all-tasks-at-once dashboard.
- Red “overdue” shame, completion streaks, points, or productivity scores.
- A schedule packed to 100% of nominal free time.
- Automatic task-to-calendar blocking.
- An AI that declares priorities or deadlines without grounding in the user’s stated constraints.
- Recreating Notion’s blocks, databases, templates, team collaboration, and wiki features.

## Version 1 scope

### Include

- Authentication.
- Responsive installable PWA.
- Areas, directions, goals, projects, milestones, tasks, subtasks, notes, and file attachments.
- Inbox, Today, seven-day Plan, Project pages, Reviews, and Insights.
- Timer/manual focused-time logging, completion, defer reason, and rollover intervention.
- Local-first edits and automatic sync.
- Personal duration estimates with evidence, range, and confidence.
- Google Calendar read access plus confirmed creation of genuine events.
- AI breakdown of projects/tasks into reviewable structured drafts.
- Lightweight Markdown notes and browser-supported file previews.

### Exclude

- Native iOS/Android applications.
- Full document collaboration, shared workspaces, and public publishing.
- Generic database and dashboard builders.
- A Notion-like block editor.
- Scheduling normal tasks as calendar events.
- Unsupervised external actions, email sending, purchasing, or file changes.
- Fine-tuning.

## Technology

| Layer       | Choice                                           | Why                                                            |
| ----------- | ------------------------------------------------ | -------------------------------------------------------------- |
| Client      | React + TypeScript + Vite                        | Small, fast, good PWA foundation.                              |
| UI          | Tailwind CSS + accessible primitives             | Mobile-first without heavy design-system work.                 |
| Local store | IndexedDB via Dexie                              | Durable offline replica and mutation outbox.                   |
| PWA         | Service worker and web manifest                  | Offline launch and home-screen installation.                   |
| Backend     | Supabase Auth, Postgres, Storage, Edge Functions | Auth, database, row-level security, storage, server functions. |
| Sync        | Custom operation log and sync endpoint           | Predictable merging across offline devices.                    |
| AI          | Server-side OpenAI Responses API                 | API keys stay private; supports structured output and tools.   |
| Calendar    | Google Calendar API OAuth                        | Read constraints and create approved real events.              |

Never put OpenAI keys, Google refresh tokens, or Supabase service keys in the client.

## Information hierarchy

```text
Direction → Goal/outcome → Project → Milestone → Task → Subtask
                                ↘ Notes and attachments
```

- Area: ongoing responsibility such as Career, Health, Home, or Finance.
- Direction: broad quarterly/yearly theme, such as Build a stronger product-design career.
- Goal: a time-bounded desired result.
- Project: finite work that produces a result.
- Milestone: observable checkpoint.
- Task: independently completable work.
- Subtask: smaller action. Every active project needs a visible next action.

When the user lacks clarity, create an exploration project. Initial work should be discovery: research, comparison, conversations, and a decision draft.

## Data model

All mutable user-owned tables include:

```text
id UUID; owner_id UUID; created_at; updated_at; deleted_at nullable; version integer
```

Use soft deletion and immutable activity events.

| Table                  | Main fields                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| areas                  | name, color, active                                                                          |
| directions             | title, description, horizon start/end, status, review cadence                                |
| goals                  | direction ID, title, definition of done, target date, status                                 |
| projects               | goal ID, area ID, title, purpose, definition of done, type, status, target date, next review |
| milestones             | project ID, title, target date, status, sort order                                           |
| tasks                  | fields specified below                                                                       |
| task_events            | immutable completion, timer, defer, estimate and status events                               |
| task_estimate_profiles | learned duration aggregates by category/context                                              |
| notes                  | project ID, title, markdown content                                                          |
| attachments            | project/task ID, private storage path, filename, MIME type                                   |
| calendar_connections   | encrypted OAuth token reference and selected calendars                                       |
| calendar_event_cache   | normalized calendar constraints and last sync                                                |
| planning_sessions      | review inputs plus proposed and approved plans                                               |
| planning_profiles      | user-editable capacity, breakdown, tone, focus-session, energy, and scheduling preferences   |
| sync_operations        | device-authored operations and server result                                                 |
| agent_runs             | prompt version, structured result, tools, approvals, error data                              |

### Task fields

```text
parent_task_id; project_id; milestone_id; area_id
title; description_markdown
status: inbox | next | planned | in_progress | done | deferred | dropped | delegated
priority: 1..4; energy: low | medium | high; context optional
estimated_minutes; estimate_low_minutes; estimate_high_minutes; estimate_confidence
actual_minutes derived from events
due_date (true deadline only); earliest_start_date; planned_for_date (intention only)
next_action_text; defer_count; last_defer_reason; rollover_state; sort_order
completed_at; timestamps; version
```

Record activity as events, not overwritten history:

```text
task_created, estimate_set, timer_started, timer_stopped, actual_time_logged,
task_completed, task_deferred, task_reactivated, task_dropped, task_split, task_planned
```

## Product screens

### Inbox

- A single always-available capture field.
- Capture asks only for the thought and its user-chosen priority. Do not require a category, date, estimate, or manually written next action.
- Save locally as an available task immediately, including offline.
- After saving, run a brief non-blocking AI assessment when online. If the wording is not already actionable, suggest one concrete first physical action; do not expand every capture into a project or interrupt the user with more questions.
- Older Inbox items retain quick edit and delete controls, but processing asks only for title and priority.

### Today

- Default screen, titled **Daily Mission**.
- Show 1–3 commitments then a separate list of available next actions.
- Do not show calculated “minutes available” or “N hours busy” summaries in the main daily/weekly interface.
- Timer, complete, and defer must be one click/tap away.
- Second deferral opens the decision drawer.

### Focus

- Enter from a single Today commitment or available next action.
- Display only: task title, definition of done, first physical action, optional relevant note/file, a large visual timer, and Finish / Pause / I’m stuck controls.
- “I’m stuck” offers four low-pressure choices: make the step smaller, clarify with Samwise, choose a five-minute start, or switch deliberately. It records neither failure nor a forced diagnosis.
- At the end, ask only: “Done, continue, or choose what happens next?” Log actual focus time automatically.

### Plan

- Seven-day capacity view, not a time-block calendar.
- Assign a task to a date as an intention.
- Warn when planned estimates exceed usable capacity.
- Explain suggestions using capacity, dependencies, calendar constraints, and estimates.

### Long-term map

- A calm vertical path: Directions → active outcomes → next milestones → next actions.
- Limit active directions and show “Not active this season” separately.
- For each direction, a short guided check-in: “What would make this direction meaningfully better by [date]?”, “What is uncertain?”, “What is the next decision or experiment?”
- Use milestone dates as review prompts unless they are real external deadlines.

### Big Picture

- Replace the Projects tab with a colour-coded outcome view called **Big Picture**.
- Each plan has a primary colour. Milestones and associated short-term tasks inherit that colour; priority may differentiate tasks with lighter or darker hues.
- New plans begin with an outcome and optional desired completion date. On submission, the AI proposes a reviewable reverse plan of medium-term milestones, short-term tasks, scheduling considerations, and important omissions. It must not add those recommendations automatically.
- Under the outcome thumbnails, show a six-month overview. Each month summarizes desired outcomes and milestones.
- Month → week → day is a progressive drill-down: select a month to see its weeks, then a week to see dated tasks on individual days.
- The detail view supports purpose, definition of done, completion date, dated milestones, and dated/priority-ranked tasks.

### Reviews

- Daily close: completion, actual time, tomorrow candidates.
- Weekly: process Inbox, review stalled work, choose 1–3 outcomes, assess capacity.
- Monthly/quarterly: continue, change, pause, or explore directions; create only the next milestones/tasks.

### Insights

- Estimate versus actual time by category/type.
- Repeated defer reasons.
- Completion patterns only after enough data exists.
- Frame insight as calibration rather than judgment.

## Interface specification

### Visual direction — a quiet journey through Middle-earth

Give Samwise an original, restrained high-fantasy aesthetic inspired by the feeling of a long, supported journey: old maps, green hills, woodland paths, warm inns, handwritten field notes, weathered leather, carved stone, brass, and firelight. It should feel like a trusted travelling companion and practical field journal—not a themed game, movie replica, or costume interface.

This direction must remain legally and visually distinct. Do not copy film stills, franchise logos, title treatments, character likenesses, maps, heraldry, inscriptions, quotes, proprietary typefaces, or recognizable symbols from _The Lord of the Rings_ adaptations. Use original illustrations and generic folklore/nature motifs such as paths, leaves, stars, mountains, lanterns, knots, and compass marks.

#### Emotional qualities

- Calm courage rather than urgency.
- Companionship rather than command.
- A visible path rather than a giant database.
- Warm refuge for daily planning; wider landscape for weekly and long-term views.
- Earned progress through completed steps, without points, streaks, ranks, or gamified pressure.

#### Design tokens

Use semantic tokens so themes remain consistent and accessible:

```text
parchment:      #F3EBD7  primary light surface
parchment-deep: #E2D2AF  secondary surface and dividers
ink:            #253229  primary text
moss:           #3F5A42  primary action
forest:         #263F35  navigation and focus background
brass:          #9A7438  selected detail and warm accent
ember:          #A75436  destructive/attention accent, used sparingly
mist:           #DCE3DA  quiet status and disabled surfaces
night:          #17231E  dark-theme background
moon:           #EEE8D7  dark-theme text
```

All final color pairs must meet WCAG AA contrast. Never use parchment texture beneath small text at enough opacity to reduce readability. Status must never rely on color alone.

#### Typography and ornament

- Use a readable, humanist serif for page titles and milestone headings, paired with a highly legible sans serif for controls, forms, task rows, and body copy.
- Prefer open-source fonts with web licenses; self-host them if privacy and offline behavior benefit.
- Use decorative initials, engraved rules, or manuscript flourishes only at section boundaries—not inside dense task flows.
- Keep labels plain and modern. Flavor may appear in optional headings such as “Today’s path,” but core actions remain unmistakable: Capture, Start focus, Finish, Replan.
- Avoid faux-medieval blackletter, all-caps fantasy fonts, low-contrast scripts, and ornamental text in interactive controls.

#### Surfaces and imagery

- Today resembles a clean field-journal page with subtle paper warmth, a narrow path/progress motif, and generous whitespace.
- Focus mode becomes a quiet woodland or firelit night surface with a strong timer and almost no ornament.
- Projects may use a restrained “quest map” structure: purpose → milestone → next action, drawn as an original trail rather than a generic kanban board.
- The seven-day Plan uses small landscape-like capacity cards; visual density communicates available room without becoming a literal calendar grid.
- Long-term planning uses a vertical journey map with original mountains, paths, cairns, lanterns, or trees as subtle wayfinding marks.
- Empty states may use small original ink illustrations. Illustrations are decorative, optional, lazy-loaded, and hidden from assistive technology unless they convey information.
- Textures must be CSS-generated or optimized local assets, work offline, and stay below a small performance budget. Provide a “Reduce decoration” preference.

#### Components and motion

- Buttons feel tactile through shape, border, and shadow—not skeuomorphic leather or unreadable carved text.
- Cards use soft parchment layers, dark ink, 12–20px radii, fine map-line borders, and restrained brass accents.
- Completion may gently close a trail marker or settle a leaf; use no fireworks, loot, points, or victory fanfare.
- Sync states may use a small compass/lantern indicator with a text label: Saved offline, Syncing, Up to date, or Needs attention.
- Motion should suggest a page, path, or breath and finish within roughly 150–250ms. Honor `prefers-reduced-motion` and never animate the focus timer in a distracting way.

#### Visual acceptance criteria

- The interface is recognizable as Samwise without using protected franchise artwork or names beyond the product name.
- Today and Focus remain faster to scan than the decorative elements.
- The same hierarchy works with decoration disabled, in dark mode, at 200 percent zoom, and on a 320px-wide screen.
- Controls retain 44px minimum touch targets, visible keyboard focus, semantic names, and WCAG AA contrast.
- PWA shell imagery and fonts are cached for offline launch without materially delaying first load.
- Test at least one low-vision/high-contrast pass and one reduced-motion pass before approving the theme.

### Shared interaction rules

- Default to one obvious primary action and progressive disclosure. Advanced fields live behind “More details.”
- Use plain, supportive language: “Replan” rather than “missed,” “available” rather than “backlog,” and “needs a next action” rather than “incomplete.”
- Every important state is understandable at a glance: Inbox count, today’s 1–3 commitments, current focus task, calendar capacity, and sync status.
- Never require drag-and-drop for a core action. Offer tap/click actions and keyboard shortcuts.
- Respect accessibility: semantic controls, high contrast, reduced motion, 44px mobile targets, keyboard navigation, and no color-only state.

### Computer / tablet layout

Desktop is for _thinking, processing, reviewing, and looking across horizons_.

```text
┌───────────────┬───────────────────────────────────┬──────────────────────┐
│ Samwise       │ Today / Project / Review           │ Context (optional)   │
│ Inbox         │                                   │ Calendar capacity    │
│ Today         │  1. Draft résumé                    │ Estimate / history   │
│ Plan          │     Open resume → write 1 bullet   │ Project note/files   │
│ Projects      │  2. …                              │ AI draft / details   │
│ Long-term     │                                   │                      │
│ Reviews       │  Available next actions            │                      │
└───────────────┴───────────────────────────────────┴──────────────────────┘
```

- Left rail: stable navigation and Inbox count.
- Main pane: one current surface, generous whitespace, list rows with title, next action, estimate range, and one-click complete/defer.
- Context rail: collapsible. Show only information relevant to the selected task/project; it must not compete with Today.
- Keyboard: `C` capture, `F` focus, `Space` complete selected task, `/` search, and a visible shortcut reference.
- The long-term map and weekly capacity view use the wide screen; the daily experience remains intentionally narrow.

### Phone layout

Phone is for _capture, choosing the next action, focusing, and quick recovery_—not dense project administration.

```text
┌─────────────────────────────┐
│ Today · Tue                 │
│ Daily Mission               │
│                             │
│ ○ Draft résumé              │
│   Open resume; write bullet │
│   [Start focus]             │
│                             │
│ ─ Available next ─          │
│ ○ Email Maya                │
│                             │
│ More  Today  +  Plan  Big   │
└─────────────────────────────┘
```

- Bottom tabs: More, Today, central Capture, Plan, Big Picture. Keep to five or fewer.
- More opens the complete navigation drawer from the left.
- Central Capture opens immediately with text input, asks only for priority, and saves locally even if offline.
- Today shows commitments first, then a collapsed available list. No side rail and no wide tables.
- Focus is a full-screen, distraction-minimized view with oversized controls and optional haptic/audio end cue.
- Plan uses a simple day strip/capacity cards; long-term map is read-first with a “continue on desktop” option for substantial restructuring.
- Offline/sync status is visible but quiet; changes should feel instant because local data is the source of interaction.

## Rollover behavior

1. Incomplete planned task enters a decision queue; it never silently moves to tomorrow.
2. First deferral options: reschedule, shrink, waiting, delegate, drop.
3. Second deferral asks what makes it hard to start and requires a next-action rewrite or explicit new plan.
4. A deferred task cannot stay active without a clear next action.
5. A task without a true deadline is not overdue merely because it was intended for a past day.

## Continuous duration learning

This is continuous data-based recalibration, not fine-tuning.

Inputs:

- task category/project type;
- original estimate;
- actual focused minutes;
- energy/context when consistently recorded;
- exploration/subtask classification;
- defer/interruption information;
- optional exclusion of exceptional tasks.

Initial behavior:

```text
prediction = user estimate if present, otherwise AI coarse estimate
range = prediction times [0.7, 1.5]
confidence = low
```

For comparable completed tasks calculate median, 25th percentile, 75th percentile, sample count, and actual-to-original-estimate ratio.

```text
if comparable samples < 5:
  broad range and low confidence
otherwise:
  blend user estimate with historical median
  range = percentile 25 to percentile 75, widened for task uncertainty
  confidence depends on sample count and spread
```

Example explanation:

> Similar admin tasks: 7 completions, median 35 minutes. Your estimate: 20 minutes. Suggested planning range: 30–45 minutes.

On completion: save events, recompute aggregate profile asynchronously, apply it to future suggestions only, and preserve the ability to exclude outliers.

## Calendar integration

### Policy

- Read Google Calendar events/free-busy for capacity, travel, and commitments.
- Never write normal planner tasks to Google Calendar.
- Create an event only when the user explicitly requests a genuine commitment and approves final details.

### OAuth and storage

Start read-only. Ask for write scope only when the user invokes real-event creation.

Cache a bounded range, for example 30 days past and 90 days future:

```text
external_event_id; calendar_id; starts_at; ends_at; all_day; busy_status;
title_or_privacy_label; updated_at; source_hash
```

Offer privacy mode that stores only busy time and generic labels.

### Capacity calculation

```text
usable capacity =
  configured work window
  - busy calendar time
  - travel/buffer allowance
  - reserve percentage (default 30–40 percent)
```

All-day travel reduces capacity substantially. User can override. Always show a recommendation, not a command.

## Offline synchronization

### Client flow

1. Cache the app shell in the service worker.
2. Keep an IndexedDB replica of active data and calendar cache.
3. Each local mutation appends an idempotent operation to a local outbox.
4. Upon reconnection: push operations, pull remote changes since a sync cursor, apply them locally, retry transient failures.
5. Show Saved offline, Syncing, Up to date, or Needs attention.

### Operation example

```json
{
  "operation_id": "uuid",
  "device_id": "uuid",
  "entity_type": "task",
  "entity_id": "uuid",
  "base_version": 7,
  "kind": "update_fields",
  "fields": { "status": "done", "completed_at": "timestamp" },
  "client_created_at": "timestamp"
}
```

### Conflict rules

- Immutable events merge by insertion.
- Independent field edits merge field-by-field.
- Completion wins over concurrent status change unless a later explicit operation reopens the task.
- Same long-text field edited on multiple devices: preserve both versions in a conflict record and show a resolution UI.
- Deletes are synchronized tombstones.
- Server validates ownership and version progression. Client timestamps never authorize access.

### Offline limitations

AI, fresh calendar data, OAuth, and remote file retrieval need internet. Cached calendar information shows as stale offline. Never queue an unreviewed external calendar write.

## AI planner

### Responsibilities

- Break a task/project into 3–7 meaningful drafts.
- Identify a next physical action.
- Separate exploration from execution.
- Suggest estimates, dependencies, risks, and capacity-aware plans.
- Use notes/attachments as project context.
- Ask one clarification question rather than invent missing facts.

### Boundaries

It may not invent deadlines, commitments, history, or priorities. It may not persist drafts, write calendar events, edit external files, send messages, or delete data without explicit approval.

### AI curation and personal planning profile

Before enabling the AI planner for normal use, add a deliberate curation step. The goal is not to create a generic chatbot or to fine-tune a model on private activity. Build a versioned server-side planning policy, a user-editable personal planning profile, representative examples, and an evaluation suite. The planner should become more useful by grounding each proposal in the user's stated preferences and observed planning history while leaving every decision reviewable.

#### Planning policy to curate

Create a concise, version-controlled developer prompt that teaches the planner to:

- turn a vague intention into a definition of done, the first physical action, and an optional if–then start cue;
- distinguish a one-step task from a multi-step project and an exploration project from execution work;
- propose 3–7 meaningful steps without exploding work into trivial checklist items;
- use verb-led next actions such as “Open…”, “Email…”, “Call…”, or “Write…”;
- ask one clarification question when missing information would materially change the plan;
- identify dependencies, uncertainty, likely obstacles, energy/context needs, and a practical response;
- prefer the user's duration history over generic estimates and show a range plus confidence;
- schedule against usable capacity, existing commitments, dependencies, energy, earliest-start dates, and true deadlines;
- treat `planned_for_date` as a revisable intention rather than a deadline;
- preserve 30–40 percent reserve by default and avoid filling every available day;
- keep Today to 1–3 commitments and put additional candidates in Available next;
- explain why each date or priority is suggested in one short sentence;
- never choose or overwrite capture priority; priority always comes directly from the user;
- keep the automatic capture assessment to one brief action check, without turning a clear one-step item into a full plan;
- for a new Big Picture plan, reverse-plan from the desired outcome/date into medium-term milestones and the minimum useful short-term tasks, then present all additions as recommendations for review;
- never silently roll work forward or create calendar events for ordinary tasks;
- use supportive, direct language without guilt, diagnosis, fabricated urgency, or productivity scoring.

Keep this policy lean and state each rule once. Store a `prompt_version` with every `agent_run`, and change one prompt or model variable at a time so regressions can be traced. Use structured outputs for the task and schedule proposal schemas rather than parsing prose. The official OpenAI model guidance recommends explicit goals, context, constraints, success criteria, output formats, approval boundaries, and evaluation on representative work: [OpenAI model guidance](https://developers.openai.com/api/docs/guides/latest-model).

#### User-editable personal planning profile

Add a `planning_profiles` owner-scoped table and a Settings → Planning style screen. Start with a short guided setup; every setting remains editable and includes “Use system default.” Suggested fields:

```text
work_days; preferred_work_windows; daily_focus_minutes
reserve_percent; maximum_today_commitments
minimum_task_minutes; preferred_focus_session_minutes
energy_pattern_by_daypart; transition_buffer_minutes
preferred_contexts; avoided_days_or_times
planning_detail: compact | balanced | detailed
breakdown_style: smallest_start | outcome_steps | mixed
prompt_tone: direct | gentle | coaching
reminder_preference; quiet_hours
deadline_buffer_days; weekly_review_day
accessibility_or_attention_preferences optional
updated_at; version
```

Do not ask the user to configure everything before the first plan. Begin with safe defaults, ask at most one preference question at a time, and offer profile changes when a repeated edit reveals a useful pattern. Example: “You shortened four suggested focus sessions to 20 minutes. Make 20 minutes your default?” Apply the change only after confirmation. Allow the user to inspect, edit, reset, export, or delete the profile.

The profile may customize presentation and recommendations, but it may not override hard product policies: external actions still require approval, true deadlines cannot be changed by the model, ordinary tasks stay outside Google Calendar, and the Today commitment limit remains intentionally small.

#### Curated examples

Create a small reviewed example set that shows both good outputs and common failures. Include at least:

- vague task → one clarification question, definition of done, and physical first action;
- broad outcome → exploration project with research, decision criteria, decision date, and first experiment;
- well-defined project → 3–7 steps with dependencies and coarse estimates;
- overloaded week → fewer commitments, explicit reserve, and parked options;
- real deadline around travel → earlier suggested work with a short capacity explanation;
- low-energy day → lower-energy next actions without declaring the user's priorities;
- repeated deferral → shrink/rewrite proposal rather than another silent reschedule;
- incomplete context → assumptions and unknowns instead of invented details;
- calendar event request → preview requiring approval;
- ordinary task scheduling request → app date proposal, not a calendar event.

Keep examples only when they encode a product rule or correct a measured failure. Do not place private notes, attachment contents, tokens, or unnecessary personal history in the static prompt.

#### Capacity-aware scheduling proposal

Scheduling is a separate reviewed draft, not a side effect of task breakdown. Add a server tool such as `propose_task_schedule(task_ids, start_date, end_date)` that returns intentions only. It should:

1. Read accepted tasks, task dependencies, estimate ranges, the planning profile, and current capacity.
2. Protect reserve and transition buffers before allocating task work.
3. Place true-deadline work first, then dependency-constrained work, then user-selected weekly outcomes.
4. Match energy/context when enough information exists; otherwise state the assumption.
5. Limit daily commitments and leave overflow as Available next or unscheduled.
6. Return a short rationale and any capacity conflict for each suggestion.
7. Ask the user to accept, edit, or reject each proposed date or accept the reviewed set.
8. Persist only accepted `planned_for_date` changes and record the approval payload in `planning_sessions` and `agent_runs`.

Suggested structured schedule result:

```json
{
  "summary": "string",
  "assumptions": ["string"],
  "capacity_warnings": ["string"],
  "schedule_drafts": [
    {
      "task_id": "uuid",
      "proposed_date": "YYYY-MM-DD or null",
      "commitment": true,
      "estimated_minutes": 30,
      "rationale": "Short explanation grounded in capacity or dependency",
      "alternatives": ["YYYY-MM-DD"]
    }
  ]
}
```

The UI must show calendar constraints and task intentions as separate layers. Accepting a schedule updates Samwise only. A genuine event uses the separate calendar-event approval flow.

#### Feedback and measured personalization

After the user edits or rejects a breakdown or schedule, capture structured feedback rather than treating the model's output as truth:

```text
too_large; too_small; wrong_order; wrong_date; wrong_energy;
missing_step; unnecessary_step; estimate_low; estimate_high;
not_my_priority; unclear_wording; other
```

Store the proposal, accepted edits, rejection tags, prompt version, model configuration, and eventual outcome. Use aggregate patterns to suggest explicit profile changes and improve future prompts. Do not infer medical traits, hidden priorities, or permanent preferences from a few actions. Do not automatically rewrite the static prompt from live user data.

#### Curation acceptance gate

Do not release personalized planning until:

- the structured schemas validate for all evaluation fixtures;
- breakdowns consistently produce concrete, non-trivial next actions;
- schedule proposals respect dependencies, reserve, true deadlines, and the Today limit;
- missing information produces a question or disclosed assumption rather than invention;
- rejected drafts create no tasks or planned dates;
- changing a planning-profile preference predictably changes relevant proposals;
- external calendar actions always remain separate and approval-gated;
- prompt/model changes run against the same regression fixtures with quality, latency, and cost recorded.

### Server tools

Expose the minimum needed for each run:

```text
read_project_context(project_id)
list_tasks(filters)
read_planning_profile()
get_estimate_profile(category, context)
get_capacity(start_date, end_date)
create_task_drafts(tasks[])        // drafts only
update_task_draft(task_id, patch)  // drafts only
propose_task_schedule(task_ids, start_date, end_date) // drafts only
search_project_attachments(project_id, query)
propose_calendar_event(details)    // approval request only
```

After approval, a separate server action may create the Google Calendar event from an immutable approved payload; it must not use a fresh free-form model response.

### Structured result

```json
{
  "summary": "string",
  "clarifying_question": "string or null",
  "assumptions": ["string"],
  "task_drafts": [
    {
      "title": "string",
      "parent_title": "string or null",
      "next_action": "string",
      "estimated_minutes": 30,
      "energy": "low | medium | high",
      "dependency_titles": ["string"],
      "type": "explore | execute",
      "rationale": "string"
    }
  ],
  "risks_or_unknowns": ["string"],
  "plan_notes": ["string"]
}
```

Use structured outputs and server-side function calling, not parsed free-form checklists. [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs) and [function calling](https://developers.openai.com/api/docs/guides/function-calling) support this design.

Prompt requirements:

- Tasks concrete and completable.
- No trivial task explosion.
- Historical estimates outrank generic intuition.
- Calendar is a capacity constraint, not calendar-task creation.
- Ask rather than invent.
- User accepts drafts before persistence.

Create 20–30 evaluation fixtures before trusting suggestions: vague direction, well-scoped home task, deadline around travel, recurring deferral, little estimate history, and planning from a long note/file.

## Privacy and security

- Enforce row-level security for every owner-scoped record.
- Encrypt OAuth refresh tokens server-side; never place them in IndexedDB.
- Keep attachment storage private and use short-lived signed URLs.
- Maintain a user-visible audit log of agent proposals and external actions.
- Provide export and deletion.
- Require confirmation for calendar writes/edits, external file changes, email/messages, sharing, deletion, purchases, and expanded permissions.
- Read-only is the default connector permission.

## Production deployment setup

Use GitHub for source control and automatic Vercel deployments, Vercel for the HTTPS PWA frontend, and Supabase for Auth, Postgres, Storage, and Edge Functions. GitHub is recommended but not technically required; the Vercel CLI can deploy the project directly.

### 1. Prepare and publish the repository

1. Initialize Git in the project root and commit only source/configuration files.
2. Confirm `.env`, `.env.local`, `node_modules`, and generated `dist` output remain ignored.
3. Create a private GitHub repository named `samwise` and push the `main` branch.
4. Enable branch protection later if other contributors join; version 1 assumes one owner.

Never commit API keys, database passwords, refresh tokens, access tokens, or service-role keys.

### 2. Create the Supabase backend

1. Create one Supabase project and save its project reference and database password in a password manager.
2. In Project Settings → API, copy the Project URL and browser-safe publishable/anon key.
3. Authenticate and link the local CLI:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

4. Preview and apply the committed migration:

```powershell
npx supabase db push --dry-run
npx supabase db push
```

5. Deploy the authenticated sync function:

```powershell
npx supabase functions deploy sync
```

6. Verify the tables, row-level-security policies, private `attachments` bucket, and `sync` function in the Supabase dashboard.
7. Keep JWT verification enabled for `sync`; the client sends the signed-in user's access token and all database writes remain scoped by RLS.

### 3. Configure Supabase Auth

1. Enable email/password authentication. Decide whether email confirmation is required for the initial private test.
2. After the first Vercel production deployment, set Auth → URL Configuration → Site URL to the final HTTPS production URL.
3. Add `http://localhost:5173/**` for local development.
4. Optionally add the documented Vercel preview pattern for the account/team so confirmation links work on preview deployments.
5. Test create account, email confirmation if enabled, sign in, sign out, session refresh, and cross-account RLS isolation.

### 4. Deploy the frontend to Vercel

1. In Vercel, choose New Project and import the GitHub repository.
2. Use the Vite framework preset, repository root as Root Directory, `npm run build` as Build Command, and `dist` as Output Directory. Vercel normally detects these automatically.
3. Add the following to Development, Preview, and Production as appropriate:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_BROWSER_SAFE_PUBLISHABLE_KEY
```

4. Deploy. Environment-variable changes affect only new deployments, so redeploy after changing them.
5. Preserve `vercel.json`; its SPA fallback lets direct visits to `/today`, `/projects`, and `/focus/:id` load the React application.
6. Set the resulting production URL in Supabase Auth before testing account confirmation.

Only browser-safe values may use the `VITE_` prefix because Vite includes them in client assets. OpenAI API keys, Supabase secret/service-role keys, Google client secrets, and OAuth refresh tokens belong only in Supabase Edge Function secrets.

### 5. Verify on phone

1. Open the Vercel HTTPS URL in Safari or Chrome on the phone.
2. Create/sign into the same account used on desktop.
3. Install with Add to Home Screen/Install app.
4. Capture and clarify a task, then enable airplane mode and reload the installed app.
5. Complete or defer the task offline and confirm the UI says Saved offline.
6. Reconnect and trigger sync; confirm the same result appears on desktop.
7. Test a direct deep link, focus timer, second-deferral intervention, and the three-commitment Today limit.

### 6. Add later API secrets only when their milestone ships

- OpenAI: store `OPENAI_API_KEY` only as a Supabase Edge Function secret when Milestone 5 begins.
- Google Calendar: store OAuth client secrets and encrypted refresh-token references only server-side when Milestone 4 begins.
- Never add either secret to Vercel's `VITE_` environment or IndexedDB.

Deployment acceptance: the production URL loads over HTTPS, authentication redirects correctly, the PWA installs, the shell opens offline, authenticated mutations sync through the Edge Function, and a second account cannot read the first account's records.

## Delivery roadmap

### Milestone 0 — foundation

- Repository, linting, formatting, test runner, CI, environment template.
- Supabase Auth, migrations, row-level security, private storage.
- Mobile navigation, web manifest, service worker, IndexedDB abstraction.

Acceptance: user signs in, installs the PWA, and opens a usable shell offline.

### Milestone 1 — trustworthy daily loop

- Areas, projects, tasks, subtasks, Inbox, Today.
- Completion, Focus mode timer/manual time logging, defer decisions, and “I’m stuck” recovery choices.
- Local-first CRUD, outbox, sync endpoint, conflict tests.
- Manual daily capacity settings.

Acceptance: create/complete/defer a task offline on device A, reconnect, and see correct state on device B; start a single task from Today without navigating a backlog.

### Milestone 2 — planning horizons

- Directions, goals, milestones, notes, attachments.
- Exploration mode plus a Long-term map.
- Daily close, weekly reset, and quarterly review.
- Seven-day capacity planning.
- Required second-deferral intervention.

Acceptance: vague long-term aim becomes exploration project, milestone, and actionable first task.

### Milestone 3 — duration learning

- Event log and estimate profiles.
- Range/confidence interface and insights.
- Capacity recommendations informed by actual time.

Acceptance: five comparable completed tasks produce an explainable suggested range.

### Milestone 4 — calendar constraints

- Google OAuth, selected read-only calendars, cache, privacy mode.
- Travel/all-day capacity effects.
- User-confirmed real-event creation.

Acceptance: a trip reduces capacity but normal tasks never appear on Google Calendar; a genuine event is previewed and created only after confirmation.

### Milestone 5 — AI planner

- Server agent endpoint, schema validation, draft-review UI, audit record.
- Versioned planning policy, curated good/failure examples, and prompt/model configuration tracking.
- User-editable personal planning profile with guided setup, safe defaults, reset/export/delete, and confirmed preference suggestions.
- Project breakdown, deferred-task rewrite, and capacity-aware weekly schedule drafts.
- Per-task and bulk review of proposed dates; persist only accepted task intentions.
- Structured rejection/edit feedback and measured personalization without continuous fine-tuning.
- Evaluation fixtures, regression tests, and a curation acceptance gate before normal use.

Acceptance: the agent shows assumptions/unknowns, follows the user's planning profile, proposes an explainable feasible week, and persists only accepted task and schedule drafts. Changing one profile preference produces the expected change in representative fixtures without weakening approval or calendar boundaries.

### Milestone 6 — optional connectors

Consider Notion import/linking, Drive search, email drafting, and approved actions only after the core weekly planning loop is valuable.

## Test plan

### Unit

- Estimate/confidence calculations.
- Capacity for busy events, all-day travel, buffers, reserve.
- Rollover state transitions.
- Sync merge rules.
- Permission and approval guards.

### Integration

- RLS prevents cross-account access.
- Offline outbox syncs after reconnection.
- Two-device concurrent update follows conflict policy.
- Calendar creation requires approval record.
- Agent output validates against schema.

### End-to-end

1. Capture an Inbox item on phone offline.
2. Process it on desktop into a project/task after reconnecting.
3. Log focused time and complete it.
4. Check estimate on later comparable task.
5. Connect Calendar and verify travel reduces capacity.
6. Ask agent for drafts; accept two and reject one; verify only accepted drafts persist.

## Definition of done for version 1

A user can capture a task in under ten seconds, use the PWA offline, receive automatic cross-device sync, see a realistic Today list with no silent rollover, log actual time in two interactions, maintain project notes/files, run weekly/quarterly reviews, receive explainable duration/capacity guidance, ask for reviewed task drafts, and view calendar constraints without calendar pollution.

## Research notes behind the design

- Adult ADHD time perception/time-management research supports treating estimates as uncertain and personalized rather than authoritative. [Mette, 2023 review](https://pubmed.ncbi.nlm.nih.gov/36833791/)
- A pragmatic randomized trial found time-management/organization/planning interventions clinically useful for adults with impaired time management, although it does **not** prove that an app alone produces the same result. [Lidström Holmqvist et al., 2026](https://pubmed.ncbi.nlm.nih.gov/41527987/)
- Implementation intentions (“if situation X, then I will do Y”) have meta-analytic support for improving goal attainment in clinical and analogue populations. [Toli, Webb & Hardy](https://pubmed.ncbi.nlm.nih.gov/25965276/)
- Mental contrasting plus implementation intentions has a small-to-moderate average effect on goal attainment; it informs the obstacle/response prompt for long-term planning. [Wang, Wang & Gai](https://pubmed.ncbi.nlm.nih.gov/34054628/)
- The evidence does not establish a single best productivity app, a universally optimal notification schedule, or that gamification/body doubling should be default features. Samwise should test these features with the user and keep them optional.

## Autonomous full-build execution contract

For a one-request implementation, work on `codex/full-v1`, preserve existing data through additive migrations, and execute Milestones 0–5 through their acceptance gates. Codex may make reversible implementation decisions, install dependencies, run tests, deploy Supabase migrations/functions, push the working branch, and create a Vercel preview. It pauses only for secrets or consent that must come from the account owner, destructive data operations, or final production promotion. Compilation alone is not acceptance: run unit, security, production-build, offline/sync, and representative planner-fixture checks. Never place server secrets in `VITE_` variables, source control, IndexedDB, logs, or chat.

Required owner handoffs are limited to:

1. Add `OPENAI_API_KEY` as a Supabase Edge Function secret.
2. Create Google OAuth web credentials, register the documented callback URL, and add the Google server secrets.
3. Complete Google consent and cross-device phone verification.
4. Approve the tested preview before promotion to `main`.

## First Codex prompt

> Build Milestone 0 and Milestone 1 from personal-planner-build-guide.md. Use React, TypeScript, Vite, Tailwind, Supabase, Dexie/IndexedDB, and a service worker. Implement a standalone local-first PWA; do not integrate Notion, Google Calendar, or AI yet. Add schema migrations with row-level security, device IDs, operation-log sync endpoint, offline outbox, task/project CRUD, Inbox, Today, completion/time logging, and mandatory defer-decision flow. Test sync conflicts and rollover states. Write a concise README with setup, environment variables, and test commands. Do not add dashboards, collaboration, or arbitrary database features.
