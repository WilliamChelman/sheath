import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface SortOption {
  label: string;
  value: string; // Format: "sortBy:direction" (e.g., "name:asc", "score:desc", "propertyId:asc")
}

@Component({
  selector: 'app-compendium-sort-widget',
  imports: [FormsModule],
  template: `
    <select
      class="select select-bordered w-full sm:w-auto sm:min-w-48"
      [(ngModel)]="selectedSort"
    >
      @for (option of availableSortOptions(); track option.value) {
        <option [value]="option.value">{{ option.label }}</option>
      }
    </select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompendiumSortWidgetComponent {
  readonly availableSortOptions = input.required<SortOption[]>();
  readonly selectedSort = model<string>('');
}
