/**
 * COMPOSTELLE — Memory repository port (user-scoped, language-scoped).
 *
 * The application depends on this interface, never on a concrete storage
 * technology. Learning memory is owned by an authenticated user (`auth.uid()`)
 * and isolated per language. Durable Postgres is the source of truth.
 */

import type { Language } from "../domain/language";
import type { MemoryItem } from "../domain/memory";

export interface MemoryRepository {
  /** All memory items owned by a user for one language. */
  listByUserLanguage(
    userId: string,
    language: Language,
  ): Promise<MemoryItem[]>;
  /** Create or replace memory items (by user + language + expression). */
  upsertMany(userId: string, items: MemoryItem[]): Promise<void>;
}
