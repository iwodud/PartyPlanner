# PartyPlanner – backend (Supabase)

Backend opiera się na Supabase: uwierzytelnianie e-mail + hasło (Supabase Auth) oraz baza Postgres z Row Level Security.

## Struktura danych

- `profiles` (`id`, `email`, `display_name`, `created_at`) – profil tworzony automatycznie triggerem po rejestracji w `auth.users`.
- `groups` (`id`, `name`, `owner_id`, `members uuid[]`, `invite_code`, `created_at`) – właściciel jest zawsze dopisywany do `members`, `invite_code` (8 znaków) generuje się automatycznie.

## Zasady dostępu (RLS)

- Profil: użytkownik widzi własny profil i profile osób, z którymi jest w grupie; edytuje tylko własny.
- Grupy: widoczne dla członków; tworzyć może każdy zalogowany (jako właściciel); edytować i usuwać tylko właściciel.

## Funkcje (RPC)

Wywoływane z frontendu przez `supabase.rpc(...)`, tylko dla zalogowanych:

| Funkcja | Działanie | Błędy |
|---|---|---|
| `join_group(p_code)` | Dołącza zalogowanego użytkownika do grupy o podanym kodzie (wielkość liter i spacje bez znaczenia), zwraca `id` grupy. Ponowne dołączenie nic nie zmienia. | `invalid_invite_code` |
| `leave_group(p_group_id)` | Usuwa użytkownika z członków grupy. | `not_a_member`, `owner_cannot_leave` |
| `regenerate_invite_code(p_group_id)` | Nadaje grupie nowy kod (stary przestaje działać), zwraca go. Tylko właściciel. | `not_group_owner` |

Treść błędu trafia do `error.message` w odpowiedzi `supabase-js`.

## Migracje

Pliki w `supabase/migrations/` mają format `<timestamp>_<nazwa>.sql` i są stosowane w kolejności.

Lokalnie (konfiguracja w `supabase/config.toml`) `npx supabase start` wgrywa je automatycznie, a `npx supabase db reset` czyści bazę i wgrywa je od nowa.

Na wspólny projekt Supabase:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Jeśli schemat początkowy był już wykonany ręcznie w SQL Editorze, uruchom tylko nowsze migracje (np. `20261103120000_fix_rls_and_groups.sql` i `20261103160000_group_invites.sql`).
