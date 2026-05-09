// AI editorial generator. Uses Lovable AI gateway, caches result in `editorials` table.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "npm:zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BodySchema = z.object({ slug: z.string().min(1).max(120) });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: problem, error: pErr } = await supabase
      .from("problems")
      .select("id, title, difficulty, description, examples, constraints, topics")
      .eq("slug", parsed.data.slug)
      .maybeSingle();

    if (pErr || !problem) {
      return new Response(JSON.stringify({ error: "Problem not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check cache
    const { data: cached } = await supabase
      .from("editorials")
      .select("intuition, approach, complexity, solutions")
      .eq("problem_id", problem.id)
      .maybeSingle();

    if (cached) {
      return new Response(JSON.stringify({ ...cached, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a world-class coding interview coach. Generate a clear, structured editorial for a programming problem. Be concise but rigorous. Always provide complete, runnable solutions.`;

    const userPrompt = `Problem: ${problem.title} (${problem.difficulty})
Topics: ${(problem.topics || []).join(", ")}

Description:
${problem.description}

${problem.examples?.length ? `Examples:\n${JSON.stringify(problem.examples, null, 2)}` : ""}

${problem.constraints?.length ? `Constraints:\n${(problem.constraints as string[]).join("\n")}` : ""}

Generate the editorial.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "write_editorial",
            description: "Write a structured editorial for a coding problem",
            parameters: {
              type: "object",
              properties: {
                intuition: { type: "string", description: "Plain-English intuition (2-4 sentences)" },
                approach: { type: "string", description: "Step-by-step optimal approach with reasoning (markdown allowed)" },
                complexity: { type: "string", description: "Time + space complexity with brief justification" },
                solutions: {
                  type: "object",
                  properties: {
                    python: { type: "string", description: "Complete working Python solution that reads stdin and prints output matching the test format" },
                    javascript: { type: "string", description: "Complete working JavaScript solution (Node.js, reads stdin)" },
                    java: { type: "string", description: "Complete working Java solution with Main class and stdin" },
                    cpp: { type: "string", description: "Complete working C++ solution with main() and stdin" },
                  },
                  required: ["python", "javascript", "java", "cpp"],
                  additionalProperties: false,
                },
              },
              required: ["intuition", "approach", "complexity", "solutions"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "write_editorial" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Lovable workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      throw new Error(`AI gateway returned ${aiResp.status}`);
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI returned no editorial");
    const editorial = JSON.parse(toolCall.function.arguments);

    // Cache it
    await supabase.from("editorials").insert({
      problem_id: problem.id,
      intuition: editorial.intuition,
      approach: editorial.approach,
      complexity: editorial.complexity,
      solutions: editorial.solutions,
    });

    return new Response(JSON.stringify({ ...editorial, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-editorial error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
