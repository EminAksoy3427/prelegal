import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles

from app.db import init_db
from app.routes import auth, health

# The Next.js static export. In Docker it's copied to /app/static; locally it
# defaults to the repo's `frontend/out` after `npm run build`.
STATIC_DIR = Path(
    os.environ.get(
        "PRELEGAL_STATIC_DIR",
        Path(__file__).resolve().parents[2] / "frontend" / "out",
    )
)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Prelegal API", lifespan=lifespan)
app.include_router(health.router)
app.include_router(auth.router)


@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
def api_not_found(path: str) -> None:
    """Keeps unknown API paths from falling through to the frontend's HTML 404."""
    raise HTTPException(status_code=404, detail=f"No API route for /api/{path}")

# Mounted last so the /api routes above take precedence over the catch-all.
if STATIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="frontend")
