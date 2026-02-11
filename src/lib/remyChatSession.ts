import type { RemyConversationMessage } from "@/types/remy";

export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  key: (index: number) => string | null;
  length: number;
}

export interface RemyPersistedSession {
  conversationId?: string;
  messages: RemyConversationMessage[];
  quickReplies: string[];
  updatedAt: number;
}

type PersistedPayload = {
  version: 2;
  conversationId?: string;
  messages: RemyConversationMessage[];
  quickReplies: string[];
  updatedAt: number;
};

const REMY_CHAT_STORAGE_PREFIX = "remy:chat:v2:";
const MAX_MESSAGES = 20;

function sanitizeReply(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 3)
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function sanitizeActions(value: unknown): RemyConversationMessage["actions"] | undefined {
  if (!Array.isArray(value)) return undefined;
  const actions = value
    .slice(0, 3)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const candidate = item as Record<string, unknown>;
      const actionId = typeof candidate.actionId === "string" ? candidate.actionId.trim() : "";
      const href = typeof candidate.href === "string" ? candidate.href.trim() : "";
      const label = typeof candidate.label === "string" ? candidate.label.trim() : "";
      if (!actionId || !href || !label) return null;
      return { actionId, href, label };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  return actions.length > 0 ? actions : undefined;
}

function sanitizeMessage(value: unknown): RemyConversationMessage | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  const id = typeof candidate.id === "string" ? candidate.id.trim() : "";
  const role = candidate.role === "user" || candidate.role === "remy" ? candidate.role : null;
  const text = typeof candidate.text === "string" ? candidate.text.trim() : "";
  const createdAt = typeof candidate.createdAt === "number" ? candidate.createdAt : NaN;
  if (!id || !role || !text || !Number.isFinite(createdAt)) return null;

  return {
    id,
    role,
    text,
    createdAt,
    actions: sanitizeActions(candidate.actions),
    quickReplies: sanitizeReply(candidate.quickReplies),
  };
}

export function buildRemyStorageKey(userId: string): string {
  return `${REMY_CHAT_STORAGE_PREFIX}${userId}`;
}

export function loadRemySession(
  storage: StorageLike,
  userId: string,
  now = Date.now(),
  ttlMs = 24 * 60 * 60 * 1000,
): RemyPersistedSession | null {
  if (!userId) return null;
  const key = buildRemyStorageKey(userId);
  const raw = storage.getItem(key);
  if (!raw) return null;

  try {
    const payload = JSON.parse(raw) as PersistedPayload;
    if (payload.version !== 2) return null;
    if (!Number.isFinite(payload.updatedAt) || now - payload.updatedAt > ttlMs) {
      storage.removeItem(key);
      return null;
    }

    const messages = Array.isArray(payload.messages)
      ? payload.messages
        .map((message) => sanitizeMessage(message))
        .filter((message): message is RemyConversationMessage => Boolean(message))
      : [];

    if (messages.length === 0) return null;

    return {
      conversationId: typeof payload.conversationId === "string" ? payload.conversationId : undefined,
      quickReplies: sanitizeReply(payload.quickReplies),
      updatedAt: payload.updatedAt,
      messages: messages.slice(-MAX_MESSAGES),
    };
  } catch {
    return null;
  }
}

export function saveRemySession(
  storage: StorageLike,
  userId: string,
  session: RemyPersistedSession,
): void {
  if (!userId || session.messages.length === 0) return;
  const key = buildRemyStorageKey(userId);
  const payload: PersistedPayload = {
    version: 2,
    conversationId: session.conversationId,
    messages: session.messages.slice(-MAX_MESSAGES),
    quickReplies: sanitizeReply(session.quickReplies),
    updatedAt: session.updatedAt,
  };
  storage.setItem(key, JSON.stringify(payload));
}

export function clearRemySession(storage: StorageLike, userId: string): void {
  if (!userId) return;
  storage.removeItem(buildRemyStorageKey(userId));
}

export function clearRemySessionsExcept(storage: StorageLike, activeUserId: string | null): void {
  const keepKey = activeUserId ? buildRemyStorageKey(activeUserId) : null;
  for (let index = storage.length - 1; index >= 0; index -= 1) {
    const key = storage.key(index);
    if (!key || !key.startsWith(REMY_CHAT_STORAGE_PREFIX)) continue;
    if (keepKey && key === keepKey) continue;
    storage.removeItem(key);
  }
}
