# PartyPlanner – backend (Supabase)

Backend opiera się na Supabase: uwierzytelnianie e-mail + hasło (Supabase Auth) oraz baza Postgres z Row Level Security.

## Struktura danych

- `profiles` (`id`, `email`, `display_name`, `created_at`) – profil tworzony automatycznie triggerem po rejestracji w `auth.users`.
- `groups` (`id`, `name`, `owner_id`, `members uuid[]`, `created_at`) – właściciel jest zawsze dopisywany do `members`.

## Zasady dostępu (RLS)

- Profil: użytkownik widzi własny profil i profile osób, z którymi jest w grupie; edytuje tylko własny.
- Grupy: widoczne dla członków; tworzyć może każdy zalogowany (jako właściciel); edytować i usuwać tylko właściciel.

## Migracje

Pliki w `supabase/migrations/` mają format `<timestamp>_<nazwa>.sql` i są stosowane w kolejności:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Jeśli schemat początkowy był już wykonany ręcznie w SQL Editorze, uruchom tylko nowsze migracje (np. `20261103120000_fix_rls_and_groups.sql`).
