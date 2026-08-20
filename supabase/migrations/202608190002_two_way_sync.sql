alter table public.sync_operations
  add column server_sequence bigint generated always as identity;

create unique index sync_operations_owner_sequence_idx
  on public.sync_operations(owner_id, server_sequence);

create index sync_operations_owner_processed_idx
  on public.sync_operations(owner_id, processed_at, server_sequence);
