-- Competitions can span multiple days, events happen on a specific day
-- within that range, and competitions start as drafts (only visible to
-- the coach) until explicitly published to athletes.

alter table public.competitions rename column date to start_date;
alter table public.competitions add column end_date date;
update public.competitions set end_date = start_date where end_date is null;
alter table public.competitions alter column end_date set not null;

alter table public.competitions add column published boolean not null default false;

alter table public.competition_events add column event_date date;
update public.competition_events ce
  set event_date = c.start_date
  from public.competitions c
  where c.id = ce.competition_id and ce.event_date is null;
alter table public.competition_events alter column event_date set not null;

drop policy "authenticated can view competitions" on public.competitions;

create policy "authenticated can view published competitions"
  on public.competitions for select
  using (published = true);

drop policy "authenticated can view competition events" on public.competition_events;

create policy "authenticated can view events of published competitions"
  on public.competition_events for select
  using (
    exists (
      select 1 from public.competitions c
      where c.id = competition_id and c.published = true
    )
  );

create or replace function public.registration_open(p_competition_event_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (
      select c.published
         and (c.registration_start is null or current_date >= c.registration_start)
         and (c.registration_end is null or current_date <= c.registration_end)
      from public.competition_events ce
      join public.competitions c on c.id = ce.competition_id
      where ce.id = p_competition_event_id
    ),
    false
  );
$$;
