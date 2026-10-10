# Prelegal Project

## Overview

Prelegal is a SaaS product that lets users draft legal agreements from the
templates in `templates/`. The **target product** (end of the Jira roadmap,
PL-7) lets users hold an AI chat to establish which document they want and
how to fill in its fields, supports all 11 document types, and has real user
authentication and document persistence.

The available documents are listed in `catalog.json` in the project root
(12 entries for 11 document types: the Mutual NDA has separate Standard Terms
and Cover Page files):

@catalog.json

> **This is the target, not the current state.** See "Current status" below
> for what actually exists today. Don't assume a feature exists because it's
> described in the overview.

## Current status (updated 2026-10-10)

Roadmap (Jira project `PL`):

| Ticket | Summary                                         | State |
| ------ | ----------------------------------------------- | ----- |
| PL-2   | Dataset of legal document templates             | Done (PR #3 merged) |
| PL-3   | Prototype of Mutual NDA creator                 | Done (PR #4 merged), plus an accessibility/rendering fix commit |
| PL-4   | Build foundation of V1 product                  | Implemented on `feature/pl-4-v1-foundation`, **PR #5 open** (Jira still "To Do") |
| PL-5   | Add AI chat, but still just Mutual NDA          | Not started |
| PL-6   | Expand to all supported legal document types    | Not started |
| PL-7   | Support multiple users & final polish           | Not started |

What exists after PL-4:

- **One document type:** the Mutual NDA, filled in through a **form** (no AI
  chat yet) with a live Markdown preview and client-side PDF download.
- **Fake login only:** name + email, no password, no session/auth. The user is
  kept in `sessionStorage`; `/nda` soft-redirects to `/` if absent (UX only,
  not access control).
- **No document persistence.** The only DB table is `users`, and the DB is
  wiped on every start.
- **No LLM code yet.** `.env` / `OPENROUTER_API_KEY` are not wired in, and
  the start scripts don't pass an env file to the container yet (needed for
  PL-5).

## Architecture (as built)

The whole app runs as **one Docker container on http://localhost:8000**: the
Next.js frontend is statically exported at image build time and served by the
FastAPI backend alongside the API.

```
prelegal/
├── backend/                 FastAPI app, uv project (Python 3.13)
│   ├── app/main.py          App, lifespan (init DB), /api routers, JSON 404 for
│   │                        unknown /api/*, then StaticFiles mount of the frontend
│   ├── app/db.py            SQLite: deletes + recreates the DB file on every start;
│   │                        get_connection() per-request dependency
│   ├── app/routes/          health.py (GET /api/health), auth.py (POST /api/auth/login)
│   └── tests/test_api.py    pytest + FastAPI TestClient (httpx2)
├── frontend/                Next.js 16 (App Router), React 19, Tailwind 4
│   ├── next.config.ts       output: "export", trailingSlash: true
│   └── src/
│       ├── app/page.tsx         / : fake login screen (LoginForm)
│       ├── app/nda/page.tsx     /nda : Mutual NDA creator inside PlatformShell
│       ├── components/          NdaBuilder, NdaPdfDocument, PartyFields,
│       │                        LoginForm, PlatformShell (+ *.test.tsx)
│       └── lib/                 nda/ (template merge, types, readTemplates),
│                                api.ts (login client), session.ts (sessionStorage user)
├── templates/               Common Paper templates (Markdown, CC BY 4.0)
├── catalog.json             Index of templates
├── scripts/                 start/stop-{mac,linux}.sh are wrappers around
│                            scripts/lib/{start,stop}.sh; start/stop-windows.ps1
└── Dockerfile               node:24 builds frontend/out, python:3.13 + uv runs uvicorn
```

Key details:

- The NDA templates are read from `../templates` **at build time** by a server
  component (`readNdaTemplates`), so the Docker build copies `templates/` next
  to `frontend/`.
- Config via env vars: `PRELEGAL_DB_PATH` (default `backend/data/prelegal.db`),
  `PRELEGAL_STATIC_DIR` (default `frontend/out`; `/app/static` in Docker),
  `PRELEGAL_PORT` / `-Port` for the start scripts.
- The frontend calls the API with relative URLs (`/api/...`), so it only works
  when served by the backend. `npm run dev` alone can't log in.

## Commands

```bash
# Run the app (Docker Desktop must be running)
scripts/start-mac.sh | scripts/start-linux.sh | .\scripts\start-windows.ps1
scripts/stop-mac.sh  | scripts/stop-linux.sh  | .\scripts\stop-windows.ps1

# Frontend (from frontend/)
npm test            # Vitest + Testing Library (jsdom)
npx tsc --noEmit
npm run lint
npm run build       # static export to frontend/out

# Backend (from backend/), with uv installed locally
uv run pytest
uv run uvicorn app.main:app --reload    # serves frontend/out if built

# Backend without local Python/uv: run in the uv Docker image (Git Bash)
MSYS_NO_PATHCONV=1 docker run --rm -v "$(pwd -W):/app" -w /app \
  -e UV_PROJECT_ENVIRONMENT=/tmp/venv \
  ghcr.io/astral-sh/uv:0.9.30-python3.13-bookworm-slim \
  sh -c "uv sync --frozen -q && uv run --frozen pytest -q"
```

After changing `backend/pyproject.toml`, re-run `uv lock` (and check with
`uv lock --check`); the Docker build uses `uv sync --frozen`.

## Development process

When instructed to build a feature:

1. Use the Atlassian tools to read the feature instructions from Jira
   (site `std-team27.atlassian.net`, project key `PL`).
2. Develop the feature — do not skip any step of the feature-dev 7-step
   process (`/feature-dev:feature-dev`).
3. Thoroughly test the feature with unit tests and integration tests (backend
   pytest, frontend Vitest, and an end-to-end run of the Docker container) and
   fix any issues.
4. Submit a PR using the GitHub tools (repo `EminAksoy3427/prelegal`, base
   `main`, branch `feature/pl-<n>-<short-name>`).

## AI design

When writing code that calls LLMs, use the Cerebras skill
(`.claude/skills/cerebras`): LiteLLM via OpenRouter to the
`openrouter/openai/gpt-oss-120b` model with Cerebras as the inference
provider. Use Structured Outputs so the results can be interpreted and used
to populate fields in the legal document.

The `OPENROUTER_API_KEY` goes in a `.env` file in the project root. It does
**not** exist in the repo (it's gitignored and excluded by `.dockerignore`), so
create it locally. Pass it to the container at runtime (e.g. `--env-file .env`
in the start scripts); never bake it into the image.

## Technical design

- The entire project is packaged into a single Docker container.
- Backend in `backend/`: a uv project using FastAPI.
- Frontend in `frontend/`: statically exported and served by FastAPI.
- Database: SQLite, created from scratch every time the backend starts (i.e.
  each time the container is brought up). It has a `users` table, used by the
  fake login now and by real sign-up/sign-in in PL-7.
- Start/stop scripts in `scripts/`:
  ```
  scripts/start-mac.sh       scripts/stop-mac.sh        # macOS
  scripts/start-linux.sh     scripts/stop-linux.sh      # Linux
  scripts/start-windows.ps1  scripts/stop-windows.ps1   # Windows (PowerShell 5.1)
  ```
- The app is available at http://localhost:8000 (frontend and `/api`).

## Color scheme

Defined as Tailwind theme tokens in `frontend/src/app/globals.css`:

| Color            | Hex       | Token                 | Use |
| ---------------- | --------- | --------------------- | --- |
| Accent Yellow    | `#ecad0a` | `brand-yellow`        | Accents (e.g. header border) |
| Blue Primary     | `#209dd7` | `brand-blue`          | Primary/focus accents |
| Purple Secondary | `#753991` | `brand-purple`        | Submit buttons (`brand-purple-dark` for hover) |
| Dark Navy        | `#032147` | `brand-navy`          | Headings |
| Gray Text        | `#888888` | (not a token)         | Large or non-essential text only |

`#888888` on white is only ~3.5:1 contrast, below WCAG AA (4.5:1) for normal
text. Keep using `text-gray-500`/`600` for small body text, as the existing
accessibility fixes do.

## Gotchas

- **Next.js 16 differs from older versions.** Read
  `frontend/node_modules/next/dist/docs/` before using Next APIs (see
  `frontend/AGENTS.md`, which `next dev` keeps regenerating).
- **Static export limits:** `cacheComponents` / `partialPrefetching` (PPR)
  can't be used with `output: "export"` and were removed in PL-4. No server
  actions, route handlers that read requests, rewrites, or proxy (formerly
  middleware). Server logic goes in FastAPI.
- `trailingSlash: true` is required so `/nda` exports as `nda/index.html`,
  which Starlette's `StaticFiles(html=True)` resolves.
- Register FastAPI routes **before** the `/` StaticFiles mount, or the mount
  shadows them.
- SQLite connections use `check_same_thread=False` because FastAPI may run a
  sync dependency and its endpoint on different threadpool threads.
- Starlette's TestClient wants `httpx2` (plain `httpx` is deprecated there).
- Windows checkouts use `core.autocrlf`; `.gitattributes` forces LF for `*.sh`
  so they still run under bash. Keep the shell scripts executable
  (`git update-index --chmod=+x`).
- The PowerShell scripts target Windows PowerShell 5.1: no `&&`/`||`, and check
  `$LASTEXITCODE` rather than relying on `$ErrorActionPreference = "Stop"`
  (docker writes progress to stderr).
- Don't add `react-hooks/set-state-in-effect` suppressions for reading browser
  storage; use the `useSyncExternalStore` pattern in `lib/session.ts`.
