import pytest
from fastapi.testclient import TestClient
from pathlib import Path
import sys
import tempfile
from unittest.mock import patch, MagicMock, AsyncMock

backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from app import app

client = TestClient(app)


def test_hello():
    response = client.get("/api/hello")
    print(response.json())
    assert response.status_code == 200
    assert response.json() == {
        "message": "Hello from FastAPI - Text to Sign Language Converter!"
    }


def test_get_video_existing():
    with patch("helpers.video_service.get_video_path") as mock_get_video:
        mock_video_path = Path(tempfile.gettempdir()) / "test_video.mp4"
        mock_video_path.touch()
        mock_get_video.return_value = mock_video_path
        response = client.get("/api/video/hello")
        # print(response.json())
        assert response.status_code == 200
        assert response.headers["content-type"] == "video/mp4"
        mock_video_path.unlink(missing_ok=True)


def test_get_video_non_existing():
    from fastapi import HTTPException

    with patch("helpers.video_service.get_video_path") as mock_get_video:
        mock_get_video.side_effect = HTTPException(
            status_code=404, detail="Video not found"
        )
        response = client.get("/api/video/nonexistentword")
        print(response.json())
        assert response.status_code == 404


def test_convert_text_to_sign_videos_success():
    test_data = {"text": "hello world"}
    response = client.post("/api/convert-text", json=test_data)
    print(response.json())
    assert response.status_code == 200

def test_convert_text_with_predefined_words():
    with patch("helpers.video_service.get_video_path") as mock_get_video:
        mock_video_path = Path(tempfile.gettempdir()) / "test_video.mp4"
        mock_video_path.touch()
        mock_get_video.return_value = mock_video_path
        test_data = {"text": "original text", "words": ["hello", "world"]}
        response = client.post(
            "/api/convert-text",
            json=test_data,
            headers={"Content-Type": "application/json"},
        )
        print(response.json())
        assert response.status_code == 200
        data = response.json()
        assert data["words"] == ["hello", "world"]
        assert len(data["videos"]) == 2
        mock_video_path.unlink(missing_ok=True)


def test_convert_text_missing_words():
    with patch("helpers.video_service.get_video_path") as mock_get_video:

        def mock_video_side_effect(word):
            if word == "hello":
                mock_path = Path(tempfile.gettempdir()) / "hello.mp4"
                mock_path.touch()
                return mock_path
            else:
                from fastapi import HTTPException

                raise HTTPException(status_code=404, detail="No video for {word}")

        mock_get_video.side_effect = mock_video_side_effect
        test_data = {"text": "hello nonexistent"}
        response = client.post(
            "/api/convert-text",
            json=test_data,
            headers={"Content-Type": "application/json"},
        )
        print(response.json())
        assert response.status_code == 200
        data = response.json()
        assert data["success_count"] == 1
        assert data["missing_count"] == 1
        assert "nonexistent" in data["missing_words"]
        (Path(tempfile.gettempdir()) / "hello.mp4").unlink(missing_ok=True)


def test_convert_text_empty_input():
    test_data = {"text": ""}
    response = client.post(
        "/api/convert-text",
        json=test_data,
        headers={"Content-Type": "application/json"},
    )
    print(response.json())
    assert response.status_code == 400
    assert "No valid words found" in response.json()["detail"]


def test_convert_sentence_no_concatenation():
    with patch("helpers.video_service.get_video_path") as mock_get_video:
        mock_video_path = Path(tempfile.gettempdir()) / "test_video.mp4"
        mock_video_path.touch()
        mock_get_video.return_value = mock_video_path
        test_data = {"sentence": "hello world", "concatenate": False}
        response = client.post(
            "/api/convert-sentence",
            json=test_data,
            headers={"Content-Type": "application/json"},
        )
        print(response.json())
        assert response.status_code == 200
        data = response.json()
        assert len(data["video_paths"]) == 2
        assert data["words"] == ["hello", "world"]
        mock_video_path.unlink(missing_ok=True)


def test_convert_sentence_with_concatenation_single_video():
    with patch("helpers.video_service.get_video_path") as mock_get_video:
        mock_video_path = Path(tempfile.gettempdir()) / "test_video.mp4"
        mock_video_path.touch()
        mock_get_video.return_value = mock_video_path
        test_data = {"sentence": "hello", "concatenate": True}
        response = client.post(
            "/api/convert-sentence",
            json=test_data,
            headers={"Content-Type": "application/json"},
        )
        print(response.json())
        assert response.status_code == 200
        assert response.headers["content-type"] == "video/mp4"
        mock_video_path.unlink(missing_ok=True)


