import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorFileText, phosphorFolderOpen } from '@ng-icons/phosphor-icons/regular';

@Component({
  selector: 'app-compendium-empty-state',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorFileText, phosphorFolderOpen })],
  template: `
    <div class="flex flex-col items-center justify-center py-16">
      <ng-icon [name]="icon()" class="text-6xl text-base-content/30 mb-4" />
      <p class="text-lg text-base-content/60 text-center max-w-md">
        {{ title() }}
      </p>
      @if (description()) {
        <p class="text-sm text-base-content/40 text-center max-w-md">
          {{ description() }}
        </p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompendiumEmptyStateComponent {
  readonly icon = input<string>('phosphorFileText');
  readonly title = input.required<string>();
  readonly description = input<string>();
}
