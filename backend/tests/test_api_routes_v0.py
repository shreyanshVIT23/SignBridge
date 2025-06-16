import sys
from pathlib import Path
from fastapi.testclient import TestClient
from fastapi import HTTPException
from unittest.mock import AsyncMock, patch
import pytest

backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from app import app

client = TestClient(app)

@pytest.mark.asyncio
class TestVideoRouter:
    def test_get_video_path_success(self):
        test_word = "hello"
        mock_path = f"videos/{test_word}.mp4"
        
        with patch("routes.v0.sign_language_routes.get_video_path", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = mock_path
            
            response = client.get(f"/videos/path/{test_word}")
            
            assert response.status_code == 200
            assert response.json() == {"video_path": mock_path}
            mock_get.assert_called_once_with(test_word)

    def test_get_video_path_not_found(self):
        test_word = "nonexistent"
        
        with patch("routes.v0.sign_language_routes.get_video_path", new_callable=AsyncMock) as mock_get:
            mock_get.side_effect = HTTPException(status_code=404, detail="Video not found")
            
            response = client.get(f"/videos/path/{test_word}")
            
            assert response.status_code == 404
            assert response.json()["detail"] == "Video not found"
            mock_get.assert_called_once_with(test_word)

    def test_process_text_success(self):
        test_text = "hello world"
        mock_response = {
            "generated_text": "HELLO WORLD",
            "video_paths": ["videos/hello.mp4", "videos/world.mp4"]
        }
        
        with patch("routes.v0.sign_language_routes.process_and_send_video", new_callable=AsyncMock) as mock_process:
            mock_process.return_value = mock_response
            
            response = client.get("/videos/process-text/", params={"text": test_text})
            
            assert response.status_code == 200
            assert response.json() == mock_response
            mock_process.assert_called_once_with(test_text)

    def test_process_text_empty_input(self):
        response = client.get("/videos/process-text/", params={"text": ""})
        assert response.status_code == 422  # FastAPI validation error
        error_detail = response.json()["detail"]
        assert isinstance(error_detail, list)
        assert len(error_detail) == 1
        assert error_detail[0]["msg"] == "String should have at least 1 character"
        assert error_detail[0]["loc"] == ["query", "text"]
        assert error_detail[0]["type"] == "string_too_short"

    def test_process_text_service_error(self):
        test_text = "hello world"
        
        with patch("routes.v0.sign_language_routes.process_and_send_video", new_callable=AsyncMock) as mock_process:
            mock_process.side_effect = Exception("Processing failed")
            
            response = client.get("/videos/process-text/", params={"text": test_text})
            
            assert response.status_code == 500
            assert "Error processing text" in response.json()["detail"]
            mock_process.assert_called_once_with(test_text)

    def test_process_text_partial_success(self):
        test_text = "hello missing"
        mock_response = {
            "generated_text": "HELLO MISSING",
            "video_paths": ["videos/hello.mp4"]  # 'missing' video doesn't exist
        }
        
        with patch("routes.v0.sign_language_routes.process_and_send_video", new_callable=AsyncMock) as mock_process:
            mock_process.return_value = mock_response
            
            response = client.get("/videos/process-text/", params={"text": test_text})
            
            assert response.status_code == 200
            assert len(response.json()["video_paths"]) == 1
            mock_process.assert_called_once_with(test_text)

# Integration test with actual app instance
def test_app_setup():
    test_client = TestClient(app)
    response = test_client.get("/docs")  # Test if docs endpoint is available
    assert response.status_code == 200