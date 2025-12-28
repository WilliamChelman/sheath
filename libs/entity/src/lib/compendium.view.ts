import { I18nService } from '@/i18n';
import { PageTitleDirective } from '@/ui/page-title';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorPlus,
  phosphorX,
  phosphorFunnel,
} from '@ng-icons/phosphor-icons/regular';
import { skip, Subscription, switchMap } from 'rxjs';
import { compendiumBundle } from './compendium.i18n';
import { CompendiumEmptyStateComponent } from './components/compendium-empty-state.component';
import { CompendiumEntityCardComponent } from './components/compendium-entity-card.component';
import {
  CompendiumFacetsComponent,
  FacetSelections,
  NumberRangeSelection,
} from './components/compendium-facets.component';
import { CompendiumMobileFiltersComponent } from './components/compendium-mobile-filters.component';
import { CompendiumPaginationComponent } from './components/compendium-pagination.component';
import { CompendiumSearchBarComponent } from './components/compendium-search-bar.component';
import { CompendiumSkeletonCardComponent } from './components/compendium-skeleton-card.component';
import {
  CompendiumSortWidgetComponent,
  SortOption,
} from './components/compendium-sort-widget.component';
import {
  EntityCreateData,
  EntityCreateModalComponent,
} from './components/entity-create-modal.component';
import { EntityClassPropertyConfig } from './models';
import {
  DomainService,
  EntitySearchService,
  EntityService,
  FeatureFlagsService,
  PaginatedSearchResult,
} from './services';

