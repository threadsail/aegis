-- Rebuild Supabase database to match the app schema (DESTRUCTIVE – use on empty or throwaway DB).
-- Run in Supabase Dashboard: SQL Editor → New query → paste this file → Run.

begin;

-- 1. Drop existing objects (reverse order of creation)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.tickets cascade;
drop table if exists public.company_settings cascade;
drop table if exists public.profiles cascade;

-- 2. Migration 001: Initial schema
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'staff' check (role in ('manager', 'staff')),
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
declare
  first_role text := 'staff';
begin
  if (select count(*) from public.profiles) = 0 then
    first_role := 'manager';
  end if;
  insert into public.profiles (id, role)
  values (new.id, first_role);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  time_entered timestamptz not null default now(),
  submitted_by uuid references auth.users(id),
  building text not null,
  priority text not null default 'medium',
  assigned uuid references auth.users(id),
  status text not null default 'open' check (status in ('open', 'in_progress', 'pending_approval', 'approved')),
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_settings (
  id uuid primary key default gen_random_uuid(),
  name text,
  address text,
  support_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.company_settings (name)
select 'My Company'
where not exists (select 1 from public.company_settings limit 1);

alter table public.profiles enable row level security;
alter table public.tickets enable row level security;
alter table public.company_settings enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select to authenticated using (true);
create policy "Users can update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

create policy "Tickets are viewable by authenticated users"
  on public.tickets for select to authenticated using (true);
create policy "Tickets are insertable by authenticated users"
  on public.tickets for insert to authenticated with check (true);
create policy "Managers can update tickets"
  on public.tickets for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'manager'));

create policy "Company settings are viewable by authenticated users"
  on public.company_settings for select to authenticated using (true);
create policy "Managers can update company settings"
  on public.company_settings for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'manager'));
create policy "Managers can insert company settings"
  on public.company_settings for insert to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'manager'));

-- 3. Migration 002: First user as manager (no-op if no profiles yet)
update public.profiles
set role = 'manager', updated_at = now()
where id = (select id from public.profiles order by created_at asc limit 1)
  and not exists (select 1 from public.profiles where role = 'manager');

-- 4. Migration 003: Add "awaiting" status
alter table public.tickets drop constraint if exists tickets_status_check;
alter table public.tickets
  add constraint tickets_status_check
  check (status in ('open', 'in_progress', 'awaiting', 'pending_approval', 'approved'));

-- 5. Seed: sample tickets
insert into public.tickets (building, priority, status, time_entered)
values
  ('North Campus', 'high', 'open', now() - interval '2 hours'),
  ('Main Office', 'medium', 'in_progress', now() - interval '1 day'),
  ('Warehouse B', 'low', 'open', now() - interval '3 hours'),
  ('East Wing', 'high', 'pending_approval', now() - interval '5 days'),
  ('South Building', 'medium', 'approved', now() - interval '1 week');

commit;
