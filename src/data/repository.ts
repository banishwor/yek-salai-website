/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { YumnakRepository, YekSalai } from "../types";
import { yumnakDatabase } from "./yumnakDatabase";

/**
 * Local implementation of YumnakRepository using static memory database.
 * Supports case-insensitive matching and trim.
 */
export class LocalYumnakRepository implements YumnakRepository {
  private db: Record<string, YekSalai[]>;

  constructor(customDatabase?: Record<string, YekSalai[]>) {
    this.db = customDatabase || yumnakDatabase;
  }

  getAllSurnames(): string[] {
    return Object.keys(this.db).sort((a, b) => a.localeCompare(b));
  }

  getYeksForSurname(surname: string): YekSalai[] {
    const normalized = surname.trim().toLocaleLowerCase();
    const matchKey = Object.keys(this.db).find(
      (key) => key.toLocaleLowerCase() === normalized
    );
    if (matchKey) {
      return this.db[matchKey];
    }
    return [];
  }

  isValidSurname(surname: string): boolean {
    return this.getYeksForSurname(surname).length > 0;
  }
}

/**
 * Singleton repository instance.
 * For future integrations like PostgreSQL or Supabase, replace this export
 * with an instance of clean API/DB-based repository.
 */
export const yumnakRepository: YumnakRepository = new LocalYumnakRepository();
