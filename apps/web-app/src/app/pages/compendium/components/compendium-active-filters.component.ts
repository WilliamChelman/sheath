import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroXMark } from '@ng-icons/heroicons/outline';
import { BadgeDirective } from '@/ui/badge';
import type { FacetKey } from '../models/compendium.model';

export interface FilterChip {
  key: FacetKey;
  value: string;
  label: string;
}

@Component({
  selector: 'app-compendium-active-filters',
  standalone: true,
  imports: [NgIcon, BadgeDirective],
  viewProviders: [provideIcons({ heroXMark })],
  template: `
    @if (chips().length > 0) {
      <div class="flex flex-wrap gap-2 mb-6">
        @for (chip of chips(); track chip.key + chip.value) {
          <button
            type="button"
            appBadge="primary"
            class="gap-1 cursor-pointer hover:badge-error transition-colors"
            (click)="removeFilter.emit({ key: chip.key, value: chip.value })"
          >
            {{ chip.label }}
            <ng-icon name="heroXMark" class="text-sm" />
          </button>
        }
        <button
          type="button"
          appBadge="neutral"
          appBadgeVariant="ghost"
          class="gap-1 cursor-pointer hover:badge-error transition-colors"
          (click)="clearAll.emit()"
        >
          {{ clearAllLabel() }}
          <ng-icon name="heroXMark" class="text-sm" />
        </button>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompendiumActiveFiltersComponent {
  readonly chips = input.required<FilterChip[]>();
  readonly clearAllLabel = input<string>('Clear all');

  readonly removeFilter = output<{ key: FacetKey; value: string }>();
  readonly clearAll = output<void>();
}
