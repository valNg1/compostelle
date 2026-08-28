/*
 * COMPOSTEL — localStorage-backed ProgressionCache (per user, per language).
 */

import type { ProgressionCache } from "../application/progressionService";
import type { Language } from "../domain/language";
import type { UnitProgressRecord } from "../domain/progression";

export const PROGRESSION_KEY = "compostelle.progression.v1";

export class LocalProgressionCache implements ProgressionCache {
  constructor(private readonly userId: string) {}

  private key(language: Language): string {
    return `${PROGRESSION_KEY}::${this.userId}::${language}`;
  }

  load(language: Language): UnitProgressRecord[] {
    try {
      const raw = globalThis.localStorage?.getItem(this.key(language));
      if (!raw) return [];
      const parsed = JSON.parse(raw) as UnitProgressRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  saveAll(language: Language, records: UnitProgressRecord[]): void {
    try {
      globalThis.localStorage?.setItem(
        this.key(language),
        JSON.stringify(records),
      );
    } catch {
      // storage unavailable — cache is best-effort
    }
  }
}
