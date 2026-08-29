-- Multi-day planning: a task can be scheduled onto several work days.
-- planned_for_date remains the first day; planned_for_dates holds them all.
alter table public.tasks add column if not exists planned_for_dates jsonb;
