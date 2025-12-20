import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Index as FlexSearchIndex } from 'flexsearch';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '../../../services/config.service';
import type {
  ActiveFilters,
  CompendiumData,
  CompendiumEntry,
  CompendiumSearchResult,
  FacetGroup,
  FacetKey,
  FacetOption,
} from '../models/compendium.model';
import { CompendiumCacheService } from './compendium-cache.service';

/**
 * Type categories that enable additional facets
 */
const TYPE_TO_EXTRA_FACETS: Record<string, readonly FacetKey[]> = {
  monster: ['level', 'role', 'organization', 'source', 'ancestry', 'size'],
  feature: [
    'class',
    'level',
    'action_type',
    'feature_type',
    'subclass',
    'target',
  ],
  'common-ability': ['action_type', 'common_ability_type'],
  treasure: ['echelon', 'source', 'treasure_type'],
  title: ['echelon', 'source'],
  perk: ['echelon', 'source', 'perk_type'],
  chapter: ['chapter_num'],
  culture_benefit: ['culture_benefit_type'],
  'dynamic-terrain': ['dynamic_terrain_type'],
};

/**
 * Service for loading, indexing, and searching compendium content.
 */
@Injectable({ providedIn: 'root' })
export class CompendiumService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);
  private readonly cacheService = inject(CompendiumCacheService);

  private readonly _isLoading = signal(false);
  private readonly _isLoaded = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _entries = signal<readonly CompendiumEntry[]>([]);
  private readonly _entryMap = signal<Map<string, CompendiumEntry>>(new Map());

  // FlexSearch index for full-text search
  private index: FlexSearchIndex | null = null;

  // Search and filter state
  private readonly _searchQuery = signal('');
  private readonly _activeFilters = signal<ActiveFilters>({});

  readonly isLoading = this._isLoading.asReadonly();
  readonly isLoaded = this._isLoaded.asReadonly();
  readonly error = this._error.asReadonly();
  readonly entries = this._entries.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly activeFilters = this._activeFilters.asReadonly();

  readonly totalCount = computed(() => this._entries().length);

  /**
   * Check if any filters are active
   */
  readonly hasActiveFilters = computed(() => {
    const filters = this._activeFilters();
    return Object.values(filters).some((values) => values && values.length > 0);
  });

  /**
   * Filtered results based on search query and active filters
   */
  readonly filteredResults = computed(() => {
    // Wait until data is fully loaded before computing results
    if (!this._isLoaded()) {
      return [];
    }

    const query = this._searchQuery().trim();
    const filters = this._activeFilters();
    const entryMap = this._entryMap();

    let results: CompendiumSearchResult[];

    if (query) {
      // Use FlexSearch for text query - results are already ordered by relevance
      results = this.search(query, 200);
    } else {
      // Get all entries when no search query
      results = [];
      for (const [id, entry] of entryMap) {
        results.push({
          id,
          entry,
          displayName: this.getDisplayName(entry),
          category: this.getCategory(entry),
        });
      }
      // Sort alphabetically by display name when no search query
      results.sort((a, b) =>
        a.displayName.localeCompare(b.displayName, undefined, {
          sensitivity: 'base',
        }),
      );
    }

    // Apply facet filters
    return results.filter((result) =>
      this.matchesFilters(result.entry, filters),
    );
  });

  /**
   * Count of filtered results
   */
  readonly filteredCount = computed(() => this.filteredResults().length);

  /**
   * Available facets based on current filtered results and selected types
   */
  readonly availableFacets = computed((): readonly FacetGroup[] => {
    const entries = this._entries();
    const filters = this._activeFilters();
    const selectedTypes = filters.type ?? [];

    // Always show type facet
    const facets: FacetGroup[] = [
      this.buildFacetGroup('type', entries, filters),
    ];

    // Determine which extra facets to show based on selected types
    const extraFacetKeys = new Set<FacetKey>();

    if (selectedTypes.length > 0) {
      for (const selectedType of selectedTypes) {
        const baseCategory = selectedType;
        const extraFacets = TYPE_TO_EXTRA_FACETS[baseCategory];
        if (extraFacets) {
          for (const facetKey of extraFacets) {
            extraFacetKeys.add(facetKey);
          }
        }
      }
    }

    // Build extra facet groups
    for (const facetKey of extraFacetKeys) {
      const facetGroup = this.buildFacetGroup(facetKey, entries, filters);
      if (facetGroup.options.length > 0) {
        facets.push(facetGroup);
      }
    }

    return facets;
  });

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
      const data = await firstValueFrom(
        this.http.get<CompendiumData>('/data-md-content.json'),
      );
      this._entries.set(data.files);

      // Build entry map and index (using cache if available)
      const contentHash = data.contentHash;
      await this.buildIndex(data.files, contentHash);

      this._isLoaded.set(true);
    } catch (err) {
      console.error('Failed', err);
      this._error.set(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Build the FlexSearch index from entries, using cache if available.
   */
  private async buildIndex(
    entries: readonly CompendiumEntry[],
    contentHash: string,
  ): Promise<void> {
    // Always build the entry map first
    const entryMap = new Map<string, CompendiumEntry>();
    for (const entry of entries) {
      const id = this.computeEntryId(entry);
      entryMap.set(id, entry);
    }
    this._entryMap.set(entryMap);

    // Check if we have a valid cached index
    const cacheValid = await this.cacheService.isCacheValid(contentHash);

    this.index = new FlexSearchIndex({
      tokenize: 'forward',
      resolution: 9,
    });

    if (cacheValid) {
      // Load index from cache
      const loaded = await this.loadIndexFromCache();
      if (loaded) {
        console.log('[CompendiumService] Loaded search index from cache');
        return;
      }
      // If loading failed, fall through to rebuild
      console.warn('[CompendiumService] Cache load failed, rebuilding index');
    }

    // Build the index from scratch
    console.log('[CompendiumService] Building search index from scratch...');
    for (const entry of entries) {
      const id = this.computeEntryId(entry);

      const el = document.createElement('div');
      el.innerHTML = entry.html;
      // Build searchable text from multiple fields
      const searchableText = [
        entry.frontmatter.item_name ?? '',
        entry.frontmatter.title ?? '',
        entry.frontmatter.file_basename ?? '',
        entry.markdown,
        el.textContent ?? '',
      ]
        .filter(Boolean)
        .join(' ');

      await this.index.addAsync(id, searchableText);
    }

    // Export the index to cache
    await this.exportIndexToCache(contentHash);
    console.log('[CompendiumService] Search index cached for future loads');
  }

  /**
   * Load the FlexSearch index from the IndexedDB cache.
   */
  private async loadIndexFromCache(): Promise<boolean> {
    try {
      const keys = await this.cacheService.getAllIndexKeys();
      if (keys.length === 0) {
        return false;
      }

      for (const key of keys) {
        const data = await this.cacheService.getIndexChunk(key);
        if (data && this.index) {
          this.index.import(key, data);
        }
      }

      return true;
    } catch (err) {
      console.error(
        '[CompendiumService] Failed to load index from cache:',
        err,
      );
      return false;
    }
  }

  /**
   * Export the FlexSearch index to the IndexedDB cache.
   */
  private async exportIndexToCache(contentHash: string): Promise<void> {
    if (!this.index) {
      return;
    }

    try {
      // Clear old cache first
      await this.cacheService.clearIndex();

      // Export each chunk
      await this.index.export(async (key: string, data: string) => {
        await this.cacheService.saveIndexChunk(key, data);
      });

      // Save the content hash
      await this.cacheService.saveHash(contentHash);
    } catch (err) {
      console.error(
        '[CompendiumService] Failed to export index to cache:',
        err,
      );
    }
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

    const results = this.index.search(query, { limit });
    const entryMap = this._entryMap();

    return results
      .map((id: number | string) => {
        // const id = this.idToEntry.get(id as number);
        if (!id) return null;

        const entry = entryMap.get(id as string);
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
      return this.formatFacetLabel('type', entry.frontmatter.type);
    }

    // Extract from path
    const parts = entry.publicPath.split('/');
    if (parts.length >= 2) {
      return this.formatFacetLabel('type', parts[1]); // e.g., "Bestiary", "Adventures"
    }

    return 'Unknown';
  }

  /**
   * Set the search query
   */
  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  /**
   * Toggle a filter value on or off
   */
  toggleFilter(key: FacetKey, value: string): void {
    const current = this._activeFilters();
    const currentValues = current[key] ?? [];

    let newValues: readonly string[];
    if (currentValues.includes(value)) {
      newValues = currentValues.filter((v) => v !== value);
    } else {
      newValues = [...currentValues, value];
    }

    // When type changes, clear dependent facets
    if (key === 'type') {
      const dependentKeys: FacetKey[] = [
        'class',
        'level',
        'role',
        'organization',
        'echelon',
        'action_type',
        'ancestry',
        'size',
        'feature_type',
        'subclass',
        'target',
        'common_ability_type',
        'treasure_type',
        'perk_type',
        'chapter_num',
        'culture_benefit_type',
        'dynamic_terrain_type',
      ];
      const newFilters: ActiveFilters = { ...current, [key]: newValues };
      for (const depKey of dependentKeys) {
        delete newFilters[depKey];
      }
      this._activeFilters.set(newFilters);
    } else {
      this._activeFilters.set({
        ...current,
        [key]: newValues,
      });
    }
  }

  /**
   * Clear all active filters
   */
  clearFilters(): void {
    this._activeFilters.set({});
  }

  /**
   * Set all filters at once (useful for restoring from URL params)
   */
  setFilters(filters: ActiveFilters): void {
    this._activeFilters.set(filters);
  }

  /**
   * Remove a specific filter
   */
  removeFilter(key: FacetKey, value: string): void {
    const current = this._activeFilters();
    const currentValues = current[key] ?? [];
    const newValues = currentValues.filter((v) => v !== value);

    this._activeFilters.set({
      ...current,
      [key]: newValues,
    });
  }

  /**
   * Check if an entry matches the active filters
   */
  private matchesFilters(
    entry: CompendiumEntry,
    filters: ActiveFilters,
  ): boolean {
    for (const [key, values] of Object.entries(filters)) {
      if (!values || values.length === 0) continue;

      const entryValue = this.getEntryValueForFacet(entry, key as FacetKey);
      if (entryValue === null) return false;

      // Check if any of the filter values match
      const entryValues = Array.isArray(entryValue) ? entryValue : [entryValue];
      const hasMatch = values.some((v) =>
        entryValues.some((ev) => String(ev) === v),
      );
      if (!hasMatch) return false;
    }

    return true;
  }

  /**
   * Get the value(s) from an entry for a given facet key
   */
  private getEntryValueForFacet(
    entry: CompendiumEntry,
    key: FacetKey,
  ): string | readonly string[] | null {
    const fm = entry.frontmatter as Record<string, unknown>;

    switch (key) {
      case 'type':
        return fm['type'] as string | null;
      case 'class':
        return (fm['class'] as string) ?? null;
      case 'level':
        return fm['level'] != null ? String(fm['level']) : null;
      case 'role':
        return (fm['role'] as string) ?? null;
      case 'organization':
        return (fm['organization'] as string) ?? null;
      case 'source':
        return (fm['source'] as string) ?? null;
      case 'echelon':
        return fm['echelon'] != null ? String(fm['echelon']) : null;
      case 'action_type':
        return (fm['action_type'] as string) ?? null;
      case 'ancestry': {
        const ancestry = fm['ancestry'];
        if (ancestry == null) return null;
        return Array.isArray(ancestry)
          ? (ancestry as readonly string[])
          : (ancestry as string);
      }
      case 'size':
        return fm['size'] != null ? String(fm['size']) : null;
      case 'feature_type':
        return (fm['feature_type'] as string) ?? null;
      case 'subclass':
        return (fm['subclass'] as string) ?? null;
      case 'target':
        return (fm['target'] as string) ?? null;
      case 'common_ability_type':
        return (fm['common_ability_type'] as string) ?? null;
      case 'treasure_type':
        return (fm['treasure_type'] as string) ?? null;
      case 'perk_type':
        return (fm['perk_type'] as string) ?? null;
      case 'chapter_num':
        return fm['chapter_num'] != null ? String(fm['chapter_num']) : null;
      case 'culture_benefit_type':
        return (fm['culture_benefit_type'] as string) ?? null;
      case 'dynamic_terrain_type':
        return (fm['dynamic_terrain_type'] as string) ?? null;
      default:
        return null;
    }
  }

  /**
   * Build a facet group with counts
   */
  private buildFacetGroup(
    key: FacetKey,
    entries: readonly CompendiumEntry[],
    activeFilters: ActiveFilters,
  ): FacetGroup {
    const counts = new Map<string, number>();

    // Filter entries by other active facets (not this one)
    const otherFilters: ActiveFilters = { ...activeFilters };
    delete otherFilters[key];

    for (const entry of entries) {
      // Check if entry matches other filters
      if (!this.matchesFilters(entry, otherFilters)) continue;

      const value = this.getEntryValueForFacet(entry, key);
      if (value === null) continue;

      const values = Array.isArray(value) ? value : [value];
      for (const v of values) {
        const strVal = String(v);
        counts.set(strVal, (counts.get(strVal) ?? 0) + 1);
      }
    }

    // Sort by count descending, then alphabetically
    const sortedEntries = [...counts.entries()].sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });

    const options: FacetOption[] = sortedEntries.map(([value, count]) => ({
      value,
      label: this.formatFacetLabel(key, value),
      count,
    }));

    return {
      key,
      label: key, // Will be translated in the view
      options,
    };
  }

  /**
   * Format a facet value for display
   */
  public formatFacetLabel(key: FacetKey | string, value: string): string {
    // Clean up type values for display
    if (key === 'type') {
      // Remove backslash escapes and replace underscores with spaces
      const cleaned = value.replace(/\\_/g, ' ').replace(/_/g, ' ');

      // Capitalize first letter of each word
      return cleaned
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    // Capitalize first letter for other facets
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
