import pytest
from fastapi.testclient import TestClient

from app import db
from app.main import app


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.db")
    with TestClient(app) as test_client:
        yield test_client


def test_health(client):
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_unknown_api_path_returns_json_404(client):
    response = client.get("/api/does-not-exist")

    assert response.status_code == 404
    assert response.json() == {"detail": "No API route for /api/does-not-exist"}


def test_login_records_user(client):
    response = client.post(
        "/api/auth/login", json={"name": "  Ada Lovelace ", "email": "Ada@Example.com"}
    )

    assert response.status_code == 200
    assert response.json() == {"id": 1, "name": "Ada Lovelace", "email": "ada@example.com"}


def test_login_again_with_same_email_updates_name(client):
    first = client.post("/api/auth/login", json={"name": "Ada", "email": "ada@example.com"})
    second = client.post(
        "/api/auth/login", json={"name": "Ada Lovelace", "email": "ADA@example.com"}
    )

    assert second.json() == {"id": first.json()["id"], "name": "Ada Lovelace", "email": "ada@example.com"}


@pytest.mark.parametrize(
    "payload",
    [
        {"name": "", "email": "ada@example.com"},
        {"name": "   ", "email": "ada@example.com"},
        {"name": "Ada", "email": "not-an-email"},
        {"name": "Ada"},
    ],
)
def test_login_rejects_invalid_input(client, payload):
    response = client.post("/api/auth/login", json=payload)

    assert response.status_code == 422


def test_database_is_recreated_on_startup(tmp_path, monkeypatch):
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.db")
    with TestClient(app) as client:
        client.post("/api/auth/login", json={"name": "Ada", "email": "ada@example.com"})

    with TestClient(app) as client:
        response = client.post(
            "/api/auth/login", json={"name": "Grace", "email": "grace@example.com"}
        )

    assert response.json()["id"] == 1
