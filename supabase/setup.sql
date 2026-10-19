-- Bootstrap a NEW Supabase project in the SQL Editor. This is not an existing-data migration.
begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text check (name is null or (length(btrim(name)) between 1 and 100)),
  sex text check (sex is null or sex in ('female', 'male', 'other')),
  age integer check (age is null or age between 1 and 120),
  terme_condition boolean not null default false,
  agree boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on public.profiles from public, anon, authenticated;
grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant insert (id) on public.profiles to authenticated;
grant update (name, sex, age, terme_condition, agree) on public.profiles to authenticated;

create policy profiles_select_own on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy profiles_insert_own on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

commit;
