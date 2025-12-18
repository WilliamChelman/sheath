import { Injectable, signal, computed } from '@angular/core';
import { Index as FlexSearchIndex } from 'flexsearch';
import type {
  CompendiumData,
  CompendiumEntry,
  CompendiumSearchResult,
} from '../models/compendium.model';

/**
 * Service for loading, indexing, and searching compendium content.
 */
@Injectable({ providedIn: 'root' })
export class CompendiumService {
  private readonly _isLoading = signal(false);
  private readonly _isLoaded = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _entries = signal<readonly CompendiumEntry[]>([]);
  private readonly _entryMap = signal<Map<string, CompendiumEntry>>(new Map());

  // FlexSearch index for full-text search
  private index: FlexSearchIndex | null = null;
  private idToEntry: Map<number, string> = new Map();

  readonly isLoading = this._isLoading.asReadonly();
  readonly isLoaded = this._isLoaded.asReadonly();
  readonly error = this._error.asReadonly();
  readonly entries = this._entries.asReadonly();

  readonly totalCount = computed(() => this._entries().length);

  /**
   * Load the compendium data from the JSON file.
   */
  async load(): Promise<void> {
    if (this._isLoaded() || this._isLoading()) {
      return;
    }

    this._isLoading.set(true);
    this._error.set(null);

    try {
      const response = await fetch('/data-md-content.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch compendium data: ${response.status}`);
      }

      const data: CompendiumData = await response.json();
      this._entries.set(data.files);

      // Build entry map and index
      await this.buildIndex(data.files);

      this._isLoaded.set(true);
    } catch (err) {
      console.error('Failed', err);
      this._error.set(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Build the FlexSearch index from entries.
   */
  private async buildIndex(entries: readonly CompendiumEntry[]): Promise<void> {
    this.index = new FlexSearchIndex({
      tokenize: 'forward',
      resolution: 9,
    });

    const entryMap = new Map<string, CompendiumEntry>();
    this.idToEntry = new Map();

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const id = this.computeEntryId(entry);
      entryMap.set(id, entry);
      this.idToEntry.set(i, id);

      // Build searchable text from multiple fields
      const searchableText = [
        entry.frontmatter.item_name ?? '',
        entry.frontmatter.title ?? '',
        entry.frontmatter.file_basename ?? '',
        entry.markdown,
      ]
        .filter(Boolean)
        .join(' ');

      this.index.add(i, searchableText);
    }

    this._entryMap.set(entryMap);
  }

  /**
   * Compute a unique ID for an entry.
   * Prioritizes frontmatter.item_id, falls back to a URL-safe version of publicPath.
   */
  private computeEntryId(entry: CompendiumEntry): string {
    if (entry.frontmatter.item_id) {
      // Ensure uniqueness by including source if available
      const source = entry.frontmatter.source ?? '';
      const type = entry.frontmatter.type ?? '';
      const scdc = entry.frontmatter.scdc?.[0] ?? '';
      return `${source}:${type}:${entry.frontmatter.item_id}:${scdc}`.replace(
        /[^a-zA-Z0-9:_-]/g,
        '_',
      );
    }

    // Fallback: use publicPath without extension
    return entry.publicPath
      .replace(/^data-md\//, '')
      .replace(/\.md$/i, '')
      .replace(/[^a-zA-Z0-9/_-]/g, '_');
  }

  /**
   * Search the compendium with a query string.
   */
  search(query: string, limit = 50): CompendiumSearchResult[] {
    if (!this.index || !query.trim()) {
      return [];
    }

    const results = this.index.search(query, limit);
    const entryMap = this._entryMap();

    return results
      .map((numericId: number | string) => {
        const id = this.idToEntry.get(numericId as number);
        if (!id) return null;

        const entry = entryMap.get(id);
        if (!entry) return null;

        return {
          id,
          entry,
          displayName: this.getDisplayName(entry),
          category: this.getCategory(entry),
        };
      })
      .filter((result): result is CompendiumSearchResult => result !== null);
  }

  /**
   * Get an entry by its ID.
   */
  getById(id: string): CompendiumEntry | undefined {
    return this._entryMap().get(id);
  }

  /**
   * Get all entries (for browsing without search).
   */
  getAllResults(limit = 100): CompendiumSearchResult[] {
    const entryMap = this._entryMap();
    const results: CompendiumSearchResult[] = [];

    for (const [id, entry] of entryMap) {
      if (results.length >= limit) break;
      results.push({
        id,
        entry,
        displayName: this.getDisplayName(entry),
        category: this.getCategory(entry),
      });
    }

    return results;
  }

  /**
   * Get the display name for an entry.
   */
  private getDisplayName(entry: CompendiumEntry): string {
    return (
      entry.frontmatter.item_name ??
      entry.frontmatter.title ??
      entry.frontmatter.file_basename ??
      entry.publicPath.split('/').pop()?.replace(/\.md$/i, '') ??
      'Unknown'
    );
  }

  /**
   * Get the category/type for an entry.
   */
  private getCategory(entry: CompendiumEntry): string {
    if (entry.frontmatter.type) {
      return entry.frontmatter.type;
    }

    // Extract from path
    const parts = entry.publicPath.split('/');
    if (parts.length >= 2) {
      return parts[1]; // e.g., "Bestiary", "Adventures"
    }

    return 'Unknown';
  }
}
