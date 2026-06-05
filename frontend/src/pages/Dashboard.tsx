import { useState, useCallback, useEffect, Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Brain, Plus, LogOut, Download, Trash2, Loader2, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getAll, updateRecord, deleteRecord, createRecord } from "@/services/db";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

interface MindMapNode {
  id: string;
  label: string;
  children: MindMapNode[];
}

interface TaskRow {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
}

interface MindMapRow {
  id: string;
  title: string;
  nodes: any;
  edges: any;
  created_at: string;
}

const sampleTranscript = "I want to build a mobile app for fitness tracking. It should have workout logging, nutrition tracking, social features for sharing progress, and integration with wearable devices. We need a clean UI with dark mode support.";


const MindMapViz = ({ node, depth = 0 }: { node: MindMapNode; depth?: number }) => {
  const colors = ["text-primary", "text-secondary", "text-primary", "text-secondary"];
  const bgColors = ["bg-primary/20", "bg-secondary/20", "bg-primary/10", "bg-secondary/10"];

  return (
    <div className={`${depth > 0 ? "ml-6 border-l-2 border-border/50 pl-4" : ""}`}>
      <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium ${bgColors[depth % 4]} ${colors[depth % 4]} mb-2`}>
        <div className={`w-2 h-2 rounded-full ${depth === 0 ? "gradient-primary" : "bg-current"}`} />
        {node.label}
      </div>
      {node.children?.map((child) => (
        <MindMapViz key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
};

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: (error: Error) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class MindMapErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("MindMapErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}

const buildMindMapTree = (nodes: any[], edges: any[]): MindMapNode | null => {
  if (!nodes || nodes.length === 0) return null;
  
  const nodeMap = new Map<string, MindMapNode>();
  nodes.forEach((n) => {
    nodeMap.set(n.id, {
      id: n.id,
      label: n.label,
      children: [],
    });
  });

  edges.forEach((edge) => {
    const parent = nodeMap.get(edge.source);
    const child = nodeMap.get(edge.target);
    if (parent && child) {
      parent.children.push(child);
    }
  });

  const rootNode = nodes.find((n) => n.type === "root") || nodes[0];
  if (!rootNode) return null;

  return nodeMap.get(rootNode.id) || null;
};

const mapAiMindMapToTree = (apiMindMap: any): MindMapNode | null => {
  if (!apiMindMap) return null;

  let idCounter = 1;
  const generateId = () => `node_${idCounter++}_${Date.now()}`;

  const mapNode = (node: any): MindMapNode => {
    const label = node.label || node.root || "Topic";
    const rawChildren = node.children || [];
    return {
      id: generateId(),
      label,
      children: rawChildren.map((c: any) => mapNode(c)),
    };
  };

  return mapNode(apiMindMap);
};

const Dashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [mindMap, setMindMap] = useState<MindMapNode | null>(null);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [recentMaps, setRecentMaps] = useState<MindMapRow[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [rawMindMapData, setRawMindMapData] = useState<any>(null);

  // Load tasks + recent mind maps on mount
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [{ data: taskData }, { data: mapData }] = await Promise.all([
          getAll<TaskRow>("tasks", { orderBy: { column: "created_at", ascending: false }, pageSize: 50, page: 0 }),
          getAll<MindMapRow>("mind_maps", { orderBy: { column: "created_at", ascending: false }, pageSize: 5, page: 0 }),
        ]);
        setTasks(taskData);
        setRecentMaps(mapData);
        if (mapData[0]) {
          setMindMap(mapData[0].nodes as unknown as MindMapNode);
          setRawMindMapData(mapData[0]);
        }
      } catch (e: any) {
        toast({ title: "Failed to load data", description: e?.message, variant: "destructive" });
      }
    })();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleRecord = useCallback(() => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setTranscript(sampleTranscript);
        setIsRecording(false);
      }, 2000);
    } else {
      setIsRecording(false);
    }
  }, [isRecording]);

  const generatePlan = async () => {
    if (!transcript.trim()) {
      toast({ title: "Add a transcript first", variant: "destructive" });
      return;
    }
    if (!user?.id) {
      toast({ title: "Authentication error", description: "You must be logged in to generate plans.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    console.log("Starting AI Mind Map & Task generation...");
    console.log("User ID:", user.id);
    console.log("Transcript Idea:", transcript);

    const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

    try {
      // 1. Call POST /api/generate-plan
      const planUrl = `${apiBase}/api/generate-plan`;
      console.log(`Sending POST request to ${planUrl}`);
      
      const planRes = await fetch(planUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: transcript }),
      });

      console.log("AI Plan Response status:", planRes.status);

      if (!planRes.ok) {
        const err = await planRes.json().catch(() => ({}));
        throw new Error(err?.detail ?? `AI plan generation failed with status ${planRes.status}`);
      }

      const planData = await planRes.json();
      console.log("Received AI plan response:", planData);

      // Validate response structure
      if (!planData.mindMap || !planData.tasks) {
        throw new Error("Invalid response format from AI service.");
      }

      // Convert the backend's hierarchical mind map to our tree structure
      const tree = mapAiMindMapToTree(planData.mindMap);
      if (!tree) {
        throw new Error("Failed to parse AI mind map structure.");
      }

      console.log("Mapped AI Mind Map Tree:", tree);

      // Update state to render nodes IMMEDIATELY
      setRawMindMapData(planData.mindMap);
      setMindMap(tree);

      // Map backend tasks to frontend expectations
      // Tasks from /api/generate-plan are string arrays
      const mappedTasks = planData.tasks.map((taskStr: string, idx: number) => ({
        id: `temp_task_${idx}_${Date.now()}`,
        title: taskStr,
        status: "todo" as const,
      }));

      // Render tasks in Tasks panel IMMEDIATELY
      setTasks((prev) => [...mappedTasks, ...prev]);

      toast({
        title: "AI Plan generated successfully!",
        description: `Rendered AI mind map and ${mappedTasks.length} tasks.`,
      });

      // Persist to Supabase database in background / separately
      try {
        console.log("Saving AI mind map to Supabase...");
        const savedMap = await createRecord<MindMapRow>("mind_maps", {
          title: planData.title || "AI Mind Map",
          nodes: tree as any,
          edges: [] as any,
          user_id: user.id,
        });
        console.log("AI Mind map successfully saved to Supabase:", savedMap);
        setRecentMaps((prev) => [savedMap, ...prev].slice(0, 5));
        setRawMindMapData(savedMap);

        console.log("Saving tasks to Supabase...");
        const taskPromises = planData.tasks.map((taskStr: string) =>
          createRecord<TaskRow>("tasks", {
            title: taskStr,
            status: "todo",
            user_id: user.id,
          })
        );
        const savedTasks = await Promise.all(taskPromises);
        console.log("AI Tasks successfully saved to Supabase:", savedTasks);

        // Replace temporary local tasks with persisted database tasks
        setTasks((prev) => {
          const filtered = prev.filter((p) => !mappedTasks.some((mt) => mt.id === p.id));
          return [...savedTasks, ...filtered];
        });
      } catch (dbErr: any) {
        console.error("Database persistence warning:", dbErr);
        toast({
          title: "Database Sync Warning",
          description: "Plan was generated but could not be saved to the database.",
          variant: "default",
        });
      }

    } catch (aiError: any) {
      console.warn("AI generation failed, falling back to current generator...", aiError);
      
      // Show a friendly error toast informing the user about the fallback
      toast({
        title: "AI Service unavailable",
        description: `Generating plan using fallback engine: ${aiError.message || "Unknown error"}`,
        variant: "default",
      });

      // Trigger current fallback generator sequence
      try {
        console.log("Running fallback generator sequence...");
        
        // Fallback: 1. Generate Mind Map
        const mindmapRes = await fetch(`${apiBase}/api/generate-mindmap`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript }),
        });

        if (!mindmapRes.ok) {
          throw new Error(`Fallback mind map failed: status ${mindmapRes.status}`);
        }

        const mindmapData = await mindmapRes.json();
        const tree = buildMindMapTree(mindmapData.nodes, mindmapData.edges);
        if (!tree) throw new Error("Fallback tree build failed.");

        // Render fallback mindmap immediately
        setRawMindMapData(mindmapData);
        setMindMap(tree);

        // Fallback: 2. Generate Tasks
        const tasksRes = await fetch(`${apiBase}/api/generate-tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes: mindmapData.nodes }),
        });

        if (!tasksRes.ok) {
          throw new Error(`Fallback tasks failed: status ${tasksRes.status}`);
        }

        const tasksData = await tasksRes.json();
        const mappedTasks = tasksData.tasks.map((t: any) => ({
          id: t.id,
          title: t.text,
          status: t.completed ? "done" : ("todo" as const),
        }));

        setTasks((prev) => [...mappedTasks, ...prev]);

        toast({
          title: "Fallback Plan generated!",
          description: `Rendered fallback mind map and ${mappedTasks.length} tasks.`,
        });

        // Save fallback data to database in background
        try {
          const savedMap = await createRecord<MindMapRow>("mind_maps", {
            title: mindmapData.title || "Fallback Mind Map",
            nodes: tree as any,
            edges: mindmapData.edges as any,
            user_id: user.id,
          });
          setRecentMaps((prev) => [savedMap, ...prev].slice(0, 5));
          setRawMindMapData(savedMap);

          const taskPromises = tasksData.tasks.map((t: any) =>
            createRecord<TaskRow>("tasks", {
              title: t.text,
              status: t.completed ? "done" : "todo",
              user_id: user.id,
            })
          );
          const savedTasks = await Promise.all(taskPromises);
          
          setTasks((prev) => {
            const filtered = prev.filter((p) => !mappedTasks.some((mt) => mt.id === p.id));
            return [...savedTasks, ...filtered];
          });
        } catch (dbErr) {
          console.error("Fallback database save failed:", dbErr);
        }

      } catch (fallbackError: any) {
        console.error("Both AI and Fallback generation failed:", fallbackError);
        toast({
          title: "Generation failed",
          description: "Both the AI generator and fallback generator failed. Please check your connection.",
          variant: "destructive",
        });
      }
    } finally {
      setIsGenerating(false);
      console.log("Plan generation process completed.");
    }
  };

  const toggleTask = async (task: TaskRow) => {
    const nextStatus = task.status === "done" ? "todo" : "done";
    const oldCompleted = task.status === "done";
    const newCompleted = nextStatus === "done";

    console.log("Toggling task status...");
    console.log("Task ID:", task.id);
    console.log("Old completed value:", oldCompleted);
    console.log("New completed value:", newCompleted);

    // 1. Optimistic UI update: instantly update UI
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));

    const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
    const requestUrl = `${apiBase}/api/tasks/${task.id}`;

    try {
      // 2. Call backend PATCH endpoint
      console.log(`Sending PATCH request to ${requestUrl}`);
      const res = await fetch(requestUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newCompleted }),
      });

      console.log("Response status:", res.status);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail ?? `Server returned status ${res.status}`);
      }

      const responseData = await res.json();
      console.log("API response:", responseData);

      // 3. Update database completed status (if connected)
      try {
        console.log("Syncing task update with Supabase database...");
        await updateRecord("tasks", task.id, { status: nextStatus });
        console.log("Task successfully synced with database.");
      } catch (dbError: any) {
        console.warn("Supabase database sync failed (non-blocking):", dbError);
      }

    } catch (e: any) {
      console.error("Task update failed:", e);
      // Rollback UI update if API request fails
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)));
      toast({
        title: "Update failed",
        description: e?.message || "Could not toggle the task completion status on the backend.",
        variant: "destructive",
      });
    }
  };

  const removeTask = async (id: string) => {
    const prev = tasks;
    
    // 1. Remove task from UI immediately
    setTasks((p) => p.filter((t) => t.id !== id));

    const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
    const requestUrl = `${apiBase}/api/tasks/${id}`;

    console.log("Starting task deletion...");
    console.log("Task ID:", id);
    console.log("Request URL:", requestUrl);

    try {
      // 2. Call backend API delete endpoint
      const res = await fetch(requestUrl, {
        method: "DELETE",
      });

      console.log("Response status:", res.status);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail ?? `Server returned status ${res.status}`);
      }

      const data = await res.json();
      console.log("Delete response data:", data);

      // 3. Delete from Supabase database (if connected)
      try {
        console.log("Deleting task from Supabase database...");
        await deleteRecord("tasks", id);
        console.log("Task successfully deleted from Supabase database.");
      } catch (dbError: any) {
        console.warn("Supabase database deletion failed (non-blocking):", dbError);
      }

      toast({
        title: "Task deleted",
        description: "The task was successfully deleted.",
      });

    } catch (e: any) {
      console.error("Task deletion failed:", e);
      // Revert UI state on backend failure
      setTasks(prev);
      toast({
        title: "Delete failed",
        description: e?.message || "Could not delete the task from the backend.",
        variant: "destructive",
      });
    }
  };

  const exportTasks = () => {
    const text = tasks.map((t) => `[${t.status === "done" ? "x" : " "}] ${t.title}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindforge-tasks.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
        <Link to="/"><img src={logo} alt="MindForge AI" className="h-12" /></Link>
        <div className="flex items-center gap-3">
          {tasks.length > 0 && (
            <Button variant="outline" size="sm" onClick={exportTasks}>
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Voice Panel */}
        <div className="lg:col-span-3 gradient-card rounded-2xl border border-border/50 shadow-card p-6 flex flex-col">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Mic className="w-5 h-5 text-primary" /> Voice Input
          </h2>
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <button
              onClick={handleRecord}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                isRecording ? "bg-destructive animate-pulse-glow" : "gradient-primary glow-primary hover:scale-110"
              }`}
            >
              {isRecording ? <MicOff className="w-8 h-8 text-primary-foreground" /> : <Mic className="w-8 h-8 text-primary-foreground" />}
            </button>
            <p className="text-sm text-muted-foreground">
              {isRecording ? "Recording... tap to stop" : "Tap to start recording"}
            </p>
          </div>
          <div className="mt-4 space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Transcript</h3>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Tap mic above, or type/paste your brain-dump here..."
              className="min-h-[120px] text-sm bg-muted resize-none"
            />
            <Button
              variant="hero"
              size="sm"
              className="w-full"
              onClick={generatePlan}
              disabled={isGenerating || !transcript.trim()}
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-1" /> Generate Mind Map & Tasks</>
              )}
            </Button>
          </div>
          {recentMaps.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Recent Maps</h3>
              <ul className="space-y-1">
                {recentMaps.map((m) => (
                  <li key={m.id} className="text-xs text-muted-foreground truncate bg-muted/50 rounded px-2 py-1">
                    {m.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Mind Map Panel */}
        <div className="lg:col-span-5 gradient-card rounded-2xl border border-border/50 shadow-card p-6 overflow-auto flex flex-col">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-secondary" /> Mind Map
          </h2>
          {mindMap ? (
            <MindMapErrorBoundary
              fallback={(error) => (
                <div className="space-y-4">
                  <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg">
                    <p className="font-semibold mb-1">Failed to render Mind Map Viz:</p>
                    <p>{error.message}</p>
                  </div>
                  {rawMindMapData && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Raw Response Data:</p>
                      <pre className="text-xs p-3 bg-muted rounded-lg overflow-auto max-h-60 text-muted-foreground">
                        {JSON.stringify(rawMindMapData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            >
              <div className="space-y-2">
                <MindMapViz node={mindMap} />
              </div>
            </MindMapErrorBoundary>
          ) : (
            <div className="flex-1 flex items-center justify-center h-64 text-muted-foreground text-sm">
              {isGenerating ? "AI is structuring your thoughts..." : "Record or type a brain-dump, then generate"}
            </div>
          )}
        </div>

        {/* Task Panel */}
        <div className="lg:col-span-4 gradient-card rounded-2xl border border-border/50 shadow-card p-6 overflow-auto">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Tasks
            {tasks.length > 0 && (
              <span className="ml-auto text-xs text-muted-foreground">
                {doneCount}/{tasks.length} done
              </span>
            )}
          </h2>
          {tasks.length > 0 ? (
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className={`group flex items-center gap-3 p-3 rounded-lg transition-all text-sm ${
                    task.status === "done" ? "bg-primary/10 text-muted-foreground" : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <button
                    onClick={() => toggleTask(task)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      task.status === "done" ? "border-primary bg-primary" : "border-border"
                    }`}
                  >
                    {task.status === "done" && <span className="text-primary-foreground text-xs">✓</span>}
                  </button>
                  <span className={`flex-1 ${task.status === "done" ? "line-through" : ""}`}>{task.title}</span>
                  <button
                    onClick={() => removeTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
              Tasks will appear after generating from mind map
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
