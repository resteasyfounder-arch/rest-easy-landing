import { describe, expect, it } from "vitest";
import {
  buildRemyStorageKey,
  clearRemySessionsExcept,
  loadRemySession,
  saveRemySession,
  type StorageLike,
} from "./remyChatSession";

class MemoryStorage implements StorageLike {
  private data = new Map<string, string>();

  get length() {
    return this.data.size;
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  key(index: number): string | null {
    return Array.from(this.data.keys())[index] ?? null;
  }
}

describe("remyChatSession", () => {
  it("saves and restores the same user session", () => {
    const storage = new MemoryStorage();
    saveRemySession(storage, "user-1", {
      conversationId: "conv-1",
      updatedAt: 1000,
      quickReplies: ["What should I do first?"],
      messages: [
        {
          id: "m1",
          role: "remy",
          text: "Let's start with one next step.",
          createdAt: 999,
        },
      ],
    });

    const restored = loadRemySession(storage, "user-1", 2000, 24 * 60 * 60 * 1000);
    expect(restored?.conversationId).toBe("conv-1");
    expect(restored?.messages).toHaveLength(1);
    expect(restored?.quickReplies[0]).toBe("What should I do first?");
  });

  it("drops stale sessions after ttl", () => {
    const storage = new MemoryStorage();
    const key = buildRemyStorageKey("user-1");
    storage.setItem(
      key,
      JSON.stringify({
        version: 2,
        updatedAt: 1_000,
        conversationId: "conv-1",
        quickReplies: ["A"],
        messages: [{ id: "m1", role: "remy", text: "Hi", createdAt: 999 }],
      }),
    );

    const restored = loadRemySession(storage, "user-1", 2_000 + 24 * 60 * 60 * 1000, 24 * 60 * 60 * 1000);
    expect(restored).toBeNull();
    expect(storage.getItem(key)).toBeNull();
  });

  it("clears sessions for other users", () => {
    const storage = new MemoryStorage();
    storage.setItem(buildRemyStorageKey("user-1"), "{}");
    storage.setItem(buildRemyStorageKey("user-2"), "{}");
    storage.setItem("unrelated", "{}");

    clearRemySessionsExcept(storage, "user-2");

    expect(storage.getItem(buildRemyStorageKey("user-1"))).toBeNull();
    expect(storage.getItem(buildRemyStorageKey("user-2"))).toBe("{}");
    expect(storage.getItem("unrelated")).toBe("{}");
  });
});
