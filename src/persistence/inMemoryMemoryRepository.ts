/**
 * COMPOSTELLE — in-memory MemoryRepository (tests / stand-in).
 *
 * Durable-contract implementation backed by a Map keyed by
 * `${userId}::${language}::${expression}`, with per-user and per-language
 * isolation.
 */

import type { Language } from "../domain/language";
import type { MemoryItem } from "../domain/memory";
import type { MemoryRepository } from "../application/memoryRepository";

function key(userId: string, language: Language, expression: string): string {
  return `${userId}::${language}::${expression}`;
}

export class InMemoryMemoryRepository implements MemoryRepository {
  private readonly store = new Map<string, MemoryItem>();

  async listByUserLanguage(
    userId: string,
    language: Language,
  ): Promise<MemoryItem[]> {
    const prefix = `${userId}::${language}::`;
    const out: MemoryItem[] = [];
    for (const [k, item] of this.store) {
      if (k.startsWith(prefix)) out.push(structuredClone(item));
    }
    return out;
  }

  async upsertMany(userId: string, items: MemoryItem[]): Promise<void> {
    for (const item of items) {
      this.store.set(
        key(userId, item.language, item.expression),
        structuredClone(item),
      );
    }
  }
}
