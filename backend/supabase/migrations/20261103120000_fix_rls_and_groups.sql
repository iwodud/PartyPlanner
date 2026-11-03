-- Poprawki do schematu początkowego (task #8)

-- 1. Bezpieczniejsza funkcja triggera rejestracji (stały search_path dla security definer)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer set search_path = '';

-- 2. Właściciel grupy zawsze jest jej członkiem, a lista członków nie ma duplikatów
create or replace function public.ensure_owner_is_member()
returns trigger as $$
begin
  if not (new.owner_id = any(new.members)) then
    new.members := array_append(new.members, new.owner_id);
  end if;
  new.members := array(select distinct unnest(new.members));
  return new;
end;
$$ language plpgsql set search_path = '';

create trigger on_group_upsert_ensure_owner
  before insert or update of owner_id, members on public.groups
  for each row execute procedure public.ensure_owner_is_member();

create index groups_members_idx on public.groups using gin (members);

-- 3. Profile: zamiast wszystkich zalogowanych, widoczny własny profil i profile członków wspólnych grup
drop policy "Zalogowani użytkownicy mogą czytać profile" on public.profiles;

create policy "Użytkownik widzi własny profil i członków swoich grup"
  on public.profiles for select
  to authenticated
  using (
    auth.uid() = id or
    exists (
      select 1 from public.groups g
      where auth.uid() = any(g.members) and profiles.id = any(g.members)
    )
  );

drop policy "Użytkownicy mogą edytować własny profil" on public.profiles;

create policy "Użytkownicy mogą edytować własny profil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4. Grupy: polityki tylko dla zalogowanych, właściciel nie może oddać grupy przez update, dodane usuwanie
drop policy "Dostęp do grup dla właścicieli i członków" on public.groups;
drop policy "Użytkownik może tworzyć grupy" on public.groups;
drop policy "Tylko właściciel edytuje grupę" on public.groups;

create policy "Dostęp do grup dla właścicieli i członków"
  on public.groups for select
  to authenticated
  using (auth.uid() = owner_id or auth.uid() = any(members));

create policy "Użytkownik może tworzyć grupy"
  on public.groups for insert
  to authenticated
  with check (auth.uid() = owner_id);

create policy "Tylko właściciel edytuje grupę"
  on public.groups for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Tylko właściciel usuwa grupę"
  on public.groups for delete
  to authenticated
  using (auth.uid() = owner_id);
