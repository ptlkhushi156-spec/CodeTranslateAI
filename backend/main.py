from fastapi import FastAPI
from pydantic import BaseModel

from database import db

app = FastAPI()


# -----------------------------
# Request model
# -----------------------------
class TranslationRequest(BaseModel):
    source_code: str
    source_language: str
    target_language: str


# -----------------------------
# Home / health check
# -----------------------------
@app.get("/")
def home():
    return {
        "message": "CodeTranslateAI Backend is running",
        "database": "MongoDB connected"
    }


# -----------------------------
# Translation endpoint
# -----------------------------
@app.post("/translate")
def translate_code(request: TranslationRequest):

    return {
        "message": "Translation request received",
        "source_language": request.source_language,
        "target_language": request.target_language,
        "source_code": request.source_code
    }