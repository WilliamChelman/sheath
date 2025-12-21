import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorMagnifyingGlass } from '@ng-icons/phosphor-icons/regular';

@Component({
  selector: 'app-compendium-search-bar',
  imports: [NgIcon, FormsModule],
  viewProviders: [provideIcons({ phosphorMagnifyingGlass })],
  template: `
    <div class="flex flex-col sm:flex-row gap-4 flex-1">
      <!-- Search -->
      <label class="input input-bordered flex-1">
        <ng-icon name="phosphorMagnifyingGlass" />
        <input
          type="text"
          class="grow"
          [placeholder]="searchPlaceholder()"
          [(ngModel)]="searchQuery"
        />
      </label>

      <!-- Type Filter -->
      <select
        class="select select-bordered w-full sm:w-48"
        [(ngModel)]="selectedType"
      >
        <option value="">{{ allTypesLabel() }}</option>
        @for (type of entityTypes(); track type.id) {
          <option [value]="type.id">{{ type.name }}</option>
        }
      </select>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompendiumSearchBarComponent {
  readonly searchPlaceholder = input.required<string>();
  readonly allTypesLabel = input.required<string>();
  readonly entityTypes = input.required<{ id: string; name: string }[]>();

  readonly searchQuery = model('');
  readonly selectedType = model('');
}
