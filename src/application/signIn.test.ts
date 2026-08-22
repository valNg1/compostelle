import { describe, it, expect, vi } from "vitest";
import type { AuthService, AuthUser } from "./authService";
import { attemptSignIn } from "./signIn";

/** Fake AuthService with a controllable sign-in outcome. */
function fakeAuth(
  overrides: Partial<AuthService> = {},
): AuthService & { calls: Array<[string, string]> } {
  const calls: Array<[string, string]> = [];
  let user: AuthUser | null = null;
  return {
    calls,
    getUser: async () => user,
    signInWithPassword: async (email, password) => {
      calls.push([email, password]);
      user = { id: "user-1", email };
    },
    signOut: async () => {
      user = null;
    },
    onAuthChange: () => () => {},
    ...overrides,
  };
}

describe("attemptSignIn", () => {
  it("signs in with a trimmed email and returns success", async () => {
    const auth = fakeAuth();
    const result = await attemptSignIn(auth, "  learner@example.com ", "pw123456");
    expect(result).toEqual({ ok: true });
    expect(auth.calls).toEqual([["learner@example.com", "pw123456"]]);
  });

  it("returns a clean error on invalid credentials (never throws)", async () => {
    const auth = fakeAuth({
      signInWithPassword: vi.fn().mockRejectedValue(new Error("Invalid login")),
    });
    const result = await attemptSignIn(auth, "learner@example.com", "wrong");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/incorrect/i);
  });

  it("guards empty email or password without calling the adapter", async () => {
    const auth = fakeAuth();
    expect((await attemptSignIn(auth, "", "pw")).ok).toBe(false);
    expect((await attemptSignIn(auth, "a@b.co", "")).ok).toBe(false);
    expect(auth.calls).toEqual([]);
  });
});
