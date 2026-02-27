-- Set the first-ever member (earliest created profile) to manager when none exist yet.
-- Run this once if you already have users; new signups are handled by the trigger.
update public.profiles
set role = 'manager', updated_at = now()
where id = (
  select id from public.profiles
  order by created_at asc
  limit 1
)
and not exists (select 1 from public.profiles where role = 'manager');
