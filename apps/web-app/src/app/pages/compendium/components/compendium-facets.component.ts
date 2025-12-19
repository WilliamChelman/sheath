import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroFunnel,
  heroChevronDown,
  heroChevronUp,
  heroMagnifyingGlass,
  heroXMark,
} from '@ng-icons/heroicons/outline';
import { BadgeComponent } from '@/ui/badge';
import { ButtonDirective } from '@/ui/button';
import type {
  ActiveFilters,
  FacetGroup,
  FacetKey,
  FacetOption,
} from '../models/compendium.model';

const FACET_COLLAPSE_THRESHOLD = 10;

@Component({
  selector: 'app-compendium-facets',
  standalone: true,
  imports: [NgIcon, BadgeComponent, ButtonDirective],
  viewProviders: [
    provideIcons({
      heroFunnel,
      heroChevronDown,
      heroChevronUp,
      heroMagnifyingGlass,
      heroXMark,
    }),
  ],
  template: `
    <aside class="w-full lg:w-72 shrink-0">
      <!-- Mobile Toggle -->
      <button
        type="button"
        appButton="ghost"
        class="lg:hidden w-full justify-between mb-2"
        (click)="toggleMobileFilters()"
      >
        <span class="flex items-center gap-2">
          <ng-icon name="heroFunnel" class="text-lg" />
          {{ filtersTitle() }}
        </span>
        <ng-icon
          [name]="showMobileFilters() ? 'heroChevronUp' : 'heroChevronDown'"
          class="text-lg"
        />
      </button>

      <!-- Facet Groups -->
      <div
        class="space-y-4"
        [class.hidden]="!showMobileFilters()"
        [class.lg:block]="true"
      >
        @for (facet of sortedFacets(); track facet.key) {
          <div
            class="bg-base-100/80 backdrop-blur-sm border border-base-300 rounded-xl p-4"
          >
            <h3
              class="font-semibold text-base-content mb-3 flex items-center gap-2"
            >
              {{ getFacetLabel(facet.key) }}
              @if (getActiveFilterCount(facet.key) > 0) {
                <app-badge color="primary" size="sm">
                  {{ getActiveFilterCount(facet.key) }}
                </app-badge>
              }
            </h3>
            @if (hasSearchBar(facet)) {
              <div class="relative mb-2">
                <ng-icon
                  name="heroMagnifyingGlass"
                  class="absolute left-2 top-1/2 -translate-y-1/2 text-base-content/40 text-sm"
                />
                <input
                  type="text"
                  class="input input-sm input-bordered w-full pl-7 pr-7 text-sm"
                  placeholder="Search..."
                  [value]="getFacetSearch(facet.key)"
                  (input)="updateFacetSearch(facet.key, $event)"
                />
                @if (getFacetSearch(facet.key)) {
                  <button
                    type="button"
                    class="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-base-200 transition-colors"
                    (click)="clearFacetSearch(facet.key)"
                  >
                    <ng-icon
                      name="heroXMark"
                      class="text-base-content/50 text-sm"
                    />
                  </button>
                }
              </div>
            }
            <div class="space-y-1 max-h-64 overflow-y-auto">
              @for (option of getVisibleOptions(facet); track option.value) {
                <label
                  class="flex items-center gap-2 p-2 rounded-lg hover:bg-base-200 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    class="checkbox checkbox-sm checkbox-primary"
                    [checked]="isFilterActive(facet.key, option.value)"
                    (change)="
                      toggleFilter.emit({ key: facet.key, value: option.value })
                    "
                  />
                  <span class="flex-1 text-sm truncate">
                    {{ option.label }}
                  </span>
                  <span class="text-xs text-base-content/50">
                    {{ option.count }}
                  </span>
                </label>
              }
              @if (
                getFilteredOptions(facet).length === 0 &&
                getFacetSearch(facet.key)
              ) {
                <p class="text-sm text-base-content/50 p-2 text-center">
                  No matches found
                </p>
              }
              @if (hasShowMoreButton(facet)) {
                <button
                  type="button"
                  appButton="ghost"
                  appButtonSize="xs"
                  class="w-full mt-2"
                  (click)="toggleExpandFacet(facet.key)"
                >
                  {{
                    expandedFacets()[facet.key]
                      ? 'Show less'
                      : 'Show all (' + getFilteredOptions(facet).length + ')'
                  }}
                </button>
              }
            </div>
          </div>
        }
      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompendiumFacetsComponent {
  readonly facets = input.required<readonly FacetGroup[]>();
  readonly activeFilters = input.required<ActiveFilters>();
  readonly facetLabels = input.required<Record<string, string>>();
  readonly filtersTitle = input<string>('Filters');
  /** Facet keys whose options should be sorted by label (numerically if possible) */
  readonly sortByLabelFacets = input<readonly FacetKey[]>([]);

  readonly toggleFilter = output<{ key: FacetKey; value: string }>();

  protected readonly showMobileFilters = signal(false);
  protected readonly expandedFacets = signal<Record<string, boolean>>({});
  protected readonly facetSearchQueries = signal<Record<string, string>>({});

  /** Facets with options sorted by label for specified facet keys */
  protected readonly sortedFacets = computed(() => {
    const facets = this.facets();
    const sortByLabel = new Set(this.sortByLabelFacets());

    return facets.map((facet) => {
      if (!sortByLabel.has(facet.key)) {
        return facet;
      }
      return {
        ...facet,
        options: this.sortOptionsByLabel(facet.options),
      };
    });
  });

  protected toggleMobileFilters(): void {
    this.showMobileFilters.update((v) => !v);
  }

  protected toggleExpandFacet(key: FacetKey): void {
    this.expandedFacets.update((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  protected getFacetLabel(key: FacetKey | string): string {
    return this.facetLabels()[key] ?? key;
  }

  protected getActiveFilterCount(key: FacetKey): number {
    const filters = this.activeFilters();
    return filters[key]?.length ?? 0;
  }

  protected isFilterActive(key: FacetKey, value: string): boolean {
    const filters = this.activeFilters();
    return filters[key]?.includes(value) ?? false;
  }

  protected hasSearchBar(facet: FacetGroup): boolean {
    return facet.options.length > FACET_COLLAPSE_THRESHOLD;
  }

  protected getFacetSearch(key: FacetKey): string {
    return this.facetSearchQueries()[key] ?? '';
  }

  protected updateFacetSearch(key: FacetKey, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.facetSearchQueries.update((current) => ({
      ...current,
      [key]: value,
    }));
  }

  protected clearFacetSearch(key: FacetKey): void {
    this.facetSearchQueries.update((current) => ({
      ...current,
      [key]: '',
    }));
  }

  protected getFilteredOptions(facet: FacetGroup): readonly FacetOption[] {
    const searchQuery = this.getFacetSearch(facet.key).toLowerCase().trim();
    if (!searchQuery) {
      return facet.options;
    }
    return facet.options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery),
    );
  }

  protected getVisibleOptions(facet: FacetGroup): readonly FacetOption[] {
    const filtered = this.getFilteredOptions(facet);
    const isExpanded = this.expandedFacets()[facet.key];
    const hasSearch = this.getFacetSearch(facet.key).trim().length > 0;

    // When searching, always show all filtered results
    if (hasSearch) {
      return filtered;
    }

    return isExpanded ? filtered : filtered.slice(0, FACET_COLLAPSE_THRESHOLD);
  }

  protected hasShowMoreButton(facet: FacetGroup): boolean {
    const filtered = this.getFilteredOptions(facet);
    const hasSearch = this.getFacetSearch(facet.key).trim().length > 0;

    // Hide show more button when actively searching
    if (hasSearch) {
      return false;
    }

    return filtered.length > FACET_COLLAPSE_THRESHOLD;
  }

  /**
   * Sorts facet options by label, using numeric comparison when labels are numbers
   */
  private sortOptionsByLabel(
    options: readonly FacetOption[],
  ): readonly FacetOption[] {
    return [...options].sort((a, b) => {
      const numA = parseFloat(a.label);
      const numB = parseFloat(b.label);

      // If both are valid numbers, sort numerically
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }

      // Otherwise, sort alphabetically
      return a.label.localeCompare(b.label, undefined, { numeric: true });
    });
  }
}
