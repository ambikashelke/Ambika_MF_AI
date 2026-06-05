"""
MindForge AI — Plan Route

POST /api/generate-plan
Accepts a project idea and returns an AI-structured mind map and tasks.
"""

from fastapi import APIRouter

from app.models.schemas import PlanRequest, PlanResponse
from app.services.ai_service import generate_plan_from_ai

router = APIRouter()


@router.post("/api/generate-plan", response_model=PlanResponse)
async def generate_plan(payload: PlanRequest):
    """Generate a structured project plan from the provided project idea."""
    plan_data = await generate_plan_from_ai(payload.idea)
    return plan_data
