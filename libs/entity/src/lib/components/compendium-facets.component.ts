import { Entity } from '../models/entity';
import { EntityClassPropertyConfig } from '../models/entity-class-property-config';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { NumberFacetComponent } from './number-facet.component';
import { StringFacetComponent } from './string-facet.component';

export interface FacetValue {
  value: string;
  count: number;
}

export interface StringFacet {
  type: 'string';
  property: EntityClassPropertyConfig;
  values: FacetValue[];
}

export interface NumberFacet {
  type: 'number';
  property: EntityClassPropertyConfig;
  min: number;
  max: number;
  values: FacetValue[];
}

export type Facet = StringFacet | NumberFacet;

export interface NumberRangeSelection {
  min?: number;
  max?: number;
  exact?: number[];
}

export interface FacetSelections {
  strings: Record<string, string[]>;
  numbers: Record<string, NumberRangeSelection>;
}

@Component({
  selector: 'app-compendium-facets',
  imports: [StringFacetComponent, NumberFacetComponent],
  template: `
    @if (facets().length > 0) {
      <div class="space-y-3">
        @for (facet of facets(); track facet.property.id) {
          <div class="collapse collapse-arrow bg-base-200 rounded-lg">
            <input
              type="checkbox"
              [checked]="isExpanded(facet.property.id)"
              (change)="toggleExpanded(facet.property.id)"
            />
            <div class="collapse-title font-medium py-2 min-h-0">
              <span>{{ facet.property.name }}</span>
              @if (getSelectedCount(facet.property.id, facet.type) > 0) {
                <span class="badge badge-primary badge-sm ml-2">
                  {{ getSelectedCount(facet.property.id, facet.type) }}
                </span>
              }
            </div>
            <div class="collapse-content px-2 pb-2">
              @if (facet.type === 'string') {
                <app-string-facet
                  [facet]="facet"
                  [selectedValues]="getStringSelection(facet.property.id)"
                  (selectionChange)="
                    onStringSelectionChange(facet.property.id, $event)
                  "
                />
              } @else {
                <app-number-facet
                  [facet]="facet"
                  [selection]="getNumberSelection(facet.property.id)"
                  (selectionChange)="
                    onNumberSelectionChange(facet.property.id, $event)
                  "
                />
              }
            </div>
          </div>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompendiumFacetsComponent {
  readonly propertyConfigs = input.required<EntityClassPropertyConfig[]>();
  readonly entities = input.required<Entity[]>();
  readonly selections = model<FacetSelections>({ strings: {}, numbers: {} });

  private expandedFacets = new Set<string>();

  protected readonly facets = computed<Facet[]>(() => {
    const configs = this.propertyConfigs();
    const entities = this.entities();

    const facetableConfigs = configs.filter((config) => config.isFacet);

    return facetableConfigs
      .map((config): Facet | null => {
        const valueMap = new Map<string, number>();

        for (const entity of entities) {
          const entityRecord = entity as unknown as Record<string, unknown>;
          const value = entityRecord[config.id];

          if (value != null) {
            if (config.isMulti && Array.isArray(value)) {
              for (const v of value) {
                const strVal = String(v);
                valueMap.set(strVal, (valueMap.get(strVal) ?? 0) + 1);
              }
            } else {
              const strVal = String(value);
              valueMap.set(strVal, (valueMap.get(strVal) ?? 0) + 1);
            }
          }
        }

        if (valueMap.size === 0) return null;

        const values: FacetValue[] = Array.from(valueMap.entries())
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => {
            if (config.datatype === 'number') {
              return Number(a.value) - Number(b.value);
            }
            return a.value.localeCompare(b.value);
          });

        if (config.datatype === 'number') {
          const numValues = values.map((v) => Number(v.value));
          return {
            type: 'number',
            property: config,
            min: Math.min(...numValues),
            max: Math.max(...numValues),
            values,
          };
        }

        return {
          type: 'string',
          property: config,
          values,
        };
      })
      .filter((facet): facet is Facet => facet !== null);
  });

  protected isExpanded(propertyId: string): boolean {
    return this.expandedFacets.has(propertyId);
  }

  protected toggleExpanded(propertyId: string): void {
    if (this.expandedFacets.has(propertyId)) {
      this.expandedFacets.delete(propertyId);
    } else {
      this.expandedFacets.add(propertyId);
    }
  }

  protected getSelectedCount(
    propertyId: string,
    type: 'string' | 'number',
  ): number {
    const sel = this.selections();
    if (type === 'string') {
      return sel.strings[propertyId]?.length ?? 0;
    }
    const numSel = sel.numbers[propertyId];
    if (!numSel) return 0;
    let count = 0;
    if (numSel.min !== undefined) count++;
    if (numSel.max !== undefined) count++;
    count += numSel.exact?.length ?? 0;
    return count;
  }

  protected getStringSelection(propertyId: string): string[] {
    return this.selections().strings[propertyId] ?? [];
  }

  protected getNumberSelection(
    propertyId: string,
  ): NumberRangeSelection | undefined {
    return this.selections().numbers[propertyId];
  }

  protected onStringSelectionChange(
    propertyId: string,
    values: string[],
  ): void {
    const current = this.selections();
    const newStrings = { ...current.strings };

    if (values.length === 0) {
      delete newStrings[propertyId];
    } else {
      newStrings[propertyId] = values;
    }

    this.selections.set({ ...current, strings: newStrings });
  }

  protected onNumberSelectionChange(
    propertyId: string,
    selection: NumberRangeSelection | undefined,
  ): void {
    const current = this.selections();
    const newNumbers = { ...current.numbers };

    if (selection === undefined) {
      delete newNumbers[propertyId];
    } else {
      newNumbers[propertyId] = selection;
    }

    this.selections.set({ ...current, numbers: newNumbers });
  }
}
