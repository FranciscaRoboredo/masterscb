-- Competitions become visible to everyone as soon as they're created
-- (name + dates only, for calendar purposes) even while still a draft.
-- The individual events/distances (and therefore registration) stay
-- gated to published competitions via the existing
-- "authenticated can view events of published competitions" policy.

drop policy "authenticated can view published competitions" on public.competitions;

create policy "authenticated can view competitions"
  on public.competitions for select
  using (auth.uid() is not null);

-- Storage bucket for per-competition "convocatórias" (call-up sheet PDFs).
-- Private bucket: read allowed for any authenticated user, upload/delete
-- restricted to the coach. Files are stored under "<competition_id>/<filename>".

insert into storage.buckets (id, name, public)
values ('convocatorias', 'convocatorias', false)
on conflict (id) do nothing;

create policy "authenticated can read convocatorias"
  on storage.objects for select
  using (bucket_id = 'convocatorias' and auth.uid() is not null);

create policy "coach can upload convocatorias"
  on storage.objects for insert
  with check (bucket_id = 'convocatorias' and public.is_coach());

create policy "coach can delete convocatorias"
  on storage.objects for delete
  using (bucket_id = 'convocatorias' and public.is_coach());
