// deno-lint-ignore-file

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface SectionSummaryRequest {
  sectionId: string;
  sectionLabel: string;
  answers: Array<{
    question_text?: string;
    answer_value: string;
    answer_label?: string;
  }>;
}

const systemPrompt = `You are a compassionate advisor helping people prepare for end-of-life planning. 
Your role is to provide a brief, encouraging insight based on their assessment answers for a specific section.

Guidelines:
- Be warm, supportive, and non-judgmental
- Focus on what they've done well and gently note areas for growth
- Keep the insight to 2-3 sentences maximum
- Use "you" language to make it personal
- Avoid clinical or legal jargon
- End with an encouraging note or gentle suggestion

Example outputs:
- "You've taken important steps to document your healthcare wishes, which will give your loved ones clarity during difficult moments. Consider reviewing these documents annually to ensure they still reflect your preferences."
- "While you're just getting started with financial documentation, recognizing this need is the first step. Even organizing one account this week would be meaningful progress."`;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const openAIKey = Deno.env.get("OPENAI_API_KEY");
  if (!openAIKey) {
    console.error("OPENAI_API_KEY not configured");
    return jsonResponse({ error: "OpenAI API key not configured" }, 500);
  }

  try {
    const payload: SectionSummaryRequest = await req.json();
    const { sectionId, sectionLabel, answers } = payload;

    if (!sectionLabel || !answers || answers.length === 0) {
      return jsonResponse({ error: "Missing required fields" }, 400);
    }

    // Build a summary of answers for the prompt
    const answerSummary = answers
      .map((a, i) => {
        const question = a.question_text || `Question ${i + 1}`;
        const answer = a.answer_label || a.answer_value;
        return `- ${question}: ${answer}`;
      })
      .join("\n");

    // Count answer types
    const yesCount = answers.filter((a) => a.answer_value === "yes").length;
    const partialCount = answers.filter((a) => a.answer_value === "partial").length;
    const noCount = answers.filter((a) => a.answer_value === "no").length;

    const userPrompt = `Section: ${sectionLabel}

Answer breakdown: ${yesCount} ready, ${partialCount} in progress, ${noCount} need attention

Responses:
${answerSummary}

Provide a brief, personalized insight (2-3 sentences) for this person based on their ${sectionLabel} assessment.`;

    console.log(`[generate-section-summary] Generating insight for section: ${sectionLabel}`);

    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAIKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error("OpenAI API error:", errorText);
      return jsonResponse({ error: "Failed to generate insight" }, 500);
    }

    const openAIData = await openAIResponse.json();
    const insight = openAIData.choices?.[0]?.message?.content?.trim();

    if (!insight) {
      return jsonResponse({ error: "No insight generated" }, 500);
    }

    console.log(`[generate-section-summary] Generated insight for ${sectionLabel}`);

    return jsonResponse({
      sectionId,
      sectionLabel,
      insight,
    });
  } catch (error) {
    console.error("Error generating section summary:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
