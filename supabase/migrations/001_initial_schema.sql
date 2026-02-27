-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'staff' check (role in ('manager', 'staff')),
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create profile on signup; first user in the corporation is a manager
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

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Tickets
create table if not exists public.tickets (
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

-- Company settings (single row)
create table if not exists public.company_settings (
  id uuid primary key default gen_random_uuid(),
  name text,
  address text,
  support_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Insert default company row if empty
insert into public.company_settings (name)
select 'My Company'
where not exists (select 1 from public.company_settings limit 1);

-- RLS
alter table public.profiles enable row level security;
alter table public.tickets enable row level security;
alter table public.company_settings enable row level security;

-- Profiles: authenticated can read all
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

-- Profiles: users can update own row
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Tickets: authenticated can read
create policy "Tickets are viewable by authenticated users"
  on public.tickets for select
  to authenticated
  using (true);

-- Tickets: authenticated can insert
create policy "Tickets are insertable by authenticated users"
  on public.tickets for insert
  to authenticated
  with check (true);

-- Tickets: managers can update (for status, assign, approve)
create policy "Managers can update tickets"
  on public.tickets for update
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'manager')
  );

-- Company settings: authenticated can read
create policy "Company settings are viewable by authenticated users"
  on public.company_settings for select
  to authenticated
  using (true);

-- Company settings: managers can update
create policy "Managers can update company settings"
  on public.company_settings for update
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'manager')
  );

-- Optional: allow insert for first row
create policy "Managers can insert company settings"
  on public.company_settings for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'manager')
  );
