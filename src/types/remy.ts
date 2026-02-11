export type RemySurface = "dashboard" | "readiness" | "section_summary" | "results" | "profile" | "menu";
export type RemyPriority = "HIGH" | "MEDIUM" | "LOW";
export type RemyChatIntent = "clarify" | "prioritize" | "explain_score" | "plan_next" | "reassure" | "unknown";

export interface RemyNudge {
  id: string;
  title: string;
  body: string;
  cta?: {
    label: string;
    href: string;
  };
}

export interface RemyExplanation {
  id: string;
  title: string;
  body: string;
  source_refs: string[];
}

export interface RemyPriorityItem {
  id: string;
  title: string;
  priority: RemyPriority;
  why_now: string;
  target_href: string;
}

export interface RemyReassurance {
  title: string;
  body: string;
}

export interface RemySurfacePayload {
  surface: RemySurface;
  generated_at: string;
  domain_scope: "rest_easy_readiness";
  nudge: RemyNudge | null;
  explanations: RemyExplanation[];
  priorities: RemyPriorityItem[];
  reassurance: RemyReassurance;
}

export interface RemyChatTurnRequest {
  action: "chat_turn";
  assessment_id: string;
  surface: RemySurface;
  conversation_id?: string;
  message: string;
  context_hint?: string;
  client_turn_id?: string;
  client_request_id?: string;
}

export interface RemyChatTurnResponse {
  conversation_id: string;
  assistant_message: string;
  quick_replies: string[];
  cta?: {
    id: string;
    label: string;
    href: string;
  };
  why_this?: {
    title: string;
    body: string;
    source_refs: string[];
  };
  intent: RemyChatIntent;
  confidence: number;
  safety_flags: string[];
  meta: {
    trace_id: string;
    response_source: "responses_api" | "chat_completions" | "deterministic_fallback";
    degraded_reason?: string;
  };
}

export interface RemyConversationMessage {
  id: string;
  role: "user" | "remy";
  text: string;
  createdAt: number;
  statusNote?: string;
  traceId?: string;
  actions?: Array<{
    actionId: string;
    href: string;
    label: string;
  }>;
  quickReplies?: string[];
}
