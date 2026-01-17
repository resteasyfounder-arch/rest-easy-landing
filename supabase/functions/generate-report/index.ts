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

const systemPrompt = `You are a compassionate, experienced end-of-life planning advisor for Rest Easy. Your role is to analyze assessment results and generate comprehensive, deeply personalized reports that guide people through their planning journey.

REPORT STYLE - FOLLOW THIS EXAMPLE CLOSELY:
This is an excerpt from a real report you should emulate. Notice the depth, personal touches, and specific references to answers:

"Dear Alex Murray, Welcome to your personalized Rest Easy End-of-Life Preparedness Report! It's clear from your responses that you are a thoughtful and proactive individual, and we commend your dedication to planning for the future. You're 'On Your Way' with an impressive overall preparedness score of 70%, which is a fantastic foundation to build upon.

We've observed several key strengths in your approach, Alex. Your proactive engagement in estate planning, highlighted by having a properly executed Will and a Financial Power of Attorney, sets a strong precedent. It's particularly impressive that you have very clear and detailed preferences for your funeral or memorial, including music and readings, and have even documented and shared these wishes..."

KEY WRITING GUIDELINES:
1. ADDRESS THE USER BY THEIR FIRST NAME FREQUENTLY throughout the report (at least 2-3 times per major section)
2. Reference SPECIFIC answers they gave - quote their responses when relevant
3. Connect their profile details (age, family status, dependents) to your recommendations
4. Write in flowing paragraphs, not bullet points, for narrative sections
5. Be WARM and ENCOURAGING while being honest about gaps
6. Use phrases like "It's wonderful to see...", "This is commendable...", "You've clearly put thought into..."
7. Make connections between different areas (e.g., "Since you have dependents and haven't yet...")
8. Provide SPECIFIC, ACTIONABLE advice - not vague suggestions
9. Write substantial content - each analysis paragraph should be 3-5 sentences minimum

TONE & VOICE:
- Warm, supportive, like a trusted advisor
- Celebratory about achievements before addressing gaps
- Never alarmist, always constructive
- Professional yet approachable
- Empathetic and understanding

SCORING CONTEXT:
- "yes" = fully prepared (1.0)
- "partial" = in progress (0.5)
- "no" = not addressed (0.0)
- "not_sure" = needs clarification (0.25)
- "na" = not applicable (excluded)

TIER DEFINITIONS:
- 80-100%: "Rest Easy Ready" - Highly Prepared
- 60-79%: "Well Prepared" - Moderately Prepared  
- 40-59%: "On Your Way" - Limited Preparedness
- 0-39%: "Getting Started" - Low Readiness

SECTION WEIGHTS (higher = more important):
- Legal Planning: 25%
- Financial & Insurance: 20%
- Health Care: 15%
- Family Relationships: 10%
- Home, Pet & Daily Life: 10%
- Digital Life: 5%
- Funeral, Memorial: 5%
- Home & Personal Property: 3%
- Emotional & Spiritual: 3%
- Document Storage: 2%
- Supporting Aging Parents: 2%

IMPORTANT: Generate COMPREHENSIVE content. Each section should have substantial detail matching the example PDF format. The executive summary alone should be 2-3 full paragraphs.`;

