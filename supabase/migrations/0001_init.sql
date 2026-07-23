-- Roles: coach (treinadora, acesso total) and athlete (acesso ao próprio perfil).
create type public.user_role as enum ('coach', 'athlete');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role public.user_role not null default 'athlete',
  phone text,
  birth_date date,
  club text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- SECURITY DEFINER helper so RLS policies can check the caller's role
-- without recursively re-evaluating the profiles policies.
create or replace function public.is_coach()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'coach'
  );
$$;

-- Coach: full access to every profile.
create policy "coach can view all profiles"
  on public.profiles for select
  using (public.is_coach());

create policy "coach can insert profiles"
  on public.profiles for insert
  with check (public.is_coach());

create policy "coach can update all profiles"
  on public.profiles for update
  using (public.is_coach());

create policy "coach can delete profiles"
  on public.profiles for delete
  using (public.is_coach());

-- Athlete: only their own profile, read and limited self-update.
create policy "athlete can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "athlete can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = 'athlete');

-- Auto-create a profile row whenever a new auth user is created
-- (coach signup, or an athlete invited from the backoffice).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, phone, birth_date, club, notes)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'athlete'),
    new.raw_user_meta_data ->> 'phone',
    nullif(new.raw_user_meta_data ->> 'birth_date', '')::date,
    new.raw_user_meta_data ->> 'club',
    new.raw_user_meta_data ->> 'notes'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
