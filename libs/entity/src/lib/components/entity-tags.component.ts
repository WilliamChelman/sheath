import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroTag } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-entity-tags',
  imports: [NgIcon],
  viewProviders: [provideIcons({ heroTag })],
  template: `
    <div class="px-6 pt-4 flex items-center gap-2">
      <ng-icon name="heroTag" class="text-base-content/50" />
      <div class="flex flex-wrap gap-2">
        @for (tag of tags(); track tag) {
          <span class="badge badge-outline badge-sm">{{ tag }}</span>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityTagsComponent {
  readonly tags = input.required<string[]>();
}
