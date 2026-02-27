-- Add "awaiting" status to tickets
alter table public.tickets
  drop constraint if exists tickets_status_check;

alter table public.tickets
  add constraint tickets_status_check
  check (status in ('open', 'in_progress', 'awaiting', 'pending_approval', 'approved'));
