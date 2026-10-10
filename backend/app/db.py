"""Temporary SQLite database.

The V1 foundation uses a throwaway SQLite file that is deleted and recreated
every time the backend starts, so nothing stored here survives a restart.
"""

import os
import sqlite3
from collections.abc import Iterator
from pathlib import Path

DB_PATH = Path(
    os.environ.get(
        "PRELEGAL_DB_PATH",
        Path(__file__).resolve().parent.parent / "data" / "prelegal.db",
    )
)

SCHEMA = """
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
"""


def init_db() -> None:
    """Deletes any existing database file and creates a fresh, empty schema."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    DB_PATH.unlink(missing_ok=True)
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.executescript(SCHEMA)
    finally:
        conn.close()


def get_connection() -> Iterator[sqlite3.Connection]:
    """FastAPI dependency yielding a per-request connection.

    `check_same_thread=False` because FastAPI may run a sync dependency and the
    sync endpoint using it on different threadpool threads; the connection is
    still only used by one request at a time.
    """
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
