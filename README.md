# Prelegal

A platform for drafting common legal agreements.

## Status

🚧 **Work in progress.** This project is under active development and is
expected to reach a first complete version by **2026-10-15**.

The V1 technical foundation is in place: a Next.js frontend, a FastAPI
backend, a temporary SQLite database, and scripts to start and stop the app.
Sign-in is a placeholder (name and email, no password or real
authentication) that simply brings the user into the platform, where the
Mutual NDA creator is currently the only product feature.

## Project Structure

```
prelegal/
├── backend/              FastAPI app (managed with uv)
│   ├── app/
│   │   ├── main.py       App setup; serves /api and the exported frontend
│   │   ├── db.py         Temporary SQLite DB, recreated on every start
│   │   └── routes/       API routes (health, fake login)
│   └── tests/            pytest suite
├── frontend/             Next.js app, built as a static export
│   └── src/
│       ├── app/          Routes: / (sign-in) and /nda (Mutual NDA creator)
│       ├── components/   UI components
│       └── lib/          NDA templating, API client, session helpers
├── templates/            Common Paper agreement templates (Markdown)
├── catalog.json          Index of the templates
├── scripts/              start/stop scripts for macOS, Linux and Windows
└── Dockerfile            Builds the frontend and runs it with the backend
```

The frontend is exported to static files at build time and served by the
FastAPI backend, so the whole app runs as a single container on one port.

## Running the app

Prerequisite: [Docker](https://docs.docker.com/get-docker/) (Docker Desktop
on Windows/macOS) running.

Start (builds the image and runs it in the background):

```bash
scripts/start-mac.sh         # macOS
scripts/start-linux.sh       # Linux
.\scripts\start-windows.ps1  # Windows PowerShell
```

Then open <http://localhost:8000>. To use another port, run
`PRELEGAL_PORT=9000 scripts/start-linux.sh` (or `start-mac.sh`), or
`.\scripts\start-windows.ps1 -Port 9000`.

Stop (removes the container):

```bash
scripts/stop-mac.sh          # macOS
scripts/stop-linux.sh        # Linux
.\scripts\stop-windows.ps1   # Windows PowerShell
```

The database is temporary: it's recreated empty every time the app starts,
so anything stored in it is lost on restart.

## Development

Backend (requires [uv](https://docs.astral.sh/uv/)):

```bash
cd backend
uv run pytest                          # run the tests
uv run uvicorn app.main:app --reload   # serve on http://localhost:8000
```

When run this way, the backend serves the frontend from `frontend/out`, so
run `npm run build` in `frontend/` first to see the UI.

Frontend:

```bash
cd frontend
npm install
npm test         # run the unit tests
npm run lint
npm run build    # static export to frontend/out
```

## License

This project is licensed under the terms of the [MIT License](LICENSE).
