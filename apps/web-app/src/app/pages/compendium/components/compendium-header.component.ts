import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PageTitleDirective } from '@/common/page-title';

@Component({
  selector: 'app-compendium-header',
  standalone: true,
  imports: [PageTitleDirective],
  template: `
    <div class="text-center mb-8">
      <h1
        appPageTitle
        class="text-4xl md:text-5xl font-black tracking-tight bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent"
      >
        {{ title() }}
      </h1>
      @if (isLoaded()) {
        <p class="text-base-content/60 mt-2">
          {{ subtitle() }}
        </p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompendiumHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly isLoaded = input<boolean>(false);
}

