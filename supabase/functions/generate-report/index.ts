import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface ReportRequest {
  userName: string;
  profile: Record<string, unknown>;
  overallScore: number;
  tier: string;
  sectionScores: Record<string, { score: number; label: string; weight: number }>;
  answers: Array<{
    question_id: string;
    section_id: string;
    question_text: string;
    answer_value: string;
    answer_label: string;
    score_fraction: number | null;
  }>;
  schema: {
    answer_scoring: Record<string, number | null>;
    score_bands: Array<{ min: number; max: number; label: string }>;
    sections: Array<{ id: string; label: string; weight: number }>;
  };
}

const systemPrompt = `You are a compassionate end-of-life planning advisor for Rest Easy. Your role is to analyze assessment results and generate personalized, actionable reports that help people prepare for the future.

TONE & VOICE:
- Warm, supportive, and non-judgmental
- Encouraging about progress made, realistic about gaps
- Never alarmist, always constructive
- Address the user by their first name throughout
- Use "you" and "your" to keep it personal
- Celebrate strengths genuinely before addressing gaps
- Write in a professional yet approachable manner

SCORING CONTEXT:
- Answer values and their scores:
  - "yes" = fully prepared (1.0)
  - "partial" = in progress (0.5)
  - "no" = not addressed (0.0)
  - "not_sure" = needs clarification (0.25)
  - "na" = not applicable (excluded from scoring)

TIER DEFINITIONS (from score bands):
- 80-100%: "Rest Easy Ready" - Highly Prepared
- 60-79%: "Well Prepared" - Moderately Prepared
- 40-59%: "On Your Way" - Limited Preparedness
- 0-39%: "Getting Started" - Low Readiness / High Risk

SECTION WEIGHTS (for prioritization - higher weight = more important):
- Legal Planning: 25% (highest priority)
- Financial & Insurance: 20%
- Health Care: 15%
- Family Relationships: 10%
- Home, Pet & Daily Life: 10%
- Digital Life: 5%
- Funeral, Memorial: 5%
- Home & Personal Property: 3%
- Emotional & Spiritual: 3%
- Document Storage: 2%
- Supporting Aging Parents: 2% (if applicable)

ANALYSIS GUIDELINES:
1. Identify patterns in answers - multiple "no" answers in one section = major gap
2. Connect profile to answers - if they have dependents but haven't documented guardian info, flag this
3. Prioritize action items by impact (weight) and ease of completion
4. Provide specific, actionable recommendations, not vague advice
5. Reference specific answers to make feedback feel personalized
6. Consider life stage context from profile data
7. High-weight sections with low scores should be emphasized as priorities
8. Look for quick wins - items marked "partial" that can easily become "yes"`;

function buildUserPrompt(data: ReportRequest): string {
  const profileDetails = Object.entries(data.profile)
    .map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`)
    .join('\n');

  const sectionScoresText = Object.entries(data.sectionScores)
    .map(([id, info]) => `- ${info.label}: ${info.score}% (weight: ${info.weight}%)`)
    .join('\n');

  // Group answers by section
  const answersBySection: Record<string, typeof data.answers> = {};
  for (const answer of data.answers) {
    if (!answersBySection[answer.section_id]) {
      answersBySection[answer.section_id] = [];
    }
    answersBySection[answer.section_id].push(answer);
  }

  const detailedAnswersText = Object.entries(answersBySection)
    .map(([sectionId, sectionAnswers]) => {
      const sectionInfo = data.sectionScores[sectionId];
      const sectionLabel = sectionInfo?.label || `Section ${sectionId}`;
      const sectionScore = sectionInfo?.score || 0;
      
      const answersText = sectionAnswers
        .map(a => `Q: ${a.question_text}\nA: ${a.answer_label} (Score: ${a.score_fraction !== null ? a.score_fraction : 'N/A'})`)
        .join('\n\n');
      
      return `## ${sectionLabel} (Score: ${sectionScore}%)\n${answersText}`;
    })
    .join('\n\n');

  return `Generate a comprehensive End-of-Life Readiness Report for the following user.

USER PROFILE:
- Name: ${data.userName}
${profileDetails}

ASSESSMENT RESULTS:
- Overall Score: ${data.overallScore}%
- Tier: ${data.tier}

SECTION SCORES:
${sectionScoresText}

DETAILED ANSWERS:
${detailedAnswersText}

Based on this data, generate the report using the generate_report function. Make it personal, actionable, and encouraging.`;
}

