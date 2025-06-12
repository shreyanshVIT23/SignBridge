from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, List
from fastapi.responses import JSONResponse

app = FastAPI()

class TextConversionRequest(BaseModel):
    text: str
    words: Optional[List[str]] = None

@app.post("/api/convert-text")
async def convert_text_to_sign_videos(request: TextConversionRequest):
    return JSONResponse({
        "text": request.text,
        "words": request.words or request.text.split()
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)