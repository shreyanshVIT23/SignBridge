from fastapi.testclient import TestClient
from app import app  

client = TestClient(app)

def test_hello():
    response = client.get("/api/hello")
    assert response.status_code == 200
    assert "hello" in response.json()["message"].lower()

def test_available_words():
    response = client.get("/api/available-words")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_convert_text():
    payload = {"text": "hello world"}
    response = client.post("/api/convert-text", json=payload)
    assert response.status_code == 200
    assert "video_urls" in response.json()

def test_convert_sentence():
    payload = {"sentence": "how are you"}
    response = client.post("/api/convert-sentence", json=payload)
    assert response.status_code == 200
    assert "concatenated_video_url" in response.json()

def test_video_fetch():
    word = "hello"
    response = client.get(f"/api/video/{word}")
    assert response.status_code in [200, 404]
    if response.status_code == 200:
        assert response.headers["content-type"].startswith("video")

if __name__ == "__main__":
    test_hello()
    test_available_words()
    test_convert_text()
    test_convert_sentence()
    test_video_fetch()
    print("All tests passed.")
