import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroMagnifyingGlass } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-compendium-search-bar',
  imports: [NgIcon, FormsModule],
  viewProviders: [provideIcons({ heroMagnifyingGlass })],
  template: `
    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <!-- Search -->
      <div class="flex-1 relative">
        <ng-icon
          name="heroMagnifyingGlass"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
        />
        <input
          type="text"
          class="input input-bordered w-full pl-10"
          [placeholder]="searchPlaceholder()"
          [(ngModel)]="searchQuery"
        />
      </div>

      <!-- Type Filter -->
      <select class="select select-bordered w-full sm:w-48" [(ngModel)]="selectedType">
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
