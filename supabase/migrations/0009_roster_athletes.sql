-- Plantel / licenças federativas: um registo por atleta licenciada na FPN,
-- independente de ter (ou não) conta de acesso à app. Diferente de
-- "profiles", que só existe para quem foi convidada e tem login.

create table public.roster_athletes (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  gender text check (gender in ('M', 'F')),
  birth_date date,
  federation_number text unique,
  club text not null default 'Sporting Clube de Braga',
  notes text,
  created_at timestamptz not null default now()
);

alter table public.roster_athletes enable row level security;

create policy "coach manages roster athletes"
  on public.roster_athletes for all
  using (public.is_coach())
  with check (public.is_coach());
