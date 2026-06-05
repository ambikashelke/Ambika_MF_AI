"""
MindForge AI — Health Route

Simple readiness / liveness check for the backend.
"""

from fastapi import APIRouter

from app.models.schemas import HealthResponse

router = APIRouter()


@router.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Return a simple health status."""
    return HealthResponse(
        status="ok",
        message="MindForge AI backend running",
    )
