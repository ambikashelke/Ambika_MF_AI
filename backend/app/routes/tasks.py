"""
MindForge AI — Tasks Route

POST /api/generate-tasks
Accepts mind-map nodes and returns actionable tasks.
"""

from fastapi import APIRouter

from app.models.schemas import TasksRequest, TasksResponse, TaskUpdateRequest
from app.services.ai_service import generate_tasks_from_nodes

router = APIRouter()


@router.post("/api/generate-tasks", response_model=TasksResponse)
async def generate_tasks(payload: TasksRequest):
    """Generate actionable tasks from the provided mind-map nodes."""
    return generate_tasks_from_nodes(payload.nodes)


@router.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str):
    """Delete a task."""
    return {"success": True}


@router.patch("/api/tasks/{task_id}")
async def update_task(task_id: str, payload: TaskUpdateRequest):
    """Update task completion status."""
    return {"id": task_id, "completed": payload.completed}
