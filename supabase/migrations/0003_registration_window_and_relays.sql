-- Registration window per competition, and the mandatory "wants relay?"
-- question asked once per athlete per competition.

alter table public.competitions
  add column registration_start date,
  add column registration_end date;

create or replace function public.registration_open(p_competition_event_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (
      select (c.registration_start is null or current_date >= c.registration_start)
         and (c.registration_end is null or current_date <= c.registration_end)
      from public.competition_events ce
      join public.competitions c on c.id = ce.competition_id
      where ce.id = p_competition_event_id
    ),
    false
  );
$$;

drop policy "athlete can register self" on public.registrations;

create policy "athlete can register self"
  on public.registrations for insert
  with check (auth.uid() = athlete_id and public.registration_open(competition_event_id));

create table public.competition_relay_responses (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.profiles (id) on delete cascade,
  competition_id uuid not null references public.competitions (id) on delete cascade,
  wants_relay boolean not null,
  created_at timestamptz not null default now(),
  unique (athlete_id, competition_id)
);

alter table public.competition_relay_responses enable row level security;

create policy "athlete can view own relay response"
  on public.competition_relay_responses for select
  using (auth.uid() = athlete_id);

create policy "athlete can set own relay response"
  on public.competition_relay_responses for insert
  with check (auth.uid() = athlete_id);

create policy "athlete can update own relay response"
  on public.competition_relay_responses for update
  using (auth.uid() = athlete_id)
  with check (auth.uid() = athlete_id);

create policy "coach manages relay responses"
  on public.competition_relay_responses for all
  using (public.is_coach())
  with check (public.is_coach());
