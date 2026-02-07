export type RemySurface = "dashboard" | "readiness" | "section_summary" | "results" | "profile" | "menu";
export type RemyPriority = "HIGH" | "MEDIUM" | "LOW";

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
