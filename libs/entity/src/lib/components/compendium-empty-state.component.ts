import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorFileText,
  phosphorFolderOpen,
  phosphorMagnifyingGlass,
  phosphorFunnel,
} from '@ng-icons/phosphor-icons/regular';

@Component({
  selector: 'app-compendium-empty-state',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      phosphorFileText,
      phosphorFolderOpen,
      phosphorMagnifyingGlass,
      phosphorFunnel,
    }),
  ],
  template: `
    <div
      class="flex flex-col items-center justify-center py-16 px-4 animate-fade-in"
    >
      <!-- Icon with decorative background -->
      <div class="relative mb-6">
        <div
          class="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150"
        ></div>
        <div
          class="relative w-24 h-24 rounded-full bg-base-200 flex items-center justify-center"
        >
          <ng-icon
            [name]="icon()"
            class="text-5xl text-base-content/40"
          />
        </div>
      </div>

      <!-- Title -->
      <h3 class="text-xl font-semibold text-base-content mb-2 text-center">
        {{ title() }}
      </h3>

      <!-- Description -->
      @if (description()) {
        <p class="text-base-content/60 text-center max-w-sm mb-6">
          {{ description() }}
        </p>
      }

      <!-- Action buttons -->
      @if (showClearFilters()) {
        <button
          class="btn btn-primary btn-outline gap-2"
          (click)="clearFiltersClick.emit()"
        >
          <ng-icon name="phosphorFunnel" class="text-lg" />
          {{ clearFiltersLabel() }}
        </button>
      }
    </div>
  `,
  styles: `
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-in {
      animation: fade-in 0.3s ease-out;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompendiumEmptyStateComponent {
  readonly icon = input<string>('phosphorFileText');
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly showClearFilters = input(false);
  readonly clearFiltersLabel = input('Clear filters');

  readonly clearFiltersClick = output<void>();
}