@Component({
  selector: 'app-compendium-view',
  imports: [
    NgIcon,
    CompendiumEntityCardComponent,
    CompendiumPaginationComponent,
    CompendiumSearchBarComponent,
    CompendiumSortWidgetComponent,
    CompendiumEmptyStateComponent,
    CompendiumFacetsComponent,
    CompendiumMobileFiltersComponent,
    CompendiumSkeletonCardComponent,
    EntityCreateModalComponent,
    PageTitleDirective,
  ],
  viewProviders: [provideIcons({ phosphorPlus, phosphorX, phosphorFunnel })],
  template: `
    <div
      class="min-h-screen bg-linear-to-br from-base-300 via-base-100 to-base-200"
    >
      <div class="container mx-auto px-4 py-8 max-w-7xl">
        <!-- Header -->
        <header class="mb-8">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1
                appPageTitle
                class="text-3xl sm:text-4xl font-bold text-base-content"
              >
                {{ t('title') }}
              </h1>
              <p class="text-base-content/60 mt-1">
                {{ t('subtitle') }}
              </p>
            </div>

            @if (featureFlags.canCreateEntity()) {
              <button
                class="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-shadow self-start sm:self-auto"
                (click)="openCreateModal()"
              >
                <ng-icon name="phosphorPlus" class="text-lg" />
                {{ t('createButton') }}
              </button>
            }
          </div>
        </header>

        <!-- Loading State with Skeleton Cards -->
        @if (isLoading()) {
          <div class="space-y-6">
            <!-- Skeleton search bar -->
            <div class="card bg-base-100 shadow-sm p-4">
              <div class="flex flex-col sm:flex-row gap-4">
                <div class="skeleton h-12 flex-1"></div>
                <div class="skeleton h-12 w-32"></div>
              </div>
            </div>

            <!-- Skeleton grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (i of skeletonCards; track i) {
                <app-compendium-skeleton-card [delay]="i * 50" />
              }
            </div>
          </div>
        }

        <!-- Content -->
        @if (!isLoading()) {
          <!-- Search & Filter Bar Card -->
          <div class="card bg-base-100 shadow-sm mb-6">
            <div class="card-body p-4">
              <div class="flex flex-col sm:flex-row gap-4">
                <div class="flex-1 min-w-0">
                  <app-compendium-search-bar
                    [searchPlaceholder]="t('searchPlaceholder')"
                    [allTypesLabel]="t('allTypes')"
                    [entityTypes]="entityTypesWithNames()"
                    [(searchQuery)]="searchQuery"
                    [(selectedType)]="selectedType"
                  />
                </div>
                <div class="flex gap-2">
                  <!-- Mobile Filter Button -->
                  @if (selectedType() && selectedTypePropertyConfigs().length > 0) {
                    <div class="lg:hidden">
                      <app-compendium-mobile-filters
                        [propertyConfigs]="selectedTypePropertyConfigs()"
                        [entities]="entitiesOfSelectedType()"
                        [(selections)]="facetSelections"
                        (clearFilters)="clearFacetSelections()"
                      />
                    </div>
                  }
                  <app-compendium-sort-widget
                    [availableSortOptions]="availableSortOptions()"
                    [(selectedSort)]="sortOption"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content with Optional Facets Sidebar -->
          <div class="flex gap-6">
            <!-- Facets Sidebar (shown when type is selected, hidden on mobile) -->
            @if (selectedType() && selectedTypePropertyConfigs().length > 0) {
              <aside class="w-64 shrink-0 hidden lg:block">
                <div class="sticky top-4">
                  <div
                    class="card bg-base-100/80 backdrop-blur-sm shadow-sm border border-base-200"
                  >
                    <div class="card-body p-4">
                      <div class="flex items-center justify-between mb-3">
                        <h3 class="font-semibold text-base-content flex items-center gap-2">
                          <ng-icon name="phosphorFunnel" class="text-lg text-primary" />
                          {{ t('filters') }}
                        </h3>
                        @if (hasActiveFilters()) {
                          <button
                            class="btn btn-ghost btn-xs gap-1 text-error hover:bg-error/10"
                            (click)="clearFacetSelections()"
                          >
                            <ng-icon name="phosphorX" class="text-sm" />
                            {{ t('clearFilters') }}
                          </button>
                        }
                      </div>
                      <app-compendium-facets
                        [propertyConfigs]="selectedTypePropertyConfigs()"
                        [entities]="entitiesOfSelectedType()"
                        [(selections)]="facetSelections"
                      />
                    </div>
                  </div>
                </div>
              </aside>
            }

            <!-- Main Content Area -->
            <div class="flex-1 min-w-0">
              <!-- Entity Count & Index Status -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <p class="text-sm text-base-content/60 font-medium">
                    {{ t('entityCount', { count: paginatedResult().total }) }}
                  </p>
                  @if (isIndexing()) {
                    <span
                      class="text-xs text-base-content/40 flex items-center gap-1.5 bg-base-200 px-2 py-1 rounded-full"
                    >
                      <span class="loading loading-spinner loading-xs"></span>
                      {{ t('indexing') }}
                    </span>
                  }
                </div>
                @if (hasActiveFilters()) {
                  <span class="badge badge-primary badge-outline badge-sm">
                    {{ activeFilterCount() }} {{ t('filtersCount', { count: activeFilterCount() }) }}
                  </span>
                }
              </div>

              <!-- Entity List -->
              @if (paginatedResult().results.length > 0) {
                <div
                  class="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch"
                  [class.lg:grid-cols-3]="!selectedType()"
                >
                  @for (
                    result of paginatedResult().results;
                    track result.entity.id;
                    let i = $index
                  ) {
                    <app-compendium-entity-card
                      [entity]="result.entity"
                      [typeName]="getTypeName(result.entity.type)"
                      [searchQuery]="searchQuery()"
                      [animationDelay]="i * 30"
                    />
                  }
                </div>

                <!-- Pagination -->
                <app-compendium-pagination
                  [currentPage]="currentPage()"
                  [totalPages]="paginatedResult().totalPages"
                  (pageChange)="goToPage($event)"
                />
              } @else {
                <!-- Empty State - Different message based on whether filters are active -->
                @if (hasActiveFilters() || searchQuery().trim()) {
                  <app-compendium-empty-state
                    icon="phosphorMagnifyingGlass"
                    [title]="t('noEntitiesWithFilters')"
                    [description]="t('noEntitiesWithFiltersDescription')"
                    [showClearFilters]="hasActiveFilters()"
                    [clearFiltersLabel]="t('clearAllFilters')"
                    (clearFiltersClick)="clearFacetSelections()"
                  />
                } @else {
                  <app-compendium-empty-state
                    icon="phosphorFileText"
                    [title]="t('noEntities')"
                    [description]="t('noEntitiesDescription')"
                  />
                }
              }
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Create Entity Modal -->
    <app-entity-create-modal
      [entityTypes]="allEntityTypes()"
      (created)="handleEntityCreated($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompendiumView implements OnInit, OnDestroy {
  private readonly i18n = inject(I18nService);
  private readonly domainService = inject(DomainService);
  private readonly entityService = inject(EntityService);
  private readonly searchService = inject(EntitySearchService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly featureFlags = inject(FeatureFlagsService);

  private readonly createModal = viewChild(EntityCreateModalComponent);

  protected readonly t = this.i18n.useBundleT(compendiumBundle);

  private readonly typeNameMap = computed(() => {
    const map = new Map<string, string>();
    for (const config of this.domainService.allClassConfigs) {
      map.set(config.id, config.name);
    }
    return map;
  });

  protected getTypeName(typeId: string): string {
    return this.typeNameMap().get(typeId) ?? typeId;
  }

  protected readonly isLoading = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly selectedType = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(24);
  protected readonly facetSelections = signal<FacetSelections>({
    strings: {},
    numbers: {},
  });
  protected readonly sortBy = signal<'name' | 'score' | string>('name');
  protected readonly sortDirection = signal<'asc' | 'desc'>('asc');

  private readonly entities = toSignal(this.searchService.entities$, {
    initialValue: [],
  });
  protected readonly isIndexing = toSignal(this.searchService.isIndexing$, {
    initialValue: false,
  });

  private readonly _paginatedResult = signal<PaginatedSearchResult>({
    results: [],
    total: 0,
    page: 1,
    pageSize: 24,
    totalPages: 0,
  });
  protected readonly paginatedResult = this._paginatedResult.asReadonly();

  private readonly subscription = new Subscription();

  protected readonly entityTypes = computed(() => {
    const types = new Set<string>();
    for (const entity of this.entities()) {
      if (entity.type) {
        types.add(entity.type);
      }
    }
    return Array.from(types).sort();
  });

  protected readonly entityTypesWithNames = computed(() => {
    return this.entityTypes().map((type) => ({
      id: type,
      name: this.getTypeName(type),
    }));
  });

  protected readonly allEntityTypes = computed(() => {
    return this.domainService.allClassConfigs.map((config) => ({
      id: config.id,
      name: config.name,
    }));
  });

  protected readonly selectedTypePropertyConfigs = computed<
    EntityClassPropertyConfig[]
  >(() => {
    const type = this.selectedType();
    if (!type) return [];

    const classConfig = this.domainService.allClassConfigs.find(
      (c) => c.id === type,
    );
    if (!classConfig) return [];

    return classConfig.properties
      .map((propId) =>
        this.domainService.allPropertyConfigs.find((p) => p.id === propId),
      )
      .filter((p): p is EntityClassPropertyConfig => p !== undefined);
  });

  protected readonly entitiesOfSelectedType = computed(() => {
    const type = this.selectedType();
    if (!type) return [];
    return this.entities().filter((e) => e.type === type);
  });

  protected readonly hasActiveFilters = computed(() => {
    const sel = this.facetSelections();
    return (
      Object.keys(sel.strings).length > 0 || Object.keys(sel.numbers).length > 0
    );
  });

  protected readonly activeFilterCount = computed(() => {
    const sel = this.facetSelections();
    let count = Object.keys(sel.strings).reduce(
      (acc, key) => acc + (sel.strings[key]?.length ?? 0),
      0
    );
    count += Object.keys(sel.numbers).reduce((acc, key) => {
      const numSel = sel.numbers[key];
      if (!numSel) return acc;
      let c = 0;
      if (numSel.min !== undefined) c++;
      if (numSel.max !== undefined) c++;
      c += numSel.exact?.length ?? 0;
      return acc + c;
    }, 0);
    return count;
  });

  protected readonly skeletonCards = Array.from({ length: 6 }, (_, i) => i);

  protected readonly sortOption = signal<string>('name:asc');

  protected readonly availableSortOptions = computed<SortOption[]>(() => {
    const options: SortOption[] = [
      {
        label: this.t('sort.nameAsc'),
        value: 'name:asc',
      },
      {
        label: this.t('sort.nameDesc'),
        value: 'name:desc',
      },
    ];

    // Add score option when text search is active
    if (this.searchQuery().trim()) {
      options.push({
        label: this.t('sort.scoreDesc'),
        value: 'score:desc',
      });
    }

    // Add property-based options when type is selected
    const type = this.selectedType();
    if (type) {
      const propertyConfigs = this.selectedTypePropertyConfigs();
      // Filter to only include sortable properties (default to true if not specified)
      const sortableConfigs = propertyConfigs.filter(
        (propConfig) => propConfig.isSortable,
      );

      for (const propConfig of sortableConfigs) {
        if (propConfig.datatype === 'boolean') {
          options.push({
            label: this.t('sort.booleanAsc', { name: propConfig.name }),
            value: `${propConfig.id}:asc`,
          });
          options.push({
            label: this.t('sort.booleanDesc', { name: propConfig.name }),
            value: `${propConfig.id}:desc`,
          });
        } else {
          options.push({
            label: this.t('sort.propertyAsc', { name: propConfig.name }),
            value: `${propConfig.id}:asc`,
          });
          options.push({
            label: this.t('sort.propertyDesc', { name: propConfig.name }),
            value: `${propConfig.id}:desc`,
          });
        }
      }
    }

    return options;
  });

  private previousType = '';
  private previousSearchQuery = '';
  private isInitializingFromUrl = false;

  /**
   * Parses URL query params and returns the filter state.
   * Query param format:
   * - q: search query
   * - type: entity type
   * - page: page number
   * - sort: sort option as "sortBy:direction" (e.g., "name:asc", "score:desc")
   * - s_<propId>: comma-separated string facet values
   * - n_<propId>: number facet as "min:X,max:Y,exact:A|B|C"
   */
  private parseQueryParams(params: Record<string, string>): {
    searchQuery: string;
    selectedType: string;
    currentPage: number;
    sortOption: string;
    facetSelections: FacetSelections;
  } {
    const facetSelections: FacetSelections = { strings: {}, numbers: {} };

    for (const [key, value] of Object.entries(params)) {
      if (key.startsWith('s_') && value) {
        const propId = key.slice(2);
        facetSelections.strings[propId] = value.split(',').filter(Boolean);
      } else if (key.startsWith('n_') && value) {
        const propId = key.slice(2);
        const numberSelection: NumberRangeSelection = {};

        for (const part of value.split(',')) {
          const [type, val] = part.split(':');
          if (type === 'min' && val) {
            numberSelection.min = Number(val);
          } else if (type === 'max' && val) {
            numberSelection.max = Number(val);
          } else if (type === 'exact' && val) {
            numberSelection.exact = val.split('|').map(Number);
          }
        }

        if (
          numberSelection.min !== undefined ||
          numberSelection.max !== undefined ||
          numberSelection.exact?.length
        ) {
          facetSelections.numbers[propId] = numberSelection;
        }
      }
    }

    return {
      searchQuery: params['q'] ?? '',
      selectedType: params['type'] ?? '',
      currentPage: params['page'] ? Number(params['page']) : 1,
      sortOption: params['sort'] ?? 'name:asc',
      facetSelections,
    };
  }

  /**
   * Serializes filter state to URL query params.
   */
  private buildQueryParams(): Record<string, string | null> {
    const params: Record<string, string | null> = {};

    const query = this.searchQuery().trim();
    params['q'] = query || null;

    const type = this.selectedType();
    params['type'] = type || null;

    const page = this.currentPage();
    params['page'] = page > 1 ? String(page) : null;

    const sort = this.sortOption();
    params['sort'] = sort !== 'name:asc' ? sort : null;

    // Clear all existing facet params first by setting them to null
    const currentParams = this.route.snapshot.queryParams;
    for (const key of Object.keys(currentParams)) {
      if (key.startsWith('s_') || key.startsWith('n_')) {
        params[key] = null;
      }
    }

    // Add current facet selections
    const facets = this.facetSelections();

    for (const [propId, values] of Object.entries(facets.strings)) {
      if (values.length > 0) {
        params[`s_${propId}`] = values.join(',');
      }
    }

    for (const [propId, selection] of Object.entries(facets.numbers)) {
      const parts: string[] = [];
      if (selection.min !== undefined) {
        parts.push(`min:${selection.min}`);
      }
      if (selection.max !== undefined) {
        parts.push(`max:${selection.max}`);
      }
      if (selection.exact?.length) {
        parts.push(`exact:${selection.exact.join('|')}`);
      }
      if (parts.length > 0) {
        params[`n_${propId}`] = parts.join(',');
      }
    }

    return params;
  }

  private updateUrlFromState(): void {
    if (this.isInitializingFromUrl) return;

    const params = this.buildQueryParams();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: false,
    });
  }

  constructor() {
    // Parse sort option and update sortBy/sortDirection signals
    effect(() => {
      const sortValue = this.sortOption();
      const [sortBy, sortDirection] = sortValue.split(':');
      if (sortBy && (sortDirection === 'asc' || sortDirection === 'desc')) {
        this.sortBy.set(sortBy as 'name' | 'score' | string);
        this.sortDirection.set(sortDirection as 'asc' | 'desc');
      }
    });

    // Auto-switch sort to score when user starts typing, reset to name when cleared
    effect(() => {
      // Skip during initialization to avoid overriding URL params
      if (this.isInitializingFromUrl) {
        this.previousSearchQuery = this.searchQuery().trim();
        return;
      }

      const query = this.searchQuery().trim();
      const currentSort = this.sortOption();
      const availableOptions = this.availableSortOptions();

      // Detect when user starts typing (query changed from empty to non-empty)
      const startedTyping = !this.previousSearchQuery && query;
      // Detect when user cleared search (query changed from non-empty to empty)
      const clearedSearch = this.previousSearchQuery && !query;

      if (startedTyping) {
        // When user starts typing, switch to score sorting if available
        const scoreAvailable = availableOptions.some(
          (opt) => opt.value === 'score:desc',
        );
        if (scoreAvailable) {
          this.sortOption.set('score:desc');
        }
      } else if (clearedSearch) {
        // When search is cleared, reset to name sorting if currently on score
        if (currentSort === 'score:desc') {
          this.sortOption.set('name:asc');
        }
      }

      // Update previous query for next comparison
      this.previousSearchQuery = query;
    });

    // Validate sort option against available options and reset if invalid (runs after auto-switch)
    effect(() => {
      const currentSort = this.sortOption();
      const availableOptions = this.availableSortOptions();
      const isValid = availableOptions.some((opt) => opt.value === currentSort);

      if (!isValid && availableOptions.length > 0) {
        // Reset to default if current sort is invalid
        this.sortOption.set('name:asc');
      }
    });

    // Reset page and clear facets when search/type changes
    effect(() => {
      this.searchQuery();
      const currentType = this.selectedType();

      // Clear facet selections when type changes
      if (currentType !== this.previousType) {
        this.previousType = currentType;
        this.facetSelections.set({ strings: {}, numbers: {} });
      }

      this.currentPage.set(1);
    });

    // Reset page when facets change (separate to avoid circular reset)
    effect(() => {
      this.facetSelections();
      this.currentPage.set(1);
    });

    // Sync state to URL when any filter changes
    effect(() => {
      // Track all filter signals
      this.searchQuery();
      this.selectedType();
      this.currentPage();
      this.facetSelections();
      this.sortOption();

      // Update URL (skipped during initialization)
      this.updateUrlFromState();
    });

    // Perform search when criteria changes
    effect(() => {
      const query = this.searchQuery().trim() || undefined;
      const type = this.selectedType() || undefined;
      const page = this.currentPage();
      const size = this.pageSize();
      const facets = this.facetSelections();
      const sortBy = this.sortBy();
      const sortDirection = this.sortDirection();

      // Convert string facet selections to properties filter format
      const properties: Record<string, unknown> = {};
      for (const [propId, values] of Object.entries(facets.strings)) {
        if (values.length > 0) {
          properties[propId] = values.length === 1 ? values[0] : values;
        }
      }

      // Number filters are passed separately
      const numberFilters =
        Object.keys(facets.numbers).length > 0 ? facets.numbers : undefined;

      this.searchService
        .searchPaginated(
          {
            text: query,
            type,
            properties:
              Object.keys(properties).length > 0 ? properties : undefined,
            numberFilters,
            sortBy,
            sortDirection,
          },
          page,
          size,
        )
        .subscribe((result) => {
          this._paginatedResult.set(result);
        });
    });
  }

  ngOnInit(): void {
    // Initialize state from URL query params
    this.initializeFromUrl();

    // Subscribe to query param changes for browser back/forward navigation
    // Skip the first emission as we've already initialized from snapshot
    this.subscription.add(
      this.route.queryParams.pipe(skip(1)).subscribe((params) => {
        this.applyQueryParams(params as Record<string, string>);
      }),
    );

    this.subscription.add(
      this.searchService.entities$
        .pipe(
          switchMap(() => {
            const facets = this.facetSelections();
            const properties: Record<string, unknown> = {};
            for (const [propId, values] of Object.entries(facets.strings)) {
              if (values.length > 0) {
                properties[propId] = values.length === 1 ? values[0] : values;
              }
            }

            const numberFilters =
              Object.keys(facets.numbers).length > 0
                ? facets.numbers
                : undefined;

            return this.searchService.searchPaginated(
              {
                text: this.searchQuery().trim() || undefined,
                type: this.selectedType() || undefined,
                properties:
                  Object.keys(properties).length > 0 ? properties : undefined,
                numberFilters,
                sortBy: this.sortBy(),
                sortDirection: this.sortDirection(),
              },
              this.currentPage(),
              this.pageSize(),
            );
          }),
        )
        .subscribe((result) => {
          this._paginatedResult.set(result);
        }),
    );
  }

  private initializeFromUrl(): void {
    this.isInitializingFromUrl = true;
    const params = this.route.snapshot.queryParams as Record<string, string>;
    const state = this.parseQueryParams(params);

    this.searchQuery.set(state.searchQuery);
    this.previousSearchQuery = state.searchQuery.trim(); // Initialize previous query
    this.selectedType.set(state.selectedType);
    this.previousType = state.selectedType; // Prevent facet clear on init
    this.currentPage.set(state.currentPage);
    this.sortOption.set(state.sortOption);
    this.facetSelections.set(state.facetSelections);

    // Allow URL updates after a microtask to let signals settle
    queueMicrotask(() => {
      this.isInitializingFromUrl = false;
    });
  }

  private applyQueryParams(params: Record<string, string>): void {
    const state = this.parseQueryParams(params);

    // Only update if values actually changed (to prevent loops)
    if (this.searchQuery() !== state.searchQuery) {
      this.searchQuery.set(state.searchQuery);
    }
    if (this.selectedType() !== state.selectedType) {
      this.previousType = state.selectedType; // Prevent facet clear
      this.selectedType.set(state.selectedType);
    }
    if (this.currentPage() !== state.currentPage) {
      this.currentPage.set(state.currentPage);
    }
    if (this.sortOption() !== state.sortOption) {
      this.sortOption.set(state.sortOption);
    }

    // Deep compare facet selections
    const currentFacets = this.facetSelections();
    if (
      JSON.stringify(currentFacets) !== JSON.stringify(state.facetSelections)
    ) {
      this.facetSelections.set(state.facetSelections);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  protected goToPage(page: number): void {
    const totalPages = this.paginatedResult().totalPages;
    if (page >= 1 && page <= totalPages) {
      this.currentPage.set(page);
    }
  }

  protected clearFacetSelections(): void {
    this.facetSelections.set({ strings: {}, numbers: {} });
  }

  protected openCreateModal(): void {
    this.createModal()?.open();
  }

  protected handleEntityCreated(data: EntityCreateData): void {
    this.entityService
      .create({
        name: data.name,
        type: data.type,
      })
      .subscribe({
        next: (entities) => {
          if (entities.length > 0) {
            const createdEntity = entities[0];
            this.router.navigate([createdEntity.id], {
              relativeTo: this.route,
              queryParams: { edit: 'true' },
            });
          }
        },
        error: (err) => {
          console.error('Failed to create entity:', err);
        },
      });
  }
}
