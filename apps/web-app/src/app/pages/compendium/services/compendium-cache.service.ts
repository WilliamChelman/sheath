import { Injectable } from '@angular/core';
import Dexie, { type Table } from 'dexie';

interface IndexChunk {
  key: string;
  data: string;
}

interface MetaEntry {
  key: string;
  value: string;
}

class CompendiumCacheDb extends Dexie {
  indexChunks!: Table<IndexChunk, string>;
  meta!: Table<MetaEntry, string>;

  constructor() {
    super('compendium-cache');
    this.version(1).stores({
      indexChunks: 'key',
      meta: 'key',
    });
  }
}

/**
 * Service for caching the FlexSearch index in IndexedDB using Dexie.
 */
@Injectable({ providedIn: 'root' })
export class CompendiumCacheService {
  private readonly db = new CompendiumCacheDb();

  /**
   * Get the cached content hash.
   */
  async getCachedHash(): Promise<string | null> {
    try {
      const entry = await this.db.meta.get('contentHash');
      return entry?.value ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Save the content hash to the cache.
   */
  async saveHash(hash: string): Promise<void> {
    await this.db.meta.put({ key: 'contentHash', value: hash });
  }

  /**
   * Save an index chunk to the cache.
   */
  async saveIndexChunk(key: string, data: string): Promise<void> {
    await this.db.indexChunks.put({ key, data });
  }

  /**
   * Get an index chunk from the cache.
   */
  async getIndexChunk(key: string): Promise<string | null> {
    try {
      const chunk = await this.db.indexChunks.get(key);
      return chunk?.data ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Get all index chunk keys from the cache.
   */
  async getAllIndexKeys(): Promise<string[]> {
    try {
      const chunks = await this.db.indexChunks.toArray();
      return chunks.map((c) => c.key);
    } catch {
      return [];
    }
  }

  /**
   * Clear all cached index data.
   */
  async clearIndex(): Promise<void> {
    try {
      await this.db.indexChunks.clear();
    } catch {
      // Ignore errors on clear
    }
  }

  /**
   * Check if the cache is valid for a given content hash.
   */
  async isCacheValid(contentHash: string): Promise<boolean> {
    const cachedHash = await this.getCachedHash();
    return cachedHash === contentHash;
  }
}
