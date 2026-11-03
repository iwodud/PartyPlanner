-- Dołączanie do grup przez kod zaproszenia (epik #2)

-- 1. Kod zaproszenia: 8 znaków, unikalny, generowany automatycznie
create or replace function public.generate_invite_code()
returns text as $$
  select upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$ language sql volatile set search_path = '';

-- Istniejące grupy dostają kod przy dodaniu kolumny (domyślna wartość liczona dla każdego wiersza)
alter table public.groups
  add column invite_code text not null unique default public.generate_invite_code();

-- 2. Dołączanie do grupy po kodzie.
-- security definer, bo RLS nie pozwala nie-członkom ani czytać, ani edytować grupy.
-- Funkcja jest idempotentna: członek, który dołącza ponownie, dostaje po prostu id grupy.
create or replace function public.join_group(p_code text)
returns uuid as $$
declare
  v_user_id uuid := auth.uid();
  v_group_id uuid;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select id into v_group_id
  from public.groups
  where invite_code = upper(trim(p_code));

  if v_group_id is null then
    raise exception 'invalid_invite_code';
  end if;

  update public.groups
  set members = array_append(members, v_user_id)
  where id = v_group_id and not (v_user_id = any(members));

  return v_group_id;
end;
$$ language plpgsql security definer set search_path = '';

-- 3. Opuszczanie grupy (właściciel nie może opuścić własnej grupy, może ją usunąć)
create or replace function public.leave_group(p_group_id uuid)
returns void as $$
declare
  v_user_id uuid := auth.uid();
  v_owner_id uuid;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select owner_id into v_owner_id
  from public.groups
  where id = p_group_id and v_user_id = any(members);

  if v_owner_id is null then
    raise exception 'not_a_member';
  end if;

  if v_owner_id = v_user_id then
    raise exception 'owner_cannot_leave';
  end if;

  update public.groups
  set members = array_remove(members, v_user_id)
  where id = p_group_id;
end;
$$ language plpgsql security definer set search_path = '';

-- 4. Nowy kod zaproszenia (np. gdy stary wyciekł). Działa z uprawnieniami wywołującego,
-- więc RLS sam ogranicza zmianę do właściciela.
create or replace function public.regenerate_invite_code(p_group_id uuid)
returns text as $$
declare
  v_code text;
begin
  update public.groups
  set invite_code = public.generate_invite_code()
  where id = p_group_id and owner_id = auth.uid()
  returning invite_code into v_code;

  if v_code is null then
    raise exception 'not_group_owner';
  end if;

  return v_code;
end;
$$ language plpgsql set search_path = '';

-- 5. Funkcje dostępne tylko dla zalogowanych
revoke execute on function public.join_group(text) from public, anon;
revoke execute on function public.leave_group(uuid) from public, anon;
revoke execute on function public.regenerate_invite_code(uuid) from public, anon;
grant execute on function public.join_group(text) to authenticated;
grant execute on function public.leave_group(uuid) to authenticated;
grant execute on function public.regenerate_invite_code(uuid) to authenticated;
