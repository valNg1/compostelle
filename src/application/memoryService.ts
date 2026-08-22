/**
 * COMPOSTELLE — Memory application service (MEMORY step).
 *
 * Applies learning-loop signals to durable memory (Supabase authoritative) with
 * a local cache for resilience/offline. Deterministic transitions come from the
 * domain (`nextState`). Isolated per user and per language.
 */

import type { Language } from "../domain/language";
import {
  nextState,
  type MemoryItem,
  type MemorySignal,
} from "../domain/memory";
import type { MemoryRepository } from "./memoryRepository";

/** One learning-loop event about an expression. */
export interface MemoryEvent {
  expression: string;
  meaning: string;
  signal: MemorySignal;
}

/** Local cache port (per user); the localStorage impl lives in persistence. */
export interface MemoryCache {
  load(language: Language): MemoryItem[];
  saveAll(language: Language, items: MemoryItem[]): void;
}

function mergeByExpression(
  base: readonly MemoryItem[],
  updates: readonly MemoryItem[],
): MemoryItem[] {
  const map = new Map(base.map((i) => [i.expression, i]));
  for (const u of updates) map.set(u.expression, u);
  return [...map.values()];
}

export class MemoryService {
  constructor(
    private readonly durable: MemoryRepository | null,
    private readonly cache: MemoryCache,
    private readonly userId: string,
  ) {}

  get isDurable(): boolean {
    return this.durable !== null;
  }

  /** Current memory for a language (durable authoritative, cache fallback). */
  async list(language: Language): Promise<MemoryItem[]> {
    if (this.durable) {
      try {
        const remote = await this.durable.listByUserLanguage(
          this.userId,
          language,
        );
        this.cache.saveAll(language, remote);
        return remote;
      } catch {
        // Durable unreachable: fall back to the resilience cache.
      }
    }
    return this.cache.load(language);
  }

  /**
   * Fold learning-loop events into memory (deterministic transitions), persist
   * the updated items durably (when available) and in the cache, and return the
   * full, updated memory for the language.
   */
  async apply(
    language: Language,
    events: readonly MemoryEvent[],
  ): Promise<MemoryItem[]> {
    const current = await this.list(language);
    const byExpr = new Map(current.map((i) => [i.expression, i]));
    const touched = new Map<string, MemoryItem>();
    const now = new Date().toISOString();

    for (const ev of events) {
      const previous =
        touched.get(ev.expression) ?? byExpr.get(ev.expression) ?? null;
      touched.set(ev.expression, {
        language,
        expression: ev.expression,
        meaning: ev.meaning || previous?.meaning || "",
        state: nextState(previous?.state ?? null, ev.signal),
        lastInteraction: now,
      });
    }

    const updated = [...touched.values()];
    const merged = mergeByExpression(current, updated);
    this.cache.saveAll(language, merged);
    if (this.durable && updated.length > 0) {
      await this.durable.upsertMany(this.userId, updated);
    }
    return merged;
  }
}
