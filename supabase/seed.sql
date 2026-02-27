-- 5 test tickets (run after 001_initial_schema.sql)
-- Run in Supabase SQL Editor or: supabase db reset (applies migrations + seed)

insert into public.tickets (building, priority, status, time_entered)
values
  ('North Campus', 'high', 'open', now() - interval '2 hours'),
  ('Main Office', 'medium', 'in_progress', now() - interval '1 day'),
  ('Warehouse B', 'low', 'open', now() - interval '3 hours'),
  ('East Wing', 'high', 'pending_approval', now() - interval '5 days'),
  ('South Building', 'medium', 'approved', now() - interval '1 week');
