"""
MindForge AI — Mind Map Route

POST /api/generate-mindmap
Accepts a transcript and returns a structured mind-map.
"""

from fastapi import APIRouter

from app.models.schemas import MindMapRequest, MindMapResponse
from app.services.ai_service import generate_mindmap_from_transcript

router = APIRouter()


@router.post("/api/generate-mindmap", response_model=MindMapResponse)
async def generate_mindmap(payload: MindMapRequest):
    """Generate a mind-map from the provided transcript."""
    return generate_mindmap_from_transcript(payload.transcript)
