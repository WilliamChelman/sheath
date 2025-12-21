import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Entity } from '../models/entity';
import { EntityDisplayedPropertiesComponent } from './entity-displayed-properties.component';
import { EntityIconComponent } from './entity-icon.component';

@Component({
  selector: 'app-compendium-entity-card',
  imports: [
    RouterLink,
    EntityDisplayedPropertiesComponent,
    EntityIconComponent,
  ],
  template: `
    <a
      class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      [routerLink]="[entity().id]"
      [queryParams]="queryParams()"
    >
      <div class="card-body">
        <div class="flex items-start gap-3">
          <app-entity-icon [entity]="entity()" size="sm" />
          <div class="flex-1 min-w-0">
            <h3 class="card-title text-base truncate">
              {{ entity().name }}
            </h3>
            <p class="text-sm text-base-content/60">
              {{ typeName() }}
            </p>
          </div>
        </div>

        <div class="mt-2">
          <app-entity-displayed-properties [entity]="entity()" />
        </div>

        @if (entity().description) {
          <p class="text-sm text-base-content/70 mt-2 line-clamp-2">
            {{ entity().description }}
          </p>
        }

        @if (entity().tags && entity().tags!.length > 0) {
          <div class="flex flex-wrap gap-1 mt-2">
            @for (tag of entity().tags!.slice(0, 3); track tag) {
              <span class="badge badge-sm badge-outline">
                {{ tag }}
              </span>
            }
            @if (entity().tags!.length > 3) {
              <span class="badge badge-sm badge-ghost">
                +{{ entity().tags!.length - 3 }}
              </span>
            }
          </div>
        }
      </div>
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompendiumEntityCardComponent {
  readonly entity = input.required<Entity>();
  readonly typeName = input.required<string>();
  readonly searchQuery = input('');

  protected readonly queryParams = computed(() => {
    const q = this.searchQuery().trim();
    return q ? { q } : {};
  });
}
