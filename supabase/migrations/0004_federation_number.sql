alter table public.profiles add column federation_number text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, phone, birth_date, club, notes, federation_number)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'athlete'),
    new.raw_user_meta_data ->> 'phone',
    nullif(new.raw_user_meta_data ->> 'birth_date', '')::date,
    new.raw_user_meta_data ->> 'club',
    new.raw_user_meta_data ->> 'notes',
    new.raw_user_meta_data ->> 'federation_number'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
