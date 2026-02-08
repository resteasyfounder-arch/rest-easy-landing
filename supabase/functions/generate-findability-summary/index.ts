import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { answers, score, questions } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build a readable summary of the user's answers for the AI
    const answerSummary = questions
      .map((q: { id: string; question: string; categoryLabel: string }) => {
        const answer = answers[q.id] || "skipped";
        return `- ${q.categoryLabel}: "${q.question}" → ${answer}`;
      })
      .join("\n");

    const systemPrompt = `You are Remy, a warm and knowledgeable guide from Rest Easy. You just reviewed someone's Findability Assessment answers — this measures how easily a trusted person could find and access their important information in an emergency.

Your tone is calm, caring, direct, and encouraging. You speak like a wise friend, not a robot. Never use bullet points or lists. Write in flowing prose paragraphs.

You must return a JSON object with exactly these three fields:
- "summary": A 3-4 sentence personalized summary addressing their specific strengths and gaps. Reference their actual answers. Be specific, not generic.
- "top_priority": One sentence identifying the single most impactful thing they should address first, based on their weakest area.
- "encouragement": One warm sentence acknowledging the step they just took and what comes next.`;

    const userPrompt = `Here are the assessment results:

Score: ${score}/100

Answers:
${answerSummary}

Generate a personalized summary as Remy.`;

    console.log("Calling AI gateway for findability summary...");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "findability_summary",
                description:
                  "Return a personalized findability assessment summary.",
                parameters: {
                  type: "object",
                  properties: {
                    summary: { type: "string" },
                    top_priority: { type: "string" },
                    encouragement: { type: "string" },
                  },
                  required: ["summary", "top_priority", "encouragement"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "findability_summary" },
          },
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("AI gateway error:", status, text);

      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway returned ${status}`);
    }

    const data = await response.json();
    console.log("AI gateway response received");

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-findability-summary error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
        // Fallback so the UI still works
        summary: "You've taken a meaningful first step by completing this assessment. Your answers reveal areas where a little organization could make a big difference for the people who matter most to you.",
        top_priority: "Start by making sure your trusted person knows where to find your most critical documents.",
        encouragement: "The fact that you're thinking about this puts you ahead of most people.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