const reportToolDefinition = {
  type: "function",
  function: {
    name: "generate_report",
    description: "Generate structured report sections based on assessment data",
    parameters: {
      type: "object",
      properties: {
        tier: {
          type: "string",
          enum: ["Getting Started", "On Your Way", "Well Prepared", "Rest Easy Ready"],
          description: "The readiness tier based on overall score"
        },
        executive_summary: {
          type: "string",
          description: "2-3 paragraphs addressing user by name, summarizing score, key strengths, and main opportunities. Warm and encouraging tone."
        },
        immediate_actions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string", description: "2-3 sentences explaining what to do and why" },
              priority: { type: "number", description: "1 = highest priority, 3 = lowest" }
            },
            required: ["title", "description", "priority"]
          },
          description: "Top 3 highest-impact actions to take immediately"
        },
        category_analyses: {
          type: "array",
          items: {
            type: "object",
            properties: {
              section_id: { type: "string" },
              section_label: { type: "string" },
              score: { type: "number" },
              analysis: { type: "string", description: "2-4 sentences analyzing this category's results, referencing specific answers" }
            },
            required: ["section_id", "section_label", "score", "analysis"]
          },
          description: "Analysis for each section that has answers"
        },
        strengths: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string", description: "Short title like 'Proactive Estate Planning'" },
              description: { type: "string", description: "2-3 sentences explaining why this is a strength" }
            },
            required: ["title", "description"]
          },
          description: "4-6 key strengths based on 'yes' answers and high section scores"
        },
        areas_requiring_attention: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              priority: { type: "string", enum: ["PRIORITY", "IMPORTANT"] }
            },
            required: ["title", "description", "priority"]
          },
          description: "4-6 key gaps based on 'no' answers and low section scores. PRIORITY for critical items, IMPORTANT for secondary."
        },
        action_plan: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              why_it_matters: { type: "string" },
              effort: { type: "string", enum: ["Less than 1 hour", "A few hours", "May require professional assistance"] },
              timeline: { type: "string", enum: ["Complete this week", "Complete this month", "Complete within 3 months"] },
              priority: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] }
            },
            required: ["title", "description", "why_it_matters", "effort", "timeline", "priority"]
          },
          description: "6-8 specific action items prioritized by impact"
        },
        timeline: {
          type: "object",
          properties: {
            week_1_2: { type: "array", items: { type: "string" }, description: "3-4 quick wins for the first two weeks" },
            month_1_2: { type: "array", items: { type: "string" }, description: "3-4 medium-term goals for months 1-2" },
            month_3_6: { type: "array", items: { type: "string" }, description: "3-4 longer-term goals for months 3-6" }
          },
          required: ["week_1_2", "month_1_2", "month_3_6"]
        },
        closing_message: {
          type: "string",
          description: "Warm, personalized 2-3 paragraph closing letter addressing user by name, celebrating their progress and encouraging next steps"
        }
      },
      required: ["tier", "executive_summary", "immediate_actions", "category_analyses", "strengths", "areas_requiring_attention", "action_plan", "timeline", "closing_message"]
    }
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiApiKey) {
    console.error("OPENAI_API_KEY is not configured");
    return jsonResponse({ error: "OpenAI API key is not configured" }, 500);
  }

  let payload: ReportRequest;
  try {
    payload = await req.json();
  } catch (_err) {
    return jsonResponse({ error: "Invalid JSON payload" }, 400);
  }

  // Validate required fields
  if (!payload.userName || !payload.answers || payload.answers.length === 0) {
    return jsonResponse({ error: "Missing required fields: userName and answers" }, 400);
  }

  console.log("Generating report for user:", payload.userName);
  console.log("Overall score:", payload.overallScore);
  console.log("Number of answers:", payload.answers.length);

  try {
    const userPrompt = buildUserPrompt(payload);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [reportToolDefinition],
        tool_choice: { type: "function", function: { name: "generate_report" } },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return jsonResponse({ error: "Rate limit exceeded. Please try again in a moment." }, 429);
      }
      if (response.status === 401) {
        return jsonResponse({ error: "Invalid API key configuration" }, 500);
      }
      
      return jsonResponse({ error: "Failed to generate report" }, 500);
    }

    const data = await response.json();
    console.log("OpenAI response received");

    // Extract the tool call response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "generate_report") {
      console.error("Unexpected response format:", JSON.stringify(data));
      return jsonResponse({ error: "Unexpected response format from AI" }, 500);
    }

    let reportContent;
    try {
      reportContent = JSON.parse(toolCall.function.arguments);
    } catch (_err) {
      console.error("Failed to parse tool call arguments:", toolCall.function.arguments);
      return jsonResponse({ error: "Failed to parse report content" }, 500);
    }

    // Construct the full report
    const report = {
      ...reportContent,
      overallScore: payload.overallScore,
      generatedAt: new Date().toISOString(),
      userName: payload.userName,
    };

    console.log("Report generated successfully for:", payload.userName);

    return jsonResponse({ report });
  } catch (err) {
    console.error("Error generating report:", err);
    return jsonResponse({ 
      error: err instanceof Error ? err.message : "Unknown error occurred" 
    }, 500);
  }
});
