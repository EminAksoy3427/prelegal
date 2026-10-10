import sqlite3
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict, Field

from app.db import get_connection

router = APIRouter(prefix="/api/auth", tags=["auth"])

EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class LoginRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=100)
    email: str = Field(max_length=254, pattern=EMAIL_PATTERN)


class User(BaseModel):
    id: int
    name: str
    email: str


@router.post("/login")
def login(
    body: LoginRequest,
    conn: Annotated[sqlite3.Connection, Depends(get_connection)],
) -> User:
    """Fake login: there is no password or session yet.

    Records the user in the temporary database (matched by email, so logging in
    again with a new name updates it) and returns them so the frontend can
    bring them into the platform.
    """
    row = conn.execute(
        """
        INSERT INTO users (name, email) VALUES (?, ?)
        ON CONFLICT (email) DO UPDATE SET name = excluded.name
        RETURNING id, name, email
        """,
        (body.name, body.email.lower()),
    ).fetchone()
    conn.commit()
    return User(**row)
