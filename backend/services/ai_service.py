"""
MindForge AI — AI Service Router (backend/services/ai_service.py)

Exposes endpoints selection between Gemini and OpenAI with error resilience.
"""

import traceback
from app.config.settings import settings
from services.prompt_templates import SYSTEM_PROMPT, get_user_prompt
from services.providers.gemini_provider import generate_with_gemini
from services.providers.openai_provider import generate_with_openai

def get_fallback_plan(idea: str) -> dict:
    """Fallback generator in case AI model call fails."""
    print(f"[AI Service] Triggering fallback plan generator for idea: {idea}")
    return {
        "title": f"Plan: {idea}" if idea else "Generated Project Plan",
        "mindMap": {
            "root": idea if idea else "Main Idea",
            "children": [
                {"label": "Planning"},
                {"label": "Execution"}
            ]
        },
        "tasks": [
            "Define the idea",
            "Create planning"
        ]
    }

async def generate_plan_from_ai(idea: str) -> dict:
    """
    Generate project plan using AI service providers.
    Falls back to hardcoded mock generation if chosen provider fails.
    """
    provider = settings.ai_provider.strip().lower()
    print(f"[AI Service] Chosen AI provider: {provider}")

    try:
        if provider == "gemini":
            if not settings.gemini_api_key:
                raise ValueError("GEMINI_API_KEY is not set.")
            user_prompt = get_user_prompt(idea)
            return generate_with_gemini(
                api_key=settings.gemini_api_key,
                system_prompt=SYSTEM_PROMPT,
                user_prompt=user_prompt
            )
        elif provider == "openai":
            if not settings.openai_api_key:
                raise ValueError("OPENAI_API_KEY is not set.")
            user_prompt = get_user_prompt(idea)
            return generate_with_openai(
                api_key=settings.openai_api_key,
                system_prompt=SYSTEM_PROMPT,
                user_prompt=user_prompt
            )
        else:
            raise ValueError(f"Unsupported AI Provider configured: {provider}")
    except Exception as err:
        print(f"[AI Service] Error generating plan via AI: {err}")
        traceback.print_exc()
        return get_fallback_plan(idea)
