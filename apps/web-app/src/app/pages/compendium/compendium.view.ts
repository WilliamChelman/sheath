import { I18nService } from '@/i18n';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { compendiumBundle } from './compendium.i18n';
import { CompendiumService } from './services/compendium.service';
import type { ActiveFilters, FacetKey } from './models/compendium.model';
import { CompendiumHeaderComponent } from './components/compendium-header.component';
import { CompendiumSearchComponent } from './components/compendium-search.component';
import {
  CompendiumActiveFiltersComponent,
  type FilterChip,
} from './components/compendium-active-filters.component';
import { CompendiumFacetsComponent } from './components/compendium-facets.component';
import { CompendiumResultsComponent } from './components/compendium-results.component';

/** Keys that can be used as URL query parameters for filters */
const FILTER_PARAM_KEYS: readonly FacetKey[] = [
  'type',
  'class',
  'level',
  'role',
  'organization',
  'source',
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
] as const;

@Component({
  selector: 'app-compendium-view',
  imports: [
    CompendiumHeaderComponent,
    CompendiumSearchComponent,
    CompendiumActiveFiltersComponent,
    CompendiumFacetsComponent,
    CompendiumResultsComponent,
  ],
  template: `
    <div
      class="min-h-screen bg-linear-to-br from-base-300 via-base-100 to-base-200"
    >
      <div class="container mx-auto px-4 py-8 max-w-7xl">
        <!-- Header -->
        <app-compendium-header
          [title]="t('title')"
          [subtitle]="
            t('browse.showingCount', {
              count: displayedResults().length,
              total: compendium.totalCount(),
            })
          "
          [isLoaded]="compendium.isLoaded()"
        />

        <!-- Search Box -->
        <app-compendium-search
          [query]="searchQuery()"
          [placeholder]="t('search.placeholder')"
          (queryChange)="onSearchChange($event)"
        />

        <!-- Active Filter Chips -->
        @if (compendium.hasActiveFilters()) {
          <app-compendium-active-filters
            [chips]="activeFilterChips()"
            [clearAllLabel]="t('facets.clearAll')"
            (removeFilter)="removeFilter($event.key, $event.value)"
            (clearAll)="clearAllFilters()"
          />
        }

        <!-- Loading State -->
        @if (compendium.isLoading()) {
          <div class="flex flex-col items-center justify-center py-16">
            <span
              class="loading loading-spinner loading-lg text-primary"
            ></span>
            <p class="mt-4 text-base-content/60">{{ t('search.loading') }}</p>
          </div>
        }

        <!-- Error State -->
        @if (compendium.error()) {
          <div class="alert alert-error">
            <span>{{ t('search.error') }}</span>
          </div>
        }

        <!-- Main Content with Sidebar -->
        @if (compendium.isLoaded() && !compendium.error()) {
          <div class="flex flex-col lg:flex-row gap-6">
            <!-- Facets Sidebar -->
            <app-compendium-facets
              [facets]="compendium.availableFacets()"
              [activeFilters]="compendium.activeFilters()"
              [facetLabels]="facetLabels()"
              [filtersTitle]="t('facets.title')"
              [sortByLabelFacets]="[
                'level',
                'echelon',
                'class',
                'ancestry',
                'size',
                'feature_type',
                'subclass',
                'role',
                'organization',
                'target',
                'common_ability_type',
                'treasure_type',
                'chapter_num',
                'perk_type',
                'culture_benefit_type',
                'dynamic_terrain_type',
              ]"
              (toggleFilter)="toggleFilter($event.key, $event.value)"
            />

            <!-- Results -->
            <app-compendium-results
              [results]="displayedResults()"
              [hasActiveSearch]="
                !!searchQuery() || compendium.hasActiveFilters()
              "
              [noResultsText]="t('search.noResults')"
            />
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompendiumView implements OnInit {
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly compendium = inject(CompendiumService);

  protected readonly t = this.i18n.useBundleT(compendiumBundle);

  protected readonly searchQuery = signal('');
  protected readonly resultsComponent =
    viewChild<CompendiumResultsComponent>('resultsComponent');

  /** Whether we're currently updating URL from state (to prevent loops) */
  private isUpdatingUrl = false;

  protected readonly displayedResults = computed(() => {
    return this.compendium.filteredResults();
  });

  protected readonly activeFilterChips = computed(() => {
    const filters = this.compendium.activeFilters();
    const chips: FilterChip[] = [];

    for (const [key, values] of Object.entries(filters)) {
      if (!values) continue;
      for (const value of values) {
        chips.push({
          key: key as FacetKey,
          value,
          label: `${this.getFacetLabel(key as FacetKey)}: ${this.compendium.formatFacetLabel(key, value)}`,
        });
      }
    }

    return chips;
  });

  protected readonly facetLabels = computed(() => {
    return {
      type: this.t('facets.type'),
      class: this.t('facets.class'),
      level: this.t('facets.level'),
      roles: this.t('facets.roles'),
      source: this.t('facets.source'),
      echelon: this.t('facets.echelon'),
      action_type: this.t('facets.action_type'),
      ancestry: this.t('facets.ancestry'),
      size: this.t('facets.size'),
      feature_type: this.t('facets.feature_type'),
      subclass: this.t('facets.subclass'),
      target: this.t('facets.target'),
      common_ability_type: this.t('facets.common_ability_type'),
      treasure_type: this.t('facets.treasure_type'),
      perk_type: this.t('facets.perk_type'),
      chapter_num: this.t('facets.chapter_num'),
      culture_benefit_type: this.t('facets.culture_benefit_type'),
      dynamic_terrain_type: this.t('facets.dynamic_terrain_type'),
    };
  });

  constructor() {
    // Debounced search effect
    let searchTimeoutId: ReturnType<typeof setTimeout> | null = null;

    effect(() => {
      const query = this.searchQuery();

      if (searchTimeoutId) {
        clearTimeout(searchTimeoutId);
      }

      searchTimeoutId = setTimeout(() => {
        this.compendium.setSearchQuery(query);
      }, 150);
    });

    // Sync filters and search to URL query params
    let urlTimeoutId: ReturnType<typeof setTimeout> | null = null;

    effect(() => {
      const filters = this.compendium.activeFilters();
      const query = this.searchQuery();

      // Debounce URL updates to avoid too many history entries
      if (urlTimeoutId) {
        clearTimeout(urlTimeoutId);
      }

      urlTimeoutId = setTimeout(() => {
        this.syncFiltersToUrl(filters, query);
      }, 100);
    });
  }

  ngOnInit(): void {
    // Read initial filters from URL query params
    this.initFiltersFromUrl();

    void this.compendium.load();
  }

  /**
   * Parse URL query params and set initial filter state
   */
  private initFiltersFromUrl(): void {
    const params = this.route.snapshot.queryParamMap;
    const filters: ActiveFilters = {};

    // Parse search query
    const searchQuery = params.get('q');
    if (searchQuery) {
      this.searchQuery.set(searchQuery);
    }

    // Parse filter params
    for (const key of FILTER_PARAM_KEYS) {
      const values = params.getAll(key);
      if (values.length > 0) {
        filters[key] = values;
      }
    }

    // Apply filters if any were found
    if (Object.keys(filters).length > 0) {
      this.compendium.setFilters(filters);
    }
  }

  /**
   * Update URL query params to match current filter state
   */
  private syncFiltersToUrl(filters: ActiveFilters, query: string): void {
    if (this.isUpdatingUrl) return;
    this.isUpdatingUrl = true;

    const queryParams: Record<string, string | string[] | null> = {};

    // Add search query
    queryParams['q'] = query || null;

    // Add filter params
    for (const key of FILTER_PARAM_KEYS) {
      const values = filters[key];
      if (values && values.length > 0) {
        queryParams[key] = [...values];
      } else {
        queryParams[key] = null;
      }
    }

    void this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge',
        replaceUrl: true,
      })
      .finally(() => {
        this.isUpdatingUrl = false;
      });
  }

  protected onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.resultsComponent()?.resetLimit();
  }

  protected getFacetLabel(key: FacetKey | string): string {
    const labels = this.facetLabels();
    return labels[key as keyof typeof labels] ?? key;
  }

  protected toggleFilter(key: FacetKey, value: string): void {
    this.compendium.toggleFilter(key, value);
    this.resultsComponent()?.resetLimit();
  }

  protected removeFilter(key: FacetKey, value: string): void {
    this.compendium.removeFilter(key, value);
    this.resultsComponent()?.resetLimit();
  }

  protected clearAllFilters(): void {
    this.compendium.clearFilters();
    this.resultsComponent()?.resetLimit();
  }
}
