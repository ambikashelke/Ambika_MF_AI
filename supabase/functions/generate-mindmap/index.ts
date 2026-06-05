import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MindMapNode {
  id: string;
  label: string;
  children: MindMapNode[];
}

const tool = {
  type: "function",
  function: {
    name: "build_plan",
    description:
      "Turn a spoken brain-dump into a hierarchical mind map and a flat list of actionable tasks.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Short title for the mind map (max 6 words)." },
        mind_map: {
          type: "object",
          description: "Root node with up to 3 levels of children.",
          properties: {
            label: { type: "string" },
            children: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  children: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        label: { type: "string" },
                        children: { type: "array", items: { type: "object" } },
                      },
                      required: ["label"],
                    },
                  },
                },
                required: ["label"],
              },
            },
          },
          required: ["label", "children"],
        },
        tasks: {
          type: "array",
          description: "5-10 concrete next-step tasks derived from the transcript.",
          items: { type: "string" },
        },
      },
      required: ["title", "mind_map", "tasks"],
      additionalProperties: false,
    },
  },
};

const addIds = (n: any, prefix = "n"): MindMapNode => ({
  id: `${prefix}-${Math.random().toString(36).slice(2, 8)}`,
  label: String(n.label ?? "Untitled"),
  children: Array.isArray(n.children) ? n.children.map((c: any, i: number) => addIds(c, `${prefix}${i}`)) : [],
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const { transcript } = await req.json();
    if (!transcript || typeof transcript !== "string" || transcript.trim().length < 5) {
      return new Response(JSON.stringify({ error: "Transcript too short" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a planning assistant. Convert the user's brain-dump into (1) a concise hierarchical mind map (2-3 levels deep, 3-5 children per node) and (2) 5-10 concrete actionable tasks. Always call the build_plan tool.",
          },
          { role: "user", content: transcript },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "build_plan" } },
      }),
    });

    if (!aiRes.ok) {
      const status = aiRes.status;
      const body = await aiRes.text();
      console.error("AI gateway error", status, body);
      if (status === 429)
        return new Response(JSON.stringify({ error: "Rate limit reached, try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (status === 402)
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const call = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!call?.function?.arguments) {
      console.error("No tool call in response", JSON.stringify(aiJson));
      throw new Error("AI did not return a structured plan");
    }
    const parsed = JSON.parse(call.function.arguments);
    const title: string = parsed.title || "Mind Map";
    const rootWithIds = addIds({ label: parsed.mind_map.label, children: parsed.mind_map.children ?? [] }, "root");
    const taskTitles: string[] = Array.isArray(parsed.tasks) ? parsed.tasks.slice(0, 12) : [];

    // Persist mind map
    const { data: mapRow, error: mapErr } = await supabase
      .from("mind_maps")
      .insert({ user_id: userId, title, nodes: rootWithIds as any, edges: [] as any })
      .select()
      .single();
    if (mapErr) throw mapErr;

    // Persist tasks
    let createdTasks: any[] = [];
    if (taskTitles.length > 0) {
      const { data: taskRows, error: taskErr } = await supabase
        .from("tasks")
        .insert(taskTitles.map((t) => ({ user_id: userId, title: t, status: "todo" as const })))
        .select();
      if (taskErr) throw taskErr;
      createdTasks = taskRows ?? [];
    }

    return new Response(
      JSON.stringify({ mindMap: rootWithIds, mapRow, tasks: createdTasks, title }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-mindmap error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
