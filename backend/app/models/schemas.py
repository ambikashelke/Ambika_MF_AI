"""
MindForge AI — Pydantic Schemas

Request / response models for the API routes.
"""

from pydantic import BaseModel


# ── Health ────────────────────────────────────────────────────────────
class HealthResponse(BaseModel):
    status: str
    message: str


# ── Mind Map ──────────────────────────────────────────────────────────
class MindMapRequest(BaseModel):
    transcript: str


class MindMapNode(BaseModel):
    id: str
    label: str
    type: str


class MindMapEdge(BaseModel):
    source: str
    target: str


class MindMapResponse(BaseModel):
    title: str
    nodes: list[MindMapNode]
    edges: list[MindMapEdge]


# ── Tasks ─────────────────────────────────────────────────────────────
class TaskItem(BaseModel):
    id: str
    text: str
    completed: bool


class TasksRequest(BaseModel):
    nodes: list[MindMapNode]


class TasksResponse(BaseModel):
    tasks: list[TaskItem]


class TaskUpdateRequest(BaseModel):
    completed: bool


# ── Plan ──────────────────────────────────────────────────────────────
class PlanRequest(BaseModel):
    idea: str


class PlanResponse(BaseModel):
    title: str
    mindMap: dict
    tasks: list[str]
