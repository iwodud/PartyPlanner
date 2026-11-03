-- 1. Tabela profilów użytkowników (odpowiednik kolekcji users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabela grup (odpowiednik kolekcji groups)
create table public.groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  members uuid[] default array[]::uuid[] not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Automatyczne tworzenie rekordu w public.profiles po rejestracji w Supabase Auth
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
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Włączenie RLS dla obu tabel
alter table public.profiles enable row level security;
alter table public.groups enable row level security;

-- 5. Polityki RLS dla tabeli profiles
create policy "Zalogowani użytkownicy mogą czytać profile"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Użytkownicy mogą edytować własny profil"
  on public.profiles for update
  using (auth.uid() = id);

-- 6. Polityki RLS dla tabeli groups
create policy "Dostęp do grup dla właścicieli i członków"
  on public.groups for select
  using (
    auth.uid() = owner_id or 
    auth.uid() = any(members)
  );

create policy "Użytkownik może tworzyć grupy"
  on public.groups for insert
  with check (auth.uid() = owner_id);

create policy "Tylko właściciel edytuje grupę"
  on public.groups for update
  using (auth.uid() = owner_id);