import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendReportEmailRequest {
  assessmentId: string;
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  reportSummary: {
    overallScore: number;
    tier: string;
    userName: string;
    generatedAt: string;
    executiveSummary: string;
    immediateActions: Array<{ title: string; description: string }>;
    strengths: Array<{ title: string }>;
    areasRequiringAttention: Array<{ title: string }>;
  };
  personalMessage?: string;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const getTierColor = (tier: string): string => {
  switch (tier) {
    case "well_prepared":
      return "#16a34a";
    case "mostly_prepared":
      return "#22c55e";
    case "partially_prepared":
      return "#eab308";
    case "needs_attention":
      return "#f97316";
    case "critical":
      return "#ef4444";
    default:
      return "#6b7280";
  }
};

const getTierLabel = (tier: string): string => {
  switch (tier) {
    case "well_prepared":
      return "Well Prepared";
    case "mostly_prepared":
      return "Mostly Prepared";
    case "partially_prepared":
      return "Partially Prepared";
    case "needs_attention":
      return "Needs Attention";
    case "critical":
      return "Critical";
    default:
      return tier;
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-report-email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return new Response(JSON.stringify({ success: false, error: "Missing Supabase configuration" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: "Missing authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser();
    if (authError || !authData.user) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
    const readiness = serviceClient.schema("readiness_v1");

    const {
      assessmentId,
      recipientEmail,
      recipientName,
      senderName,
      reportSummary,
      personalMessage,
    }: SendReportEmailRequest = await req.json();

    if (!assessmentId || !isUuid(assessmentId)) {
      return new Response(JSON.stringify({ success: false, error: "assessmentId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: subject, error: subjectError } = await readiness
      .from("subjects")
      .select("id")
      .eq("user_id", authData.user.id)
      .maybeSingle();
    if (subjectError || !subject?.id) {
      return new Response(JSON.stringify({ success: false, error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: ownedAssessment, error: assessmentError } = await readiness
      .from("assessments")
      .select("id, report_status, report_data")
      .eq("id", assessmentId)
      .eq("subject_id", subject.id)
      .maybeSingle();
    if (assessmentError || !ownedAssessment) {
      return new Response(JSON.stringify({ success: false, error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (ownedAssessment.report_status !== "ready" || !ownedAssessment.report_data) {
      return new Response(JSON.stringify({ success: false, error: "Report is not ready to share" }), {
        status: 409,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Sending report email to:", recipientEmail);

    const plainSenderName = senderName.replace(/[\r\n]/g, " ").trim();
    const safeSenderName = escapeHtml(plainSenderName);
    const safeRecipientName = escapeHtml(recipientName);
    const tierColor = getTierColor(reportSummary.tier);
    const tierLabel = getTierLabel(reportSummary.tier);
    const formattedDate = new Date(reportSummary.generatedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const immediateActionsHtml = reportSummary.immediateActions
      .slice(0, 3)
      .map(
        (action) => `
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
              <strong style="color: #111827;">${escapeHtml(action.title)}</strong>
              <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">${escapeHtml(action.description)}</p>
            </td>
          </tr>
        `
      )
      .join("");

    const strengthsHtml = reportSummary.strengths
      .slice(0, 3)
      .map(
        (s) => `<li style="color: #16a34a; margin-bottom: 4px;">✓ ${escapeHtml(s.title)}</li>`
      )
      .join("");

    const attentionHtml = reportSummary.areasRequiringAttention
      .slice(0, 3)
      .map(
        (a) => `<li style="color: #dc2626; margin-bottom: 4px;">⚠ ${escapeHtml(a.title)}</li>`
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 32px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                      Life Readiness Report
                    </h1>
                    <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">
                      Shared by ${safeSenderName}
                    </p>
                  </td>
                </tr>

                <!-- Personal Message (if any) -->
                ${personalMessage ? `
                <tr>
                  <td style="padding: 24px 32px 0 32px;">
                    <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px; border-radius: 0 8px 8px 0;">
                      <p style="margin: 0; color: #0369a1; font-style: italic;">"${escapeHtml(personalMessage)}"</p>
                      <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">— ${safeSenderName}</p>
                    </div>
                  </td>
                </tr>
                ` : ''}

                <!-- Greeting -->
                <tr>
                  <td style="padding: 24px 32px 0 32px;">
                    <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Dear ${safeRecipientName},
                    </p>
                    <p style="margin: 16px 0 0 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      ${safeSenderName} has shared their Life Readiness Report with you. This report provides insights into their end-of-life preparedness and may contain important information for you as a family member or trusted advisor.
                    </p>
                  </td>
                </tr>

                <!-- Score Card -->
                <tr>
                  <td style="padding: 24px 32px;">
                    <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; text-align: center;">
                      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                        Overall Readiness Score
                      </p>
                      <p style="margin: 0; font-size: 48px; font-weight: 700; color: ${tierColor};">
                        ${reportSummary.overallScore}%
                      </p>
                      <span style="display: inline-block; margin-top: 8px; padding: 4px 12px; background-color: ${tierColor}; color: white; border-radius: 16px; font-size: 14px; font-weight: 500;">
                        ${tierLabel}
                      </span>
                      <p style="margin: 12px 0 0 0; color: #9ca3af; font-size: 12px;">
                        Report generated on ${formattedDate}
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Executive Summary -->
                <tr>
                  <td style="padding: 0 32px 24px 32px;">
                    <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 18px; font-weight: 600;">
                      Executive Summary
                    </h2>
                    <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                      ${escapeHtml(reportSummary.executiveSummary)}
                    </p>
                  </td>
                </tr>

                <!-- Two Column: Strengths & Attention -->
                <tr>
                  <td style="padding: 0 32px 24px 32px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 50%; vertical-align: top; padding-right: 12px;">
                          <h3 style="margin: 0 0 12px 0; color: #16a34a; font-size: 14px; font-weight: 600;">
                            ✓ Key Strengths
                          </h3>
                          <ul style="margin: 0; padding-left: 0; list-style: none; font-size: 14px;">
                            ${strengthsHtml}
                          </ul>
                        </td>
                        <td style="width: 50%; vertical-align: top; padding-left: 12px;">
                          <h3 style="margin: 0 0 12px 0; color: #dc2626; font-size: 14px; font-weight: 600;">
                            ⚠ Areas of Focus
                          </h3>
                          <ul style="margin: 0; padding-left: 0; list-style: none; font-size: 14px;">
                            ${attentionHtml}
                          </ul>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Immediate Actions -->
                <tr>
                  <td style="padding: 0 32px 24px 32px;">
                    <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 18px; font-weight: 600;">
                      Priority Actions
                    </h2>
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef3c7; border-radius: 8px; overflow: hidden;">
                      ${immediateActionsHtml}
                    </table>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td style="padding: 0 32px 32px 32px; text-align: center;">
                    <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">
                      This is a summary of the full report. For the complete analysis and action plan, please contact ${safeSenderName}.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      This report was generated by Rest Easy
                    </p>
                    <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">
                      © ${new Date().getFullYear()} Rest Easy. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Rest Easy <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `${plainSenderName} shared their Life Readiness Report with you`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error in send-report-email function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
