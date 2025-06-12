import pytest
import asyncio
from helpers.video_service import get_video_path
from fastapi import HTTPException

@pytest.mark.asyncio
async def test_get_video_path_existing():
    # Test with a word that should exist
    path = await get_video_path('0')
    assert path.endswith('0.mp4')

@pytest.mark.asyncio
async def test_get_video_path_non_existing():
    # Test with a word that should not exist
    with pytest.raises(HTTPException):
        await get_video_path('nonexistentword')

if __name__ == '__main__':
    asyncio.run(test_get_video_path_existing())
    try:
        asyncio.run(test_get_video_path_non_existing())
    except HTTPException:
        print('Non-existing video test passed with HTTPException')
    print('All tests completed.')
