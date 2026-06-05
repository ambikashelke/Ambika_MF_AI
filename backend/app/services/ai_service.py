"""
MindForge AI — AI Service

Placeholder service layer that will eventually call real AI models.
Currently returns mock data for mind-map and task generation.
"""

from app.models.schemas import (
    MindMapNode,
    MindMapEdge,
    MindMapResponse,
    TaskItem,
    TasksResponse,
)


def generate_mindmap_from_transcript(transcript: str) -> MindMapResponse:
    """
    Generate a mind-map from the given transcript.
    Currently returns mock data — swap for real AI integration later.
    """
    return MindMapResponse(
        title="Generated Mind Map",
        nodes=[
            MindMapNode(id="1", label="Main Idea", type="root"),
            MindMapNode(id="2", label="Planning", type="branch"),
            MindMapNode(id="3", label="Execution", type="branch"),
        ],
        edges=[
            MindMapEdge(source="1", target="2"),
            MindMapEdge(source="1", target="3"),
        ],
    )


def generate_tasks_from_nodes(nodes: list[MindMapNode]) -> TasksResponse:
    """
    Generate actionable tasks from mind-map nodes.
    Currently returns mock data — swap for real AI integration later.
    """
    return TasksResponse(
        tasks=[
            TaskItem(id="1", text="Define the idea", completed=False),
            TaskItem(id="2", text="Create planning", completed=False),
        ]
    )


from services.ai_service import generate_plan_from_ai as _generate_plan_from_ai, get_fallback_plan as _get_fallback_plan

async def generate_plan_from_ai(idea: str) -> dict:
    """Delegates AI plan generation to backend/services/ai_service.py."""
    return await _generate_plan_from_ai(idea)


def get_fallback_plan(idea: str) -> dict:
    """Delegates fallback plan generation to backend/services/ai_service.py."""
    return _get_fallback_plan(idea)



