import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroDocument } from '@ng-icons/heroicons/outline';
import { Entity } from '@/entity';

@Component({
  selector: 'app-compendium-entity-card',
  imports: [NgIcon, RouterLink],
  viewProviders: [provideIcons({ heroDocument })],
  template: `
    <a
      class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      [routerLink]="[entity().id]"
    >
      <div class="card-body">
        <div class="flex items-start gap-3">
          @if (entity().image) {
            <img
              [src]="entity().image"
              [alt]="entity().name"
              class="w-12 h-12 rounded-lg object-cover"
            />
          } @else {
            <div
              class="w-12 h-12 rounded-lg bg-base-200 flex items-center justify-center"
            >
              <ng-icon
                name="heroDocument"
                class="text-2xl text-base-content/40"
              />
            </div>
          }
          <div class="flex-1 min-w-0">
            <h3 class="card-title text-base truncate">
              {{ entity().name }}
            </h3>
            <p class="text-sm text-base-content/60">
              {{ typeName() }}
            </p>
          </div>
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
}
