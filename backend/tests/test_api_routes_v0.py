import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

patch("os.path.isdir", return_value=True).start()
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# allow imports from project root
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

# At the top of your test file, before TestClient is created:
from app import app
from database.database import get_db
from routes.v0.authentication_routes import User, hash_password

app.user_middleware = []
# Also clear function‐decorated middlewares:
# app.router.middleware_stack = app.build_middleware_stack()

client = TestClient(app)


# --- Video router tests --- #
class TestVideoRouter:
    def test_get_video_path_success(self):
        test_word = "hello"
        mock_path = f"/videos/{test_word}.mp4"

        with patch(
            "routes.v0.sign_language_routes.get_video_path",
            new_callable=AsyncMock,
        ) as mock_get:
            mock_get.return_value = mock_path

            response = client.get(f"/videos/path/{test_word}")

            assert response.status_code == 200
            assert response.json() == {"video_path": mock_path}
            mock_get.assert_called_once_with(test_word)

    def test_get_video_path_not_found(self):
        test_word = "nonexistent"

        with patch(
            "routes.v0.sign_language_routes.get_video_path",
            new_callable=AsyncMock,
        ) as mock_get:
            mock_get.side_effect = HTTPException(
                status_code=404, detail="Video not found"
            )

            response = client.get(f"/videos/path/{test_word}")

            assert response.status_code == 404
            assert response.json()["detail"] == "Video not found"
            mock_get.assert_called_once_with(test_word)

    def test_process_text_success(self):
        test_text = "hello world"
        mock_response = {
            "generated_text": "HELLO WORLD",
            "video_paths": ["videos/hello.mp4", "videos/world.mp4"],
        }

        with patch(
            "routes.v0.sign_language_routes.process_and_send_video",
            new_callable=AsyncMock,
        ) as mock_process:
            mock_process.return_value = mock_response

            response = client.get("/videos/process-text/", params={"text": test_text})

            assert response.status_code == 200
            assert response.json() == mock_response
            mock_process.assert_called_once_with(test_text)

    def test_process_text_empty_input(self):
        response = client.get("/videos/process-text/", params={"text": ""})
        assert response.status_code == 422  # FastAPI validation error
        detail = response.json()["detail"]
        assert isinstance(detail, list)
        assert detail[0]["msg"] == "String should have at least 1 character"
        assert detail[0]["loc"] == ["query", "text"]
        assert detail[0]["type"] == "string_too_short"

    def test_process_text_service_error(self):
        test_text = "hello world"
        with patch(
            "routes.v0.sign_language_routes.process_and_send_video",
            new_callable=AsyncMock,
        ) as mock_process:
            mock_process.side_effect = Exception("Processing failed")

            response = client.get("/videos/process-text/", params={"text": test_text})

            assert response.status_code == 500
            assert "Error processing text" in response.json()["detail"]
            mock_process.assert_called_once_with(test_text)

    def test_process_text_partial_success(self):
        test_text = "hello missing"
        mock_response = {
            "generated_text": "HELLO MISSING",
            "video_paths": ["videos/hello.mp4"],
        }

        with patch(
            "routes.v0.sign_language_routes.process_and_send_video",
            new_callable=AsyncMock,
        ) as mock_process:
            mock_process.return_value = mock_response

            response = client.get("/videos/process-text/", params={"text": test_text})

            assert response.status_code == 200
            assert len(response.json()["video_paths"]) == 1
            mock_process.assert_called_once_with(test_text)


def test_app_setup():
    """Integration check: docs endpoint is available."""
    response = client.get("/docs")
    assert response.status_code == 200


# --- Auth router tests --- #
@pytest.fixture(autouse=True)
def override_db_dependency():
    mock_session = MagicMock(spec=Session)

    def _override_get_db():
        yield mock_session

    app.dependency_overrides[get_db] = _override_get_db
    yield mock_session
    app.dependency_overrides.clear()


def test_register_user_success(override_db_dependency):
    
    # Stub the entire chain: query(...)->filter(...)->first() returns None
    override_db_dependency.query.return_value.filter.return_value.first.return_value = (
        None
    )

    def mock_db_refresh(user_instance):
        user_instance.id = 1 # Assign a dummy ID

    # Tell the mock to run our function whenever 'refresh' is called
    override_db_dependency.refresh.side_effect = mock_db_refresh

    payload = {"username": "newuser", "email": "new@example.com", "password": "pw123"}
    resp = client.post("/auth/register", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == payload["email"]
    assert "id" in data


def test_register_user_conflict(override_db_dependency):
    existing = User()
    existing.id = 1
    existing.username = "u"
    existing.email = "dup@example.com"
    existing.hashed_password = hash_password("x")

    override_db_dependency.query.return_value.filter.return_value.first.return_value = (
        existing
    )

    resp = client.post(
        "/auth/register",
        json={"username": "u", "email": "dup@example.com", "password": "any"},
    )
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Email already exists"


def test_login_success(override_db_dependency):
    pw = "secret"
    user = User()
    user.id = 1
    user.username = "u"
    user.email = "a@b.com"
    user.hashed_password = hash_password(pw)

    override_db_dependency.query.return_value.filter.return_value.first.return_value = (
        user
    )

    resp = client.post("/auth/login", json={"email": user.email, "password": pw})
    assert resp.status_code == 200
    assert resp.json()["message"] == f"Welcome, {user.username}!"


def test_login_invalid_email(override_db_dependency):
    override_db_dependency.query.return_value.filter.return_value.first.return_value = (
        None
    )

    resp = client.post("/auth/login", json={"email": "x@x.com", "password": "x"})
    assert resp.status_code == 401
    assert resp.json()["detail"] == "Invalid credentials"


def test_login_wrong_password(override_db_dependency):
    correct_pw = "rightpw" # Renamed for clarity
    user = User()
    user.id = 1
    user.username = "u"
    user.email = "a@b.com"
    user.hashed_password = hash_password(correct_pw) # Use the correct variable

    override_db_dependency.query.return_value.filter.return_value.first.return_value = (
        user
    )

    resp = client.post("/auth/login", json={"email": user.email, "password": "wrongpw"})
    assert resp.status_code == 401
    assert resp.json()["detail"] == "Invalid credentials"
