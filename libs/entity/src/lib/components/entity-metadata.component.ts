import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCalendar } from '@ng-icons/phosphor-icons/regular';

@Component({
  selector: 'app-entity-metadata',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorCalendar })],
  template: `
    <div
      class="flex flex-wrap gap-4 text-sm text-base-content/50 px-6 pb-6"
    >
      <div class="flex items-center gap-1">
        <ng-icon name="phosphorCalendar" />
        <span>Created: {{ formatDate(createdAt()) }}</span>
      </div>
      <div class="flex items-center gap-1">
        <ng-icon name="phosphorCalendar" />
        <span>Updated: {{ formatDate(updatedAt()) }}</span>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityMetadataComponent {
  readonly createdAt = input.required<string>();
  readonly updatedAt = input.required<string>();

  protected formatDate(isoString: string): string {
    try {
      return new Date(isoString).toLocaleDateString();
    } catch {
      return isoString;
    }
  }
}
