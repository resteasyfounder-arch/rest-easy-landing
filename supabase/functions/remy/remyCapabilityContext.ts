import type { AnswerRow, AssessmentRow, RemySurface, Schema } from "./remyPayloadBuilder.ts";
import {
  findNavigationTargetById,
  listVaultCatalog,
  resolveRouteForMessage,
  type RemyRouteResolution,
} from "./remyRouteResolver.ts";

type VaultDocumentRow = {
  document_type_id: string;
};

type VaultExclusionRow = {
  document_type_id: string;
};

export type RemyVaultContext = {
  completed_count: number;
  applicable_count: number;
  progress_percent: number;
  missing_high_priority_docs: Array<{
    id: string;
    name: string;
    category: string;
    input_method: "upload" | "inline";
  }>;
};

export type RemyReportContext = {
  available: boolean;
  stale: boolean;
  executive_summary: string | null;
  strengths: string[];
  attention_areas: string[];
  action_items: string[];
};

export type RemyNavigationContext = {
  section_purposes: Array<{
    id: string;
    label: string;
    href: string;
    purpose: string;
  }>;
};

export type RemyCapabilityContext = {
  vault: RemyVaultContext;
  report: RemyReportContext;
  navigation: RemyNavigationContext;
  route: RemyRouteResolution | null;
};

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function asString(value: unknown, maxLen = 600): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  return cleaned.slice(0, maxLen);
}

function asStringList(value: unknown, key?: string): string[] {
  if (!Array.isArray(value)) return [];
  const result: string[] = [];
  for (const item of value) {
    if (typeof item === "string") {
      const cleaned = asString(item, 180);
      if (cleaned) result.push(cleaned);
      continue;
    }

    if (item && typeof item === "object") {
      const candidate = item as Record<string, unknown>;
      const primary = key ? asString(candidate[key], 180) : null;
      if (primary) {
        result.push(primary);
        continue;
      }

      const title = asString(candidate.title, 180) || asString(candidate.label, 180);
      if (title) result.push(title);
    }
  }
  return result.slice(0, 4);
}

function buildReportContext(assessment: AssessmentRow | null): RemyReportContext {
  if (!assessment || assessment.report_status !== "ready") {
    return {
      available: false,
      stale: Boolean(assessment?.report_stale),
      executive_summary: null,
      strengths: [],
      attention_areas: [],
      action_items: [],
    };
  }

  const report = asObject(assessment.report_data);
  const executiveSummary =
    asString(report.executive_summary, 800) ||
    asString(report.summary, 800) ||
    asString(report.overview, 800);

  return {
    available: true,
    stale: Boolean(assessment.report_stale),
    executive_summary: executiveSummary,
    strengths: asStringList(report.strengths),
    attention_areas: asStringList(report.areas_requiring_attention),
    action_items: asStringList(report.action_plan),
  };
}

async function loadVaultContext(
  supabase: {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (column: string, value: string) => Promise<{ data: unknown[] | null; error: { message?: string } | null }>;
      };
    };
  },
  userId: string,
): Promise<RemyVaultContext> {
  const [documentsResult, exclusionsResult] = await Promise.all([
    supabase
      .from("vault_documents")
      .select("document_type_id")
      .eq("user_id", userId),
    supabase
      .from("vault_document_exclusions")
      .select("document_type_id")
      .eq("user_id", userId),
  ]);

  if (documentsResult.error) {
    console.error("[remy] loadVaultContext documents query error:", documentsResult.error.message || documentsResult.error);
  }
  if (exclusionsResult.error) {
    console.error("[remy] loadVaultContext exclusions query error:", exclusionsResult.error.message || exclusionsResult.error);
  }

  const docs = ((documentsResult.data || []) as VaultDocumentRow[])
    .map((item) => item.document_type_id)
    .filter((item): item is string => typeof item === "string" && item.length > 0);

  const excluded = new Set(
    ((exclusionsResult.data || []) as VaultExclusionRow[])
      .map((item) => item.document_type_id)
      .filter((item): item is string => typeof item === "string" && item.length > 0),
  );

  const catalog = listVaultCatalog();
  const applicable = catalog.filter((item) => !excluded.has(item.id));
  const completedSet = new Set(docs.filter((id) => !excluded.has(id)));
  const missing = applicable.filter((item) => !completedSet.has(item.id));
  const missingHighPriority = missing
    .filter((item) => item.priority === "high")
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      input_method: item.inputMethod,
    }));

  const applicableCount = applicable.length;
  const completedCount = Math.max(0, Math.min(applicableCount, completedSet.size));
  const progressPercent = applicableCount > 0
    ? Math.round((completedCount / applicableCount) * 100)
    : 0;

  return {
    completed_count: completedCount,
    applicable_count: applicableCount,
    progress_percent: progressPercent,
    missing_high_priority_docs: missingHighPriority,
  };
}

function buildNavigationContext(): RemyNavigationContext {
  const orderedIds = ["dashboard", "profile", "readiness", "results", "vault", "menu"];
  return {
    section_purposes: orderedIds
      .map((id) => findNavigationTargetById(id))
      .filter((item): item is NonNullable<ReturnType<typeof findNavigationTargetById>> => Boolean(item))
      .map((item) => ({
        id: item.id,
        label: item.label,
        href: item.href,
        purpose: item.purpose,
      })),
  };
}

export async function loadRemyCapabilityContext(params: {
  supabase: {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (column: string, value: string) => Promise<{ data: unknown[] | null; error: { message?: string } | null }>;
      };
    };
  };
  userId: string;
  message: string;
  surface: RemySurface;
  schema: Schema | null;
  assessment: AssessmentRow | null;
  _answers: AnswerRow[];
}): Promise<RemyCapabilityContext> {
  const [vaultContext] = await Promise.all([
    loadVaultContext(params.supabase, params.userId),
  ]);

  return {
    vault: vaultContext,
    report: buildReportContext(params.assessment),
    navigation: buildNavigationContext(),
    route: resolveRouteForMessage({
      message: params.message,
      schema: params.schema,
      surface: params.surface,
    }),
  };
}
