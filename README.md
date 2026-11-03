# PartyPlanner

Aplikacja do umawiania spotkań w grupie znajomych i rozliczania wspólnych wydatków.

- `frontend/` – React + Vite + Tailwind
- `backend/` – Supabase (Auth + Postgres z RLS), migracje w `backend/supabase/migrations/` – szczegóły w [backend/README.md](backend/README.md)

## Wymagane instalacje

| Narzędzie | Wersja | Do czego |
|---|---|---|
| [Node.js](https://nodejs.org/) (z npm) | 22 LTS lub nowszy (minimum 20.19) | frontend, Supabase CLI przez `npx` |
| [Git](https://git-scm.com/) | dowolna aktualna | repozytorium |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | dowolna aktualna | tylko do lokalnego Supabase (wariant B) |

Supabase CLI nie trzeba instalować osobno – uruchamiamy je przez `npx supabase`.

> **Windows / PowerShell:** jeśli `npx` lub `npm` kończy się błędem *„running scripts is disabled on this system”*, używaj `npx.cmd` i `npm.cmd` (albo terminala `cmd` / Git Bash).

## Uruchomienie

Frontend potrzebuje adresu i klucza `anon` projektu Supabase. Możesz użyć wspólnego projektu zespołu (wariant A) albo postawić Supabase lokalnie w Dockerze (wariant B).

### Wariant A – wspólny projekt Supabase

1. W panelu Supabase → **SQL Editor** uruchom po kolei te migracje z `backend/supabase/migrations/`, których jeszcze nie ma w bazie (pliki wykonuje się w kolejności nazw).
2. W **Authentication → URL Configuration** dodaj do *Redirect URLs* adres `http://localhost:5173/**`.
3. Adres projektu i klucz `anon` znajdziesz w **Project Settings → API** – wpisz je w kroku „Frontend” poniżej.

### Wariant B – lokalny Supabase w Dockerze

Przy uruchomionym Docker Desktop, w folderze `backend` (konfiguracja jest w `backend/supabase/config.toml`, `supabase init` nie jest potrzebne):

```bash
cd backend
npx supabase start    # pierwsze uruchomienie pobiera obrazy Dockera, migracje wgrywają się automatycznie
npx supabase status   # pokazuje API URL i anon key
```

- Lokalnie nie trzeba potwierdzać adresu e-mail – po rejestracji od razu jesteś zalogowany.
- Podgląd bazy (Supabase Studio): http://localhost:54323
- Zatrzymanie (dane zostają do następnego `start`): `npx supabase stop`
- Wyczyszczenie bazy i ponowne wgranie migracji: `npx supabase db reset`

### Frontend

```bash
cd frontend
cp .env.example .env    # PowerShell: Copy-Item .env.example .env
```

Uzupełnij `frontend/.env`:

```
VITE_SUPABASE_URL=<API URL, lokalnie zwykle http://127.0.0.1:54321>
VITE_SUPABASE_ANON_KEY=<anon key>
```

Następnie:

```bash
npm install
npm run dev
```

Aplikacja działa pod http://localhost:5173.

### Szybki test

1. Zarejestruj się na `/signup` i utwórz grupę na panelu głównym.
2. Skopiuj link zaproszenia ze strony grupy.
3. Otwórz go w oknie incognito, zarejestruj drugie konto – powinieneś trafić prosto do grupy.

## Przydatne komendy (w `frontend/`)

| Komenda | Działanie |
|---|---|
| `npm run dev` | serwer deweloperski z odświeżaniem na żywo |
| `npm run build` | build produkcyjny do `frontend/dist` |
| `npm run lint` | sprawdzenie kodu ESLintem |
