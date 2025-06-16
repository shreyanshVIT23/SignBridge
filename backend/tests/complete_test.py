import pytest
from fastapi import FastAPI, HTTPException
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch
from routers.v2.sign_language_routes import router as video_router
from utils.gemini_client import GeminiClient

app = FastAPI()
app.include_router(video_router)

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_get_video_path_success(client):
    test_word = "hello"
    mock_path = f"videos/{test_word}.mp4"
    
    with patch("routers.video_router.get_video_path", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_path
        
        response = await client.get(f"/videos/path/{test_word}")
        
        assert response.status_code == 200
        assert response.json() == {"video_path": mock_path}
        mock_get.assert_awaited_once_with(test_word)

@pytest.mark.asyncio
async def test_get_video_path_not_found(client):
    test_word = "nonexistent"
    
    with patch("routers.video_router.get_video_path", new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = HTTPException(status_code=404, detail="Video not found")
        
        response = await client.get(f"/videos/path/{test_word}")
        
        assert response.status_code == 404
        assert response.json()["detail"] == "Video not found"
        mock_get.assert_awaited_once_with(test_word)

@pytest.mark.asyncio
async def test_process_text_success(client):
    test_text = "hello world"
    mock_response = {
        "generated_text": "HELLO WORLD",
        "video_paths": ["videos/hello.mp4", "videos/world.mp4"]
    }
    
    with patch("routers.video_router.process_and_send_video", new_callable=AsyncMock) as mock_process:
        mock_process.return_value = mock_response
        
        response = await client.get("/videos/process-text/", params={"text": test_text})
        
        assert response.status_code == 200
        assert response.json() == mock_response
        mock_process.assert_awaited_once_with(test_text)

@pytest.mark.asyncio
async def test_process_text_empty_input(client):
    response = await client.get("/videos/process-text/", params={"text": ""})
    assert response.status_code == 422  # FastAPI validation error

@pytest.mark.asyncio
async def test_process_text_service_error(client):
    test_text = "hello world"
    
    with patch("routers.video_router.process_and_send_video", new_callable=AsyncMock) as mock_process:
        mock_process.side_effect = Exception("Processing failed")
        
        response = await client.get("/videos/process-text/", params={"text": test_text})
        
        assert response.status_code == 500
        assert "Error processing text" in response.json()["detail"]
        mock_process.assert_awaited_once_with(test_text)

@pytest.mark.asyncio
async def test_process_text_partial_success(client):
    test_text = "hello missing"
    mock_response = {
        "generated_text": "HELLO MISSING",
        "video_paths": ["videos/hello.mp4"]  # 'missing' video doesn't exist
    }
    
    with patch("routers.video_router.process_and_send_video", new_callable=AsyncMock) as mock_process:
        mock_process.return_value = mock_response
        
        response = await client.get("/videos/process-text/", params={"text": test_text})
        
        assert response.status_code == 200
        assert len(response.json()["video_paths"]) == 1
        mock_process.assert_awaited_once_with(test_text)

# Test the GeminiClient integration
@pytest.mark.asyncio
async def test_gemini_integration(client):
    test_text = "test sentence"
    mock_gemini_response = "TEST SENTENCE"
    
    with (
        patch.object(GeminiClient, 'generate_text', new_callable=AsyncMock) as mock_generate,
        patch("routers.video_router.get_video_path", new_callable=AsyncMock) as mock_get_path
    ):
        mock_generate.return_value = mock_gemini_response
        mock_get_path.side_effect = lambda x: f"videos/{x.lower()}.mp4"
        
        response = await client.get("/videos/process-text/", params={"text": test_text})
        
        assert response.status_code == 200
        assert response.json()["generated_text"] == mock_gemini_response
        mock_generate.assert_awaited_once()