function buildUserPrompt(data: ReportRequest): string {
  const profileDetails = Object.entries(data.profile)
    .map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`)
    .join('\n');

  const sectionScoresText = Object.entries(data.sectionScores)
    .sort((a, b) => b[1].score - a[1].score)
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
        .map(a => `Q: ${a.question_text}\nA: ${a.answer_label} (value: "${a.answer_value}", score: ${a.score_fraction !== null ? a.score_fraction : 'N/A'})`)
        .join('\n\n');
      
      return `## ${sectionLabel} (Score: ${sectionScore}%)\n${answersText}`;
    })
    .join('\n\n');

  // Count metrics
  const numSections = Object.keys(data.sectionScores).length;
  const yesAnswers = data.answers.filter(a => a.answer_value === 'yes').length;
  const noAnswers = data.answers.filter(a => a.answer_value === 'no').length;

  return `Generate a COMPREHENSIVE End-of-Life Readiness Report for ${data.userName}.

IMPORTANT: This report should be detailed and thorough, like a 10-15 page professional document. Each section needs substantial content.

USER PROFILE:
- Name: ${data.userName}
${profileDetails}

ASSESSMENT RESULTS:
- Overall Score: ${data.overallScore}%
- Tier: ${data.tier}
- Categories Assessed: ${numSections}
- Strong Areas (yes answers): ${yesAnswers}
- Areas to Address (no answers): ${noAnswers}

SECTION SCORES (sorted by performance):
${sectionScoresText}

DETAILED ANSWERS BY SECTION:
${detailedAnswersText}

Generate the report using the generate_report function. Remember to:
1. Address ${data.userName} by name frequently throughout
2. Reference specific answers they gave
3. Write flowing, substantial paragraphs (not terse bullet points)
4. Be warm, encouraging, and specific
5. Make connections between their profile and their answers
6. The executive_summary should be 2-3 full paragraphs
7. Each category_analysis should be 3-5 sentences minimum
8. The journey_reflection summary should be 2-3 paragraphs
9. The closing_message should be 2-3 warm paragraphs`;
}

