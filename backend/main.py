"""
MindForge AI — FastAPI Application Entry-Point

Configures CORS, registers all route modules, and exposes the ASGI
application object (`app`) that uvicorn will serve.

Run with:
    python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.routes import health, mindmap, tasks, plan

# ── Application instance ──────────────────────────────────────────────
app = FastAPI(
    title="MindForge AI Backend",
    description="Backend API for the MindForge AI platform",
    version="0.1.0",
)

# ── CORS ──────────────────────────────────────────────────────────────
# Allow the React dev-server (Vite) to call the backend during
# local development.
origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────
app.include_router(health.router, tags=["Health"])
app.include_router(mindmap.router, tags=["Mind Map"])
app.include_router(tasks.router, tags=["Tasks"])
app.include_router(plan.router, tags=["Plan"])


@app.get("/")
async def root():
    """Root redirect hint — the API lives under /api/*."""
    return {
        "message": "Welcome to MindForge AI Backend",
        "docs": "/docs",
        "health": "/api/health",
    }
