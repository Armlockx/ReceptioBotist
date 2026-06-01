# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

ReceptioBotist is a pnpm + Turbo monorepo: Next.js admin/API (`apps/web`), Vite embeddable widget (`apps/widget`), shared packages under `packages/`, and Supabase SQL under `supabase/`. There is no root README; use `.env.example` and this file.

### Services (dev)

| Service | Port | Notes |
|---------|------|--------|
| Next.js (`@receptio/web`) | 3000 | `pnpm --filter @receptio/web dev` |
| Widget dev server | 5173 | `pnpm --filter @receptio/widget dev` |
| Supabase API | 54321 | Requires Docker + `supabase start` from repo root |
| Supabase Studio | 54323 | DB browser when Supabase is running |

### First-time / cold VM setup (not in update script)

1. **Docker**: The Cloud VM may not have Docker running. Start the daemon if `docker ps` fails:
   - `sudo dockerd > /tmp/dockerd.log 2>&1 &` (fuse-overlayfs storage driver is configured under `/etc/docker/daemon.json`).
   - Ensure socket access: `sudo chmod 666 /var/run/docker.sock` (or use `sudo` for Supabase CLI).
2. **Supabase**: From `/workspace`:
   - `pnpm --filter @receptio/db exec supabase start` (first run pulls images; can take several minutes).
   - `pnpm --filter @receptio/db exec supabase db reset` to apply `supabase/migrations/`.
   - `pnpm --filter @receptio/db exec supabase status -o env` for keys.
3. **Env file**: Create `/workspace/.env.local` from `status -o env` (see `.env.example`). Minimum for the app:
   - `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` = `API_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` = `SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL=http://localhost:3000`
4. **Seed** (once per fresh DB): `pnpm db:seed` from repo root.
5. **Groq** (for live AI chat / preview): set `GROQ_API_KEY` in `.env.local` or configure per-tenant BYOK in admin billing. Without it, `POST /api/v1/chat` returns 502 with `Missing GROQ_API_KEY`. Admin CRUD, onboarding, and analytics work without Groq.

### Standard commands (repo root)

| Task | Command |
|------|---------|
| Install deps | `pnpm install` |
| Dev (web + widget) | `pnpm dev` |
| Dev web only | `pnpm --filter @receptio/web dev` |
| Typecheck | `pnpm typecheck` (fails today on `@receptio/ai` — missing `@types/node`) |
| Lint | `pnpm lint` (same `@receptio/ai` issue; `@receptio/web` `next lint` is interactive if ESLint is not configured) |
| Build all | `pnpm build` |
| Build web | `pnpm --filter @receptio/web build` |

Use **tmux** for long-running dev servers in Cloud Agent sessions.

### Gotchas

- Supabase CLI is a **devDependency** of `@receptio/db`; invoke via `pnpm --filter @receptio/db exec supabase …`, not global `supabase`.
- `pnpm exec supabase` from the repo root does **not** work.
- After `db:seed`, read `tenant_key` from the `tenants` table (REST/Studio); seed logs do not print keys.
- Upstash Redis is optional; rate limit and FAQ cache fall back to in-memory when unset.
- Admin routes have **no auth** in this codebase (dev-only assumption).
