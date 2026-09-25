-- Circuito Especialista Master (CEM): resultados nacionais importados dos
-- ficheiros LENEX (.lef/.lxf) que a FPN distribui por prova. Ao contrário
-- de "competitions" (só as provas em que o SC Braga participa), aqui
-- guardamos TODOS os nadadores de TODOS os clubes de cada prova importada,
-- porque o ranking do CEM coloca todas as nadadoras/nadadores Master em
-- competição direta, independentemente do clube.

create table public.cem_clubs (
  id uuid primary key default gen_random_uuid(),
  lenex_code text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.cem_clubs enable row level security;

create policy "coach manages cem clubs"
  on public.cem_clubs for all
  using (public.is_coach())
  with check (public.is_coach());

-- Uma nadadora/nadador identificada pela licença FPN (chave estável entre
-- provas). Quando a licença corresponde a alguém do plantel do SC Braga,
-- fica ligada a "roster_athletes" para cruzar dados facilmente.
create table public.cem_swimmers (
  id uuid primary key default gen_random_uuid(),
  license text not null unique,
  first_name text not null,
  last_name text not null,
  birth_date date,
  gender text check (gender in ('M', 'F')),
  nation text,
  roster_athlete_id uuid references public.roster_athletes (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.cem_swimmers enable row level security;

create policy "coach manages cem swimmers"
  on public.cem_swimmers for all
  using (public.is_coach())
  with check (public.is_coach());

create table public.cem_meets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  course text check (course in ('SCM', 'LCM')),
  organizer text,
  start_date date not null,
  end_date date,
  -- Conta para o Circuito Especialista Master (só provas de Clubes/AT's,
  -- não os Campeonatos Nacionais organizados diretamente pela FPN).
  -- Pré-preenchido na importação a partir do organizador, mas editável.
  counts_for_cem boolean not null default false,
  source_file text,
  created_at timestamptz not null default now(),
  unique (name, start_date)
);

alter table public.cem_meets enable row level security;

create policy "coach manages cem meets"
  on public.cem_meets for all
  using (public.is_coach())
  with check (public.is_coach());

create table public.cem_events (
  id uuid primary key default gen_random_uuid(),
  meet_id uuid not null references public.cem_meets (id) on delete cascade,
  lenex_eventid text not null,
  gender text not null check (gender in ('M', 'F', 'X')),
  distance int not null,
  stroke text not null check (stroke in ('FREE', 'BACK', 'BREAST', 'FLY', 'MEDLEY')),
  relaycount int not null default 1,
  created_at timestamptz not null default now(),
  unique (meet_id, lenex_eventid)
);

alter table public.cem_events enable row level security;

create policy "coach manages cem events"
  on public.cem_events for all
  using (public.is_coach())
  with check (public.is_coach());

-- Escalão etário tal como definido pelo software de cronometragem da
-- prova. Guardado por referência/histórico; o cálculo do ranking do CEM
-- usa o escalão canónico (lib/escalao.ts) a partir da data de nascimento,
-- para não depender de como cada organização agrupou os escalões.
create table public.cem_agegroups (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.cem_events (id) on delete cascade,
  lenex_agegroupid text not null,
  age_min int,
  age_max int,
  created_at timestamptz not null default now(),
  unique (event_id, lenex_agegroupid)
);

alter table public.cem_agegroups enable row level security;

create policy "coach manages cem agegroups"
  on public.cem_agegroups for all
  using (public.is_coach())
  with check (public.is_coach());

create table public.cem_results (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.cem_events (id) on delete cascade,
  agegroup_id uuid references public.cem_agegroups (id) on delete set null,
  swimmer_id uuid not null references public.cem_swimmers (id) on delete cascade,
  club_id uuid references public.cem_clubs (id) on delete set null,
  -- Lugar dentro do escalão tal como saiu no ficheiro da prova (referência).
  place_in_file int,
  swimtime text,
  entrytime text,
  entrycourse text,
  -- Pontos da tabela DSV/AQUA (points= no RESULT do LENEX), usados nas
  -- classificações individuais das provas Open/CN — não é a pontuação do
  -- CEM em si, essa é calculada por lugar (ver lib/cem-ranking.ts).
  dsv_points int,
  lenex_resultid text,
  created_at timestamptz not null default now(),
  unique (event_id, swimmer_id)
);

alter table public.cem_results enable row level security;

create policy "coach manages cem results"
  on public.cem_results for all
  using (public.is_coach())
  with check (public.is_coach());

create index cem_results_swimmer_id_idx on public.cem_results (swimmer_id);
create index cem_results_event_id_idx on public.cem_results (event_id);

-- Contagens por prova para a listagem no backoffice, sem ter de puxar
-- todas as linhas de resultados para o cliente (que facilmente passa das
-- 1000 linhas por defeito do PostgREST nas provas maiores, tipo Inverno).
-- security_invoker garante que continua a respeitar as policies de RLS
-- das tabelas base, em vez de correr com os privilégios de quem criou a view.
create view public.cem_meet_stats
  with (security_invoker = true)
  as
  select
    m.id as meet_id,
    count(distinct r.swimmer_id) as swimmers_count,
    count(distinct r.club_id) as clubs_count,
    count(r.id) as results_count
  from public.cem_meets m
  left join public.cem_events e on e.meet_id = m.id
  left join public.cem_results r on r.event_id = e.id
  group by m.id;
