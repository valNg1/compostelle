/**
 * COMPOSTELLE — localStorage-backed MemoryCache (per user, per language).
 *
 * Resilience/offline cache for learning memory — NOT the source of truth
 * (durable Postgres is). Scoped by userId so one user's memory never leaks into
 * another's session.
 */

import type { Language } from "../domain/language";
import type { MemoryItem } from "../domain/memory";
import type { MemoryCache } from "../application/memoryService";

export const MEMORY_KEY = "compostelle.memory.v1";

function readStore(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export class LocalMemoryCache implements MemoryCache {
  constructor(private readonly userId: string) {}

  private key(language: Language): string {
    return `${MEMORY_KEY}::${this.userId}::${language}`;
  }

  load(language: Language): MemoryItem[] {
    const store = readStore();
    if (!store) return [];
    try {
      const raw = store.getItem(this.key(language));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as MemoryItem[]) : [];
    } catch {
      return [];
    }
  }

  saveAll(language: Language, items: MemoryItem[]): void {
    const store = readStore();
    if (!store) return;
    try {
      store.setItem(this.key(language), JSON.stringify(items));
    } catch {
      /* best effort */
    }
  }
}
