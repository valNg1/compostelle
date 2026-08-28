/*
 * COMPOSTEL — in-memory ProgressionRepository (tests / stand-in).
 */

import type { ProgressionRepository } from "../application/progressionService";
import type { Language } from "../domain/language";
import type { UnitProgressRecord } from "../domain/progression";

export class InMemoryProgressionRepository implements ProgressionRepository {
  private readonly rows = new Map<string, UnitProgressRecord[]>();

  private key(userId: string, language: Language): string {
    return `${userId}::${language}`;
  }

  async listByUserLanguage(
    userId: string,
    language: Language,
  ): Promise<UnitProgressRecord[]> {
    return [...(this.rows.get(this.key(userId, language)) ?? [])];
  }

  async upsert(userId: string, record: UnitProgressRecord): Promise<void> {
    const k = this.key(userId, record.language);
    const rest = (this.rows.get(k) ?? []).filter(
      (r) => r.unitId !== record.unitId,
    );
    this.rows.set(k, [...rest, record]);
  }
}
