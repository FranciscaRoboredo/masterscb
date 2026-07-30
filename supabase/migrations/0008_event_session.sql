alter table public.competition_events
  add column session text check (session in ('manha', 'tarde'));
