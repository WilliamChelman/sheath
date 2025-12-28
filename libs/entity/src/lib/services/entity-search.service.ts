import { inject, Injectable, OnDestroy } from '@angular/core';
import { Index as FlexSearchIndex } from 'flexsearch';
import {
  BehaviorSubject,
  filter,
  firstValueFrom,
  forkJoin,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { Entity } from '../models/entity';
import { EntityClassPropertyConfig } from '../models/entity-class-property-config';
import { DomainService } from './domain.service';
import { EntitySearchCacheService } from './entity-search-cache.service';
import {
  EntitySearchQueryParser,
  ParsedSearchQuery,
} from './entity-search-query-parser';
import { EntityService } from './entity.service';

export interface NumberRangeFilter {
  min?: number;
  max?: number;
  exact?: number[];
}

export interface EntitySearchCriteria {
  text?: string;
  type?: string;
  properties?: Record<string, unknown>;
  numberFilters?: Record<string, NumberRangeFilter>;
  sortBy?: 'name' | 'score' | string; // string = property ID
  sortDirection?: 'asc' | 'desc';
}

export interface EntitySearchResult {
  entity: Entity;
  score?: number;
}

export interface PaginatedSearchResult {
  results: EntitySearchResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class EntitySearchService implements OnDestroy {
  private readonly entityService = inject(EntityService);
  private readonly domainService = inject(DomainService);
  private readonly cacheService = inject(EntitySearchCacheService);

  private index: FlexSearchIndex | null = null;
  private readonly _isIndexReady$ = new BehaviorSubject<boolean>(false);
  private readonly _isIndexing$ = new BehaviorSubject<boolean>(false);
  private currentContentHash: string | null = null;
  private subscription: Subscription;

  readonly isIndexReady$: Observable<boolean> =
    this._isIndexReady$.asObservable();
  readonly isIndexing$: Observable<boolean> = this._isIndexing$.asObservable();

  private readonly propertyConfigsByClassId: Map<
    string,
    EntityClassPropertyConfig[]
  >;
  private queryParser: EntitySearchQueryParser | null = null;

  readonly entities$: Observable<Entity[]> = this.entityService.entities$;
  readonly entitiesMap$: Observable<Map<string, Entity>> =
    this.entityService.entitiesMap$;

  constructor() {
    this.propertyConfigsByClassId = this.buildPropertyConfigsMap();

    this.subscription = this.entityService.entities$
      .pipe(
        filter(
          (entities) => entities.length > 0 && !this._isIndexing$.getValue(),
        ),
        switchMap((entities) => this.buildIndex(entities)),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private buildPropertyConfigsMap(): Map<string, EntityClassPropertyConfig[]> {
    const map = new Map<string, EntityClassPropertyConfig[]>();
    for (const classConfig of this.domainService.allClassConfigs) {
      const propertyConfigs = classConfig.properties
        .map((propId) =>
          this.domainService.allPropertyConfigs.find((p) => p.id === propId),
        )
        .filter((p): p is EntityClassPropertyConfig => p !== undefined);
      map.set(classConfig.id, propertyConfigs);
    }
    return map;
  }

  search(criteria: EntitySearchCriteria, limit = 200): Observable<Entity[]> {
    return this.searchPaginated(criteria, 1, limit).pipe(
      map((result) => result.results.map((r) => r.entity)),
    );
  }

  parseQuery(query: string): ParsedSearchQuery {
    if (!this.queryParser) {
      this.queryParser = new EntitySearchQueryParser(
        this.domainService.allPropertyConfigs,
      );
    }
    return this.queryParser.parse(query);
  }

  searchPaginated(
    criteria: EntitySearchCriteria,
    page = 1,
    pageSize = 50,
  ): Observable<PaginatedSearchResult> {
    // Parse smart search syntax from text field
    const effectiveCriteria = this.applySmartSearch(criteria);

    return this.entityService.entities$.pipe(
      take(1),
      map((entities) => {
        let results: EntitySearchResult[];

        if (
          effectiveCriteria.text &&
          this.index &&
          this._isIndexReady$.getValue()
        ) {
          results = this.fullTextSearch(effectiveCriteria.text, entities);
        } else {
          results = entities.map((entity) => ({ entity }));
        }

        if (effectiveCriteria.type) {
          results = results.filter(
            (r) => r.entity.type === effectiveCriteria.type,
          );
        }

        if (
          effectiveCriteria.properties &&
          Object.keys(effectiveCriteria.properties).length > 0
        ) {
          results = this.filterResultsByProperties(
            results,
            effectiveCriteria.properties,
            effectiveCriteria.type,
          );
        }

        if (
          effectiveCriteria.numberFilters &&
          Object.keys(effectiveCriteria.numberFilters).length > 0
        ) {
          results = this.filterResultsByNumberFilters(
            results,
            effectiveCriteria.numberFilters,
          );
        }

        // Apply sorting
        let sortBy = effectiveCriteria.sortBy ?? 'name';
        if (effectiveCriteria.text && !effectiveCriteria.sortBy) {
          sortBy = 'score';
        }
        const sortDirection = effectiveCriteria.sortDirection ?? 'asc';
        results = this.sortResults(
          results,
          sortBy,
          sortDirection,
          effectiveCriteria.type,
        );

        const total = results.length;
        const totalPages = Math.ceil(total / pageSize);
        const offset = (page - 1) * pageSize;
        const paginatedResults = results.slice(offset, offset + pageSize);

        return {
          results: paginatedResults,
          total,
          page,
          pageSize,
          totalPages,
        };
      }),
    );
  }

  rebuildIndex(): Observable<void> {
    return this.entityService.entities$.pipe(
      take(1),
      switchMap((entities) => {
        if (entities.length === 0) {
          return of(void 0);
        }
        return this.cacheService.clearIndex().pipe(
          tap(() => {
            this.currentContentHash = null;
          }),
          switchMap(() => this.buildIndex(entities)),
        );
      }),
    );
  }

  private applySmartSearch(criteria: EntitySearchCriteria): EntitySearchCriteria {
    if (!criteria.text) {
      return criteria;
    }

    const parsed = this.parseQuery(criteria.text);

    // If nothing was parsed from the query, return original criteria
    if (
      !parsed.text &&
      Object.keys(parsed.properties).length === 0 &&
      Object.keys(parsed.numberFilters).length === 0
    ) {
      return criteria;
    }

    return {
      ...criteria,
      text: parsed.text || undefined,
      properties: {
        ...criteria.properties,
        ...parsed.properties,
      },
      numberFilters: {
        ...criteria.numberFilters,
        ...parsed.numberFilters,
      },
    };
  }

  private buildIndex(entities: Entity[]): Observable<void> {
    if (this._isIndexing$.getValue()) {
      return of(void 0);
    }

    this._isIndexing$.next(true);

    const contentHash = this.computeContentHash(entities);

    if (
      contentHash === this.currentContentHash &&
      this._isIndexReady$.getValue()
    ) {
      this._isIndexing$.next(false);
      return of(void 0);
    }

    return this.cacheService.isCacheValid(contentHash).pipe(
      switchMap((cacheValid) => {
        this.index = new FlexSearchIndex({
          tokenize: 'forward',
          resolution: 9,
        });

        if (cacheValid) {
          return this.loadIndexFromCache().pipe(
            map((loaded) => ({ loaded, contentHash })),
          );
        }
        return of({ loaded: false, contentHash });
      }),
      switchMap(({ loaded, contentHash }) => {
        if (loaded) {
          console.log('[EntitySearchService] Loaded search index from cache');
          this.currentContentHash = contentHash;
          this._isIndexReady$.next(true);
          this._isIndexing$.next(false);
          return of(void 0);
        }

        console.log(
          '[EntitySearchService] Building search index from scratch...',
        );

        return this.buildIndexFromEntities(entities).pipe(
          switchMap(() => this.exportIndexToCache(contentHash)),
          tap(() => {
            console.log(
              '[EntitySearchService] Search index cached for future loads',
            );
            this.currentContentHash = contentHash;
            this._isIndexReady$.next(true);
            this._isIndexing$.next(false);
          }),
        );
      }),
    );
  }

  private buildIndexFromEntities(entities: Entity[]): Observable<void> {
    return new Observable<void>((subscriber) => {
      (async () => {
        try {
          for (const entity of entities) {
            const searchableText = this.buildSearchableText(entity);
            await this.index!.addAsync(entity.id, searchableText);
          }
          subscriber.next();
          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      })();
    });
  }

  private buildSearchableText(entity: Entity): string {
    const parts: string[] = [
      entity.name,
      entity.description ?? '',
      entity.content ?? '',
      ...(entity.tags ?? []),
    ];

    const entityRecord = entity as unknown as Record<string, unknown>;
    const propertyConfigs = this.propertyConfigsByClassId.get(entity.type);

    if (propertyConfigs) {
      for (const propConfig of propertyConfigs) {
        const value = entityRecord[propConfig.id];
        if (value != null) {
          if (Array.isArray(value)) {
            parts.push(...value.map(String));
          } else {
            parts.push(String(value));
          }
        }
      }
    }

    return parts.filter(Boolean).join(' ');
  }

  private computeContentHash(entities: Entity[]): string {
    const data = entities
      .map((e) => `${e.id}:${e.updatedAt}`)
      .sort()
      .join('|');

    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  private loadIndexFromCache(): Observable<boolean> {
    return this.cacheService.getAllIndexKeys().pipe(
      switchMap((keys) => {
        if (keys.length === 0) {
          return of(false);
        }

        const chunkLoads$ = keys.map((key) =>
          this.cacheService.getIndexChunk(key).pipe(
            tap((data) => {
              if (data && this.index) {
                this.index.import(key, data);
              }
            }),
          ),
        );

        return forkJoin(chunkLoads$).pipe(map(() => true));
      }),
    );
  }

  private exportIndexToCache(contentHash: string): Observable<void> {
    if (!this.index) {
      return of(void 0);
    }

    return this.cacheService.clearIndex().pipe(
      switchMap(() => {
        return new Observable<void>((subscriber) => {
          const exportPromise = this.index!.export(
            async (key: string, data: string) => {
              console.log('🚀 ~ EntitySearchService ~ key:', key);
              await firstValueFrom(this.cacheService.saveIndexChunk(key, data));
            },
          );

          Promise.resolve(exportPromise)
            .then(() => firstValueFrom(this.cacheService.saveHash(contentHash)))
            .then(() => {
              subscriber.next();
              subscriber.complete();
            })
            .catch((err) => subscriber.error(err));
        });
      }),
    );
  }

  private fullTextSearch(
    query: string,
    entities: Entity[],
  ): EntitySearchResult[] {
    if (!this.index || !query.trim()) {
      return [];
    }

    const searchResults = this.index.search(query, { limit: 1000 });
    const entitiesMap = new Map(entities.map((e) => [e.id, e]));

    return searchResults
      .map((id: number | string) => {
        const entity = entitiesMap.get(id as string);
        if (!entity) return null;
        return { entity };
      })
      .filter((r): r is EntitySearchResult => r !== null);
  }

  private filterResultsByProperties(
    results: EntitySearchResult[],
    properties: Record<string, unknown>,
    type?: string,
  ): EntitySearchResult[] {
    return results.filter((result) => {
      const entityType = type ?? result.entity.type;
      const propertyConfigs = this.propertyConfigsByClassId.get(entityType);

      for (const [propId, expectedValue] of Object.entries(properties)) {
        const propConfig = propertyConfigs?.find((p) => p.id === propId);
        const entityRecord = result.entity as unknown as Record<
          string,
          unknown
        >;
        const actualValue = entityRecord[propId];

        if (!this.matchesValue(actualValue, expectedValue, propConfig)) {
          return false;
        }
      }
      return true;
    });
  }

  private matchesValue(
    actual: unknown,
    expected: unknown,
    config?: EntityClassPropertyConfig,
  ): boolean {
    if (expected === undefined || expected === null) {
      return true;
    }

    if (actual === undefined || actual === null) {
      return false;
    }

    if (config?.isMulti && Array.isArray(actual)) {
      if (Array.isArray(expected)) {
        return expected.every((v) =>
          actual.some((a) => this.valuesEqual(a, v, config.datatype)),
        );
      }
      return actual.some((a) => this.valuesEqual(a, expected, config.datatype));
    }

    if (Array.isArray(expected)) {
      return expected.some((v) =>
        this.valuesEqual(actual, v, config?.datatype),
      );
    }

    return this.valuesEqual(actual, expected, config?.datatype);
  }

  private valuesEqual(a: unknown, b: unknown, datatype?: string): boolean {
    if (
      datatype === 'string' ||
      typeof a === 'string' ||
      typeof b === 'string'
    ) {
      const aStr = String(a).toLowerCase();
      const bStr = String(b).toLowerCase();
      return aStr.includes(bStr) || bStr.includes(aStr);
    }

    return a === b;
  }

  private filterResultsByNumberFilters(
    results: EntitySearchResult[],
    numberFilters: Record<string, NumberRangeFilter>,
  ): EntitySearchResult[] {
    return results.filter((result) => {
      const entityRecord = result.entity as unknown as Record<string, unknown>;

      for (const [propId, filter] of Object.entries(numberFilters)) {
        const actualValue = entityRecord[propId];

        if (!this.matchesNumberFilter(actualValue, filter)) {
          return false;
        }
      }
      return true;
    });
  }

  private matchesNumberFilter(
    actual: unknown,
    filter: NumberRangeFilter,
  ): boolean {
    if (actual === undefined || actual === null) {
      return false;
    }

    const numValue = Number(actual);
    if (isNaN(numValue)) {
      return false;
    }

    // If exact values are specified, check if the value matches any of them
    if (filter.exact && filter.exact.length > 0) {
      if (filter.exact.includes(numValue)) {
        return true;
      }
      // If only exact values are specified (no range), and value doesn't match, fail
      if (filter.min === undefined && filter.max === undefined) {
        return false;
      }
    }

    // Check range
    if (filter.min !== undefined && numValue < filter.min) {
      return false;
    }
    if (filter.max !== undefined && numValue > filter.max) {
      return false;
    }

    return true;
  }

  private sortResults(
    results: EntitySearchResult[],
    sortBy: 'name' | 'score' | string,
    sortDirection: 'asc' | 'desc',
    entityType?: string,
  ): EntitySearchResult[] {
    const multiplier = sortDirection === 'asc' ? 1 : -1;

    return [...results].sort((a, b) => {
      if (sortBy === 'score') {
        // If scores are not available, preserve existing order (already sorted by relevance from FlexSearch)
        if (a.score === undefined && b.score === undefined) {
          return 0; // Preserve order
        }
        const aScore = a.score ?? 0;
        const bScore = b.score ?? 0;
        return (bScore - aScore) * multiplier; // Higher score first for desc
      }

      if (sortBy === 'name') {
        return (
          a.entity.name.localeCompare(b.entity.name, undefined, {
            sensitivity: 'base',
          }) * multiplier
        );
      }

      // Sort by property value
      const type = entityType ?? a.entity.type ?? b.entity.type;
      const propertyConfigs = this.propertyConfigsByClassId.get(type);
      const propConfig = propertyConfigs?.find((p) => p.id === sortBy);

      if (!propConfig) {
        // Fallback to name if property not found
        return (
          a.entity.name.localeCompare(b.entity.name, undefined, {
            sensitivity: 'base',
          }) * multiplier
        );
      }

      const aRecord = a.entity as unknown as Record<string, unknown>;
      const bRecord = b.entity as unknown as Record<string, unknown>;
      const aValue = aRecord[sortBy];
      const bValue = bRecord[sortBy];

      // Handle missing values - place at end
      if (aValue === undefined || aValue === null) {
        return 1;
      }
      if (bValue === undefined || bValue === null) {
        return -1;
      }

      // Handle multi-value properties - use first value
      const aCompareValue = Array.isArray(aValue) ? aValue[0] : aValue;
      const bCompareValue = Array.isArray(bValue) ? bValue[0] : bValue;

      // Sort based on datatype
      if (propConfig.datatype === 'number') {
        const aNum = Number(aCompareValue);
        const bNum = Number(bCompareValue);
        if (isNaN(aNum) && isNaN(bNum)) return 0;
        if (isNaN(aNum)) return 1;
        if (isNaN(bNum)) return -1;
        return (aNum - bNum) * multiplier;
      }

      if (propConfig.datatype === 'boolean') {
        const aBool = Boolean(aCompareValue);
        const bBool = Boolean(bCompareValue);
        return (aBool === bBool ? 0 : aBool ? 1 : -1) * multiplier;
      }

      // String (default)
      return (
        String(aCompareValue).localeCompare(String(bCompareValue), undefined, {
          sensitivity: 'base',
        }) * multiplier
      );
    });
  }
}
