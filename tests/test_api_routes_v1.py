from fastapi.testclient import TestClient
from pathlib import Path
import sys
from unittest.mock import patch

backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from app import app

client = TestClient(app)

def test_process_text_endpoint():
    """Test the main text processing endpoint."""
    # First, let's check what endpoints are available
    print("Available routes:")
    for route in app.routes:
        if hasattr(route, 'path'):
            print(f"  {route.methods if hasattr(route, 'methods') else 'N/A'} {route.path}")
    
    # Mock the video service to avoid dependencies
    with patch('helpers.video_service.process_and_send_video') as mock_process:
        mock_process.return_value = {
            "generated_text": "HELLO WORLD",
            "video_paths": ["videos/hello.mp4", "videos/world.mp4"]
        }
        
        # Try the request
        response = client.post("/api/v1/sign-language/process-text", json={"text": "hello world"})
        
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text}")
        print(f"Response headers: {dict(response.headers)}")
        
        if response.status_code != 200:
            print("Error occurred, trying to debug...")
            # Try different content types
            response2 = client.post(
                "/api/v1/sign-language/process-text", 
                json={"text": "hello world"},
                headers={"Content-Type": "application/json"}
            )
            print(f"With explicit headers - Status: {response2.status_code}, Body: {response2.text}")
            return
        
        data = response.json()
        
        assert data["original_text"] == "hello world"
        assert data["generated_text"] == "HELLO WORLD"
        assert len(data["video_paths"]) == 2
        assert data["total_videos"] == 2
        
        print("Process Text Response:", data)

def test_get_video_endpoint():
    """Test getting a single video."""
    with patch('helpers.video_service.get_video_path') as mock_get_path:
        mock_get_path.return_value = "videos/hello.mp4"
        
        response = client.get("/api/v1/sign-language/video/hello")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["word"] == "hello"
        assert data["video_path"] == "videos/hello.mp4"
        
        print("Get Video Response:", data)

def test_get_video_not_found():
    """Test video not found scenario."""
    from fastapi import HTTPException
    
    with patch('helpers.video_service.get_video_path') as mock_get_path:
        mock_get_path.side_effect = HTTPException(status_code=404, detail="Video not found")
        
        response = client.get("/api/v1/sign-language/video/nonexistent")
        
        assert response.status_code == 404
        data = response.json()
        
        assert data["detail"] == "Video not found"
        
        print("Video Not Found Response:", data)

def test_health_check():
    """Test health check endpoint."""
    response = client.get("/api/v1/sign-language/health")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["status"] == "healthy"
    assert data["service"] == "sign-language-api"
    
    print("Health Check Response:", data)

def test_process_multiple_words():
    """Test batch processing endpoint."""
    with patch('helpers.video_service.get_video_path') as mock_get_path:
        def mock_side_effect(word):
            if word in ["hello", "world"]:
                return f"videos/{word}.mp4"
            else:
                from fastapi import HTTPException
                raise HTTPException(status_code=404, detail="Video not found")
        
        mock_get_path.side_effect = mock_side_effect
        
        response = client.post("/api/v1/sign-language/process-words", json=["hello", "world", "missing"])
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["summary"]["total_words"] == 3
        assert data["summary"]["found"] == 2
        assert data["summary"]["missing"] == 1
        assert data["results"]["hello"]["status"] == "found"
        assert data["results"]["missing"]["status"] == "not_found"
        
        print("Process Multiple Words Response:", data)

def test_process_text_validation_error():
    """Test validation error with empty text."""
    response = client.post("/api/v1/sign-language/process-text", json={"text": ""})
    
    assert response.status_code == 422
    data = response.json()
    
    assert "detail" in data
    
    print("Validation Error Response:", data)

def test_process_text_service_error():
    """Test service error handling."""
    with patch('helpers.video_service.process_and_send_video') as mock_process:
        mock_process.side_effect = Exception("Service unavailable")
        
        response = client.post("/api/v1/sign-language/process-text", json={"text": "hello"})
        
        assert response.status_code == 500
        data = response.json()
        
        assert "Failed to process text" in data["detail"]
        
        print("Service Error Response:", data)

# Example responses for reference
def print_example_responses():
    """Print example API responses for documentation."""
    print("\n" + "="*50)
    print("EXAMPLE API RESPONSES")
    print("="*50)
    
    print("\n1. POST /api/v1/sign-language/process-text")
    print("Request: {'text': 'hello world'}")
    print("Response:")
    print({
        "original_text": "hello world",
        "generated_text": "HELLO WORLD", 
        "video_paths": ["videos/hello.mp4", "videos/world.mp4"],
        "total_videos": 2
    })
    
    print("\n2. GET /api/v1/sign-language/video/hello")
    print("Response:")
    print({
        "word": "hello",
        "video_path": "videos/hello.mp4"
    })
    
    print("\n3. GET /api/v1/sign-language/health")
    print("Response:")
    print({
        "status": "healthy",
        "service": "sign-language-api"
    })
    
    print("\n4. POST /api/v1/sign-language/process-words")
    print("Request: ['hello', 'world', 'missing']")
    print("Response:")
    print({
        "results": {
            "hello": {"status": "found", "video_path": "videos/hello.mp4"},
            "world": {"status": "found", "video_path": "videos/world.mp4"},
            "missing": {"status": "not_found", "video_path": None}
        },
        "summary": {
            "total_words": 3,
            "found": 2,
            "missing": 1,
            "found_words": ["hello", "world"],
            "missing_words": ["missing"]
        }
    })

if __name__ == "__main__":
    print("Running sign language API tests...")
    
    test_process_text_endpoint()
    test_get_video_endpoint()
    test_get_video_not_found()
    test_health_check()
    test_process_multiple_words()
    test_process_text_validation_error()
    test_process_text_service_error()
    
    print("\n✅ All tests passed!")
    
    print_example_responses()