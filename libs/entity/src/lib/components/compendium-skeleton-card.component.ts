import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-compendium-skeleton-card',
  template: `
    <div
      class="card bg-base-100 shadow-md animate-pulse"
      [style.animation-delay]="delay() + 'ms'"
    >
      <div class="card-body">
        <div class="flex items-start gap-3">
          <!-- Icon skeleton -->
          <div class="skeleton w-10 h-10 rounded-lg shrink-0"></div>
          <div class="flex-1 min-w-0 space-y-2">
            <!-- Title skeleton -->
            <div class="skeleton h-5 w-3/4"></div>
            <!-- Type skeleton -->
            <div class="skeleton h-4 w-1/3"></div>
          </div>
        </div>

        <!-- Properties skeleton -->
        <div class="mt-3 flex gap-2">
          <div class="skeleton h-6 w-16 rounded-full"></div>
          <div class="skeleton h-6 w-20 rounded-full"></div>
        </div>

        <!-- Description skeleton -->
        <div class="mt-3 space-y-2">
          <div class="skeleton h-3 w-full"></div>
          <div class="skeleton h-3 w-4/5"></div>
        </div>

        <!-- Tags skeleton -->
        <div class="mt-3 flex gap-1">
          <div class="skeleton h-5 w-12 rounded"></div>
          <div class="skeleton h-5 w-14 rounded"></div>
          <div class="skeleton h-5 w-10 rounded"></div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompendiumSkeletonCardComponent {
  readonly delay = input(0);
}