def test_convert_sentence_with_concatenation_multiple_videos():
    with patch("helpers.video_service.get_video_path") as mock_get_video, patch(
        "app.concatenate_videos"
    ) as mock_concatenate:
        mock_video_path = Path(tempfile.gettempdir()) / "test_video.mp4"
        mock_video_path.touch()
        mock_get_video.return_value = mock_video_path
        mock_output_path = Path(tempfile.gettempdir()) / "concatenated.mp4"
        mock_output_path.touch()
        mock_concatenate.return_value = str(mock_output_path)
        test_data = {"sentence": "hello world", "concatenate": True}
        response = client.post(
            "/api/convert-sentence",
            json=test_data,
            headers={"Content-Type": "application/json"},
        )
        print(response.json())
        assert response.status_code == 200
        assert response.headers["content-type"] == "video/mp4"
        mock_concatenate.assert_called_once()
        mock_video_path.unlink(missing_ok=True)
        mock_output_path.unlink(missing_ok=True)


def test_convert_sentence_no_videos_found():
    with patch("helpers.video_service.get_video_path") as mock_get_video:
        from fastapi import HTTPException

        mock_get_video.side_effect = HTTPException(
            status_code=404, detail="No video found"
        )
        test_data = {"sentence": "nonexistent words", "concatenate": True}
        response = client.post(
            "/api/convert-sentence",
            json=test_data,
            headers={"Content-Type": "application/json"},
        )
        print(response.json())
        assert response.status_code == 404
        assert "No videos found" in response.json()["detail"]


def test_convert_sentence_empty_input():
    test_data = {"sentence": "", "concatenate": True}
    response = client.post(
        "/api/convert-sentence",
        json=test_data,
        headers={"Content-Type": "application/json"},
    )
    print(response.json())
    assert response.status_code == 400
    assert "No valid words found" in response.json()["detail"]


def test_get_available_sign_words():
    with patch("pathlib.Path.glob") as mock_glob:
        mock_video1 = MagicMock()
        mock_video1.is_file.return_value = True
        mock_video1.stem = "hello"
        mock_video1.name = "hello.mp4"
        mock_video1.__str__ = lambda self: "/path/to/hello.mp4"
        mock_video2 = MagicMock()
        mock_video2.is_file.return_value = True
        mock_video2.stem = "world"
        mock_video2.name = "world.mp4"
        mock_video2.__str__ = lambda self: "/path/to/world.mp4"
        mock_glob.return_value = [mock_video1, mock_video2]
        with patch("os.path.getsize", return_value=1024):
            response = client.get("/api/available-words")
            print(response.json())
            assert response.status_code == 200
            data = response.json()
            assert data["word_count"] == 2
            assert "hello" in data["words"]
            assert "world" in data["words"]
            assert len(data["video_details"]) == 2


def test_get_multiple_videos_success():
    with patch("helpers.video_service.get_video_path") as mock_get_video:
        mock_video_path = Path(tempfile.gettempdir()) / "test_video.mp4"
        mock_video_path.touch()
        mock_get_video.return_value = mock_video_path
        response = client.get("/api/videos/multiple/hello,world")
        print(response.json())
        assert response.status_code == 200
        data = response.json()
        assert data["found_count"] == 2
        assert data["missing_count"] == 0
        assert len(data["videos"]) == 2
        mock_video_path.unlink(missing_ok=True)


def test_get_multiple_videos_some_missing():
    with patch("helpers.video_service.get_video_path") as mock_get_video:

        def mock_video_side_effect(word):
            if word == "hello":
                mock_path = Path(tempfile.gettempdir()) / "hello.mp4"
                mock_path.touch()
                return mock_path
            else:
                from fastapi import HTTPException

                raise HTTPException(status_code=404, detail="No video for {word}")

        mock_get_video.side_effect = mock_video_side_effect
        response = client.get("/api/videos/multiple/hello,nonexistent")
        print(response.json())
        assert response.status_code == 200
        data = response.json()
        assert data["found_count"] == 1
        assert data["missing_count"] == 1
        assert "nonexistent" in data["missing_words"]
        (Path(tempfile.gettempdir()) / "hello.mp4").unlink(missing_ok=True)


def test_get_multiple_videos_empty_input():
    response = client.get("/api/videos/multiple/")
    print(response.json())
    assert response.status_code == 400
    assert "No valid words provided" in response.json()["detail"]


@pytest.mark.asyncio
async def test_concatenate_videos():
    from app import concatenate_videos

    temp_dir = tempfile.gettempdir()
    video1_path = Path(temp_dir) / "video1.mp4"
    video2_path = Path(temp_dir) / "video2.mp4"
    video1_path.touch()
    video2_path.touch()
    video_paths = [str(video1_path), str(video2_path)]
    words = ["hello", "world"]
    with patch("asyncio.create_subprocess_exec") as mock_subprocess:
        mock_process = AsyncMock()
        mock_process.communicate.return_value = (b"", b"")
        mock_process.returncode = 0
        mock_subprocess.return_value = mock_process
        result = await concatenate_videos(video_paths, words)
        assert result.endswith(".mp4")
        assert "hello_world" in result
        mock_subprocess.assert_called_once()
    video1_path.unlink(missing_ok=True)
    video2_path.unlink(missing_ok=True)


if __name__ == "__main__":
    pytest.main([__file__])
