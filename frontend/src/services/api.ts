/**
 * MindForge AI — Frontend API Service
 *
 * Centralised helper for calling the FastAPI backend.
 * Base URL is read from the VITE_API_BASE_URL environment variable
 * so no secrets are hard-coded in the frontend.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/* ------------------------------------------------------------------ */
/*  Generic fetch wrapper                                              */
/* ------------------------------------------------------------------ */

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `API request failed: ${response.status} ${response.statusText} — ${errorBody}`,
    );
  }

  return response.json() as Promise<T>;
}

/* ------------------------------------------------------------------ */
/*  Type definitions                                                   */
/* ------------------------------------------------------------------ */

export interface HealthResponse {
  status: string;
  message: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  type: string;
}

export interface MindMapEdge {
  source: string;
  target: string;
}

export interface MindMapResponse {
  title: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface TasksResponse {
  tasks: Task[];
}

/* ------------------------------------------------------------------ */
/*  API methods                                                        */
/* ------------------------------------------------------------------ */

/** GET /api/health — quick readiness check */
export async function getHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/api/health");
}

/** POST /api/generate-mindmap — generate a mind-map from a transcript */
export async function generateMindMap(transcript: string): Promise<MindMapResponse> {
  return apiFetch<MindMapResponse>("/api/generate-mindmap", {
    method: "POST",
    body: JSON.stringify({ transcript }),
  });
}

/** POST /api/generate-tasks — generate actionable tasks from mind-map nodes */
export async function generateTasks(nodes: MindMapNode[]): Promise<TasksResponse> {
  return apiFetch<TasksResponse>("/api/generate-tasks", {
    method: "POST",
    body: JSON.stringify({ nodes }),
  });
}
