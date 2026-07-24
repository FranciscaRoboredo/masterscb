-- Competitions ("provas") and their individual events, athlete
-- registrations, results, and the daily training/material notice.

create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  date date not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.competitions enable row level security;

create policy "authenticated can view competitions"
  on public.competitions for select
  using (auth.uid() is not null);

create policy "coach manages competitions"
  on public.competitions for all
  using (public.is_coach())
  with check (public.is_coach());

create table public.competition_events (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  name text not null,
  event_time time,
  created_at timestamptz not null default now()
);

alter table public.competition_events enable row level security;

create policy "authenticated can view competition events"
  on public.competition_events for select
  using (auth.uid() is not null);

create policy "coach manages competition events"
  on public.competition_events for all
  using (public.is_coach())
  with check (public.is_coach());

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.profiles (id) on delete cascade,
  competition_event_id uuid not null references public.competition_events (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (athlete_id, competition_event_id)
);

alter table public.registrations enable row level security;

create policy "athlete can view own registrations"
  on public.registrations for select
  using (auth.uid() = athlete_id);

create policy "athlete can register self"
  on public.registrations for insert
  with check (auth.uid() = athlete_id);

create policy "athlete can cancel own registration"
  on public.registrations for delete
  using (auth.uid() = athlete_id);

create policy "coach manages all registrations"
  on public.registrations for all
  using (public.is_coach())
  with check (public.is_coach());

create table public.results (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.profiles (id) on delete cascade,
  competition_event_id uuid not null references public.competition_events (id) on delete cascade,
  time text,
  position int,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.results enable row level security;

create policy "athlete can view own results"
  on public.results for select
  using (auth.uid() = athlete_id);

create policy "coach manages results"
  on public.results for all
  using (public.is_coach())
  with check (public.is_coach());

create table public.daily_trainings (
  id uuid primary key default gen_random_uuid(),
  training_date date not null unique,
  dry_land_training text,
  material text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.daily_trainings enable row level security;

create policy "authenticated can view daily trainings"
  on public.daily_trainings for select
  using (auth.uid() is not null);

create policy "coach manages daily trainings"
  on public.daily_trainings for all
  using (public.is_coach())
  with check (public.is_coach());
