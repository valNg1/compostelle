/*
 * COMPOSTEL — progression service (per user, per language).
 *
 * Durable (Supabase) authoritative + local cache, following the same
 * port/adapter shape as the journey / memory / activity services. Records a
 * completed unit's composite signals and lists a language's unit progress so
 * the UI can compute sub-level scores and acquisition.
 */

import type { Language } from "../domain/language";
import {
  unitScore,
  type UnitProgressRecord,
  type UnitSignals,
} from "../domain/progression";

export interface ProgressionRepository {
  listByUserLanguage(
    userId: string,
    language: Language,
  ): Promise<UnitProgressRecord[]>;
  /** Insert or replace the row for (user, language, unitId). */
  upsert(userId: string, record: UnitProgressRecord): Promise<void>;
}

export interface ProgressionCache {
  load(language: Language): UnitProgressRecord[];
  saveAll(language: Language, records: UnitProgressRecord[]): void;
}

function clamp01(v: number | undefined): number {
  if (v === undefined || Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

export class ProgressionService {
  constructor(
    private readonly durable: ProgressionRepository | null,
    private readonly cache: ProgressionCache,
    private readonly userId: string,
  ) {}

  get isDurable(): boolean {
    return this.durable !== null;
  }

  /** All unit-progress rows for a language (durable authoritative, else cache). */
  async list(language: Language): Promise<UnitProgressRecord[]> {
    if (this.durable) {
      try {
        const remote = await this.durable.listByUserLanguage(this.userId, language);
        this.cache.saveAll(language, remote);
        return remote;
      } catch {
        // fall through to cache
      }
    }
    return this.cache.load(language);
  }

  /**
   * Record a completed unit: compute the composite score from the signals,
   * upsert (durable best-effort) and return the language's updated rows.
   */
  async record(
    language: Language,
    sublevelId: string,
    unitId: string,
    signals: UnitSignals,
  ): Promise<UnitProgressRecord[]> {
    const record: UnitProgressRecord = {
      language,
      sublevelId,
      unitId,
      quiz: clamp01(signals.quiz),
      reuse: clamp01(signals.reuse),
      corrections: clamp01(signals.corrections),
      score: unitScore(signals),
      completed: true,
      updatedAt: new Date().toISOString(),
    };
    const merged = [
      ...this.cache.load(language).filter((r) => r.unitId !== unitId),
      record,
    ];
    this.cache.saveAll(language, merged);
    if (this.durable) {
      try {
        await this.durable.upsert(this.userId, record);
      } catch {
        // durable write is best-effort; cache keeps the result
      }
    }
    return merged;
  }
}
