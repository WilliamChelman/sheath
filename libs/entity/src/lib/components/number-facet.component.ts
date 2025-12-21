import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { NumberFacet, NumberRangeSelection } from './compendium-facets.component';

@Component({
  selector: 'app-number-facet',
  template: `
    <div class="space-y-3">
      <!-- Range inputs -->
      <div class="flex items-center gap-2">
        <input
          type="number"
          class="input input-bordered input-sm w-20"
          [placeholder]="facet().min.toString()"
          [value]="selection()?.min ?? ''"
          (change)="setMin($event)"
        />
        <span class="text-sm text-base-content/60">to</span>
        <input
          type="number"
          class="input input-bordered input-sm w-20"
          [placeholder]="facet().max.toString()"
          [value]="selection()?.max ?? ''"
          (change)="setMax($event)"
        />
      </div>

      <!-- Exact value checkboxes (if reasonable number of values) -->
      @if (facet().values.length <= 20) {
        <div class="divider text-xs my-1">or select exact</div>
        <div class="max-h-32 overflow-y-auto space-y-1">
          @for (fv of facet().values; track fv.value) {
            <label
              class="flex items-center gap-2 px-2 py-1 rounded hover:bg-base-300 cursor-pointer"
            >
              <input
                type="checkbox"
                class="checkbox checkbox-sm checkbox-primary"
                [checked]="isExactSelected(fv.value)"
                (change)="toggleExact(fv.value)"
              />
              <span class="flex-1 text-sm">{{ fv.value }}</span>
              <span class="text-xs text-base-content/50">{{ fv.count }}</span>
            </label>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberFacetComponent {
  readonly facet = input.required<NumberFacet>();
  readonly selection = input<NumberRangeSelection | undefined>();
  readonly selectionChange = output<NumberRangeSelection | undefined>();

  protected setMin(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value ? Number(input.value) : undefined;
    this.updateSelection({ min: value });
  }

  protected setMax(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value ? Number(input.value) : undefined;
    this.updateSelection({ max: value });
  }

  protected isExactSelected(value: string): boolean {
    return this.selection()?.exact?.includes(Number(value)) ?? false;
  }

  protected toggleExact(value: string): void {
    const numValue = Number(value);
    const currentExact = this.selection()?.exact ?? [];

    let newExact: number[];
    if (currentExact.includes(numValue)) {
      newExact = currentExact.filter((v) => v !== numValue);
    } else {
      newExact = [...currentExact, numValue];
    }

    this.updateSelection({
      exact: newExact.length > 0 ? newExact : undefined,
    });
  }

  private updateSelection(updates: Partial<NumberRangeSelection>): void {
    const current = this.selection() ?? {};

    const newSel: NumberRangeSelection = {
      ...current,
      ...updates,
    };

    // Clean up undefined values
    if (newSel.min === undefined) delete newSel.min;
    if (newSel.max === undefined) delete newSel.max;
    if (!newSel.exact || newSel.exact.length === 0) delete newSel.exact;

    // Emit undefined if empty, otherwise the selection
    if (Object.keys(newSel).length === 0) {
      this.selectionChange.emit(undefined);
    } else {
      this.selectionChange.emit(newSel);
    }
  }
}