const reportToolDefinition = {
  type: "function",
  function: {
    name: "generate_report",
    description: "Generate a comprehensive, professional readiness report",
    parameters: {
      type: "object",
      properties: {
        tier: {
          type: "string",
          enum: ["Getting Started", "On Your Way", "Well Prepared", "Rest Easy Ready"]
        },
        metrics: {
          type: "object",
          properties: {
            categoriesAssessed: { type: "number" },
            strengthsIdentified: { type: "number" },
            areasToAddress: { type: "number" },
            actionItems: { type: "number" }
          },
          required: ["categoriesAssessed", "strengthsIdentified", "areasToAddress", "actionItems"]
        },
        executive_summary: {
          type: "string",
          description: "2-3 substantial paragraphs (200-300 words total). Start with warm greeting using their name. Summarize overall score, key strengths, main opportunities. Reference specific answers. End with encouragement."
        },
        immediate_actions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string", description: "Action title like 'Prioritize Legal & Financial Foundations'" },
              description: { type: "string", description: "3-4 sentences explaining what to do, why it matters, and specific steps" },
              priority: { type: "number" }
            },
            required: ["title", "description", "priority"]
          },
          description: "Top 3 highest-impact immediate actions with detailed descriptions"
        },
        category_analyses: {
          type: "array",
          items: {
            type: "object",
            properties: {
              section_id: { type: "string" },
              section_label: { type: "string" },
              score: { type: "number" },
              analysis: { type: "string", description: "3-5 sentences analyzing this category. Reference specific answers. Mention what's strong and what needs work. Be personal and use their name." }
            },
            required: ["section_id", "section_label", "score", "analysis"]
          }
        },
        strengths: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string", description: "Descriptive title like 'Proactive in Estate Planning' or 'Clear Funeral Preferences'" },
              description: { type: "string", description: "2-3 sentences explaining why this is a strength and its impact. Reference their specific answers." }
            },
            required: ["title", "description"]
          },
          description: "4-6 key strengths with titles and full paragraph descriptions"
        },
        areas_requiring_attention: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string", description: "Descriptive title like 'Unresolved Legal Worries' or 'Digital Life Unaddressed'" },
              description: { type: "string", description: "2-3 sentences explaining the gap and its potential impact. Reference their specific answers." },
              priority: { type: "string", enum: ["PRIORITY", "IMPORTANT"] }
            },
            required: ["title", "description", "priority"]
          },
          description: "4-6 areas needing attention with PRIORITY for critical items, IMPORTANT for secondary"
        },
        action_plan: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string", description: "2-3 sentences with specific, actionable steps" },
              why_it_matters: { type: "string", description: "1-2 sentences explaining the importance" },
              effort: { type: "string", enum: ["Less than 1 hour", "A few hours", "May require professional assistance"] },
              timeline: { type: "string", enum: ["Complete this week", "Complete this month", "Complete within 3 months"] },
              priority: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] }
            },
            required: ["title", "description", "why_it_matters", "effort", "timeline", "priority"]
          },
          description: "6-8 detailed action items"
        },
        journey_reflection: {
          type: "object",
          properties: {
            summary: { type: "string", description: "2-3 paragraphs reflecting on their overall journey. Address them by name. Discuss their strongest areas, growth opportunities, and how their life stage impacts recommendations." },
            strongest_area: {
              type: "object",
              properties: {
                category: { type: "string" },
                score: { type: "number" },
                insight: { type: "string", description: "2-3 sentences about what makes this area strong" }
              },
              required: ["category", "score", "insight"]
            },
            growth_areas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  score: { type: "number" },
                  insight: { type: "string" }
                },
                required: ["category", "score", "insight"]
              }
            },
            response_highlights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question_context: { type: "string", description: "Reference to a specific answer they gave" },
                  implication: { type: "string", description: "What this answer means for their planning" }
                },
                required: ["question_context", "implication"]
              },
              description: "2-3 specific response highlights that shaped recommendations"
            }
          },
          required: ["summary", "strongest_area", "growth_areas", "response_highlights"]
        },
        timeline: {
          type: "object",
          properties: {
            week_1_2: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string", description: "2-3 sentences with specific steps" }
                },
                required: ["title", "description"]
              },
              description: "3-4 quick wins for first two weeks"
            },
            month_1_2: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" }
                },
                required: ["title", "description"]
              },
              description: "3-4 medium-term goals"
            },
            month_3_6: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" }
                },
                required: ["title", "description"]
              },
              description: "3-4 longer-term goals"
            }
          },
          required: ["week_1_2", "month_1_2", "month_3_6"]
        },
        response_reflection: {
          type: "string",
          description: "1-2 paragraphs reflecting on specific answers they gave and how those shaped recommendations. Reference their actual responses."
        },
        moving_forward: {
          type: "string",
          description: "2-3 paragraphs providing personalized guidance for their next steps. Address them by name. Connect their profile to specific advice."
        },
        closing_message: {
          type: "string",
          description: "2-3 warm, personalized paragraphs. Address them by name. Celebrate their progress. Encourage next steps. Sign off warmly as 'Your Rest Easy Advisor'."
        }
      },
      required: ["tier", "metrics", "executive_summary", "immediate_actions", "category_analyses", "strengths", "areas_requiring_attention", "action_plan", "journey_reflection", "timeline", "response_reflection", "moving_forward", "closing_message"]
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

  if (!payload.userName || !payload.answers || payload.answers.length === 0) {
    return jsonResponse({ error: "Missing required fields: userName and answers" }, 400);
  }

  console.log("Generating comprehensive report for:", payload.userName);
  console.log("Overall score:", payload.overallScore);
  console.log("Number of answers:", payload.answers.length);
  console.log("Number of sections:", Object.keys(payload.sectionScores).length);

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
        temperature: 0.75,
        max_tokens: 8000,
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
    console.log("OpenAI response received, tokens used:", data.usage?.total_tokens);

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "generate_report") {
      console.error("Unexpected response format:", JSON.stringify(data));
      return jsonResponse({ error: "Unexpected response format from AI" }, 500);
    }

    let reportContent;
    try {
      reportContent = JSON.parse(toolCall.function.arguments);
    } catch (_err) {
      console.error("Failed to parse tool call arguments");
      return jsonResponse({ error: "Failed to parse report content" }, 500);
    }

    // Construct the full report
    const report = {
      ...reportContent,
      overallScore: payload.overallScore,
      generatedAt: new Date().toISOString(),
      userName: payload.userName,
    };

    console.log("Comprehensive report generated successfully for:", payload.userName);

    return jsonResponse({ report });
  } catch (err) {
    console.error("Error generating report:", err);
    return jsonResponse({ 
      error: err instanceof Error ? err.message : "Unknown error occurred" 
    }, 500);
  }
});
