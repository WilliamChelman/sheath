import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { StringFacet } from './compendium-facets.component';

@Component({
  selector: 'app-string-facet',
  template: `
    <div class="max-h-48 overflow-y-auto space-y-1">
      @for (fv of facet().values; track fv.value) {
        <label
          class="flex items-center gap-2 px-2 py-1 rounded hover:bg-base-300 cursor-pointer"
        >
          <input
            type="checkbox"
            class="checkbox checkbox-sm checkbox-primary"
            [checked]="isSelected(fv.value)"
            (change)="toggleSelection(fv.value)"
          />
          <span class="flex-1 text-sm truncate">{{ fv.value }}</span>
          <span class="text-xs text-base-content/50">{{ fv.count }}</span>
        </label>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StringFacetComponent {
  readonly facet = input.required<StringFacet>();
  readonly selectedValues = input<string[]>([]);
  readonly selectionChange = output<string[]>();

  protected isSelected(value: string): boolean {
    return this.selectedValues().includes(value);
  }

  protected toggleSelection(value: string): void {
    const current = this.selectedValues();
    let newValues: string[];

    if (current.includes(value)) {
      newValues = current.filter((v) => v !== value);
    } else {
      newValues = [...current, value];
    }

    this.selectionChange.emit(newValues);
  }
}
