import { describe, it, expect } from "vitest";
import {
  getAuthService,
  createJourneyService,
} from "./createJourneyService";

/**
 * With no Supabase env configured (the default in tests/CI), the composition
 * root must degrade to cache-only: no auth service, no durable repository.
 */
describe("composition root (unconfigured Supabase)", () => {
  it("exposes no auth service", () => {
    expect(getAuthService()).toBeNull();
  });

  it("builds a cache-only journey service", () => {
    expect(createJourneyService("local-user").isDurable).toBe(false);
  });
});
