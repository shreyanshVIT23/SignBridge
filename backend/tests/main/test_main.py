from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_convert_text_to_sign_videos_success():
    test_data = {"text": "hello world"}
    response = client.post("/api/convert-text", json=test_data)
    print(response.status_code)
    print(response.json())
    assert response.status_code == 200
