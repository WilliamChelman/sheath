import { Entity } from '../models/entity';
import { I18nService } from '@/i18n';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroDocument,
  heroPencil,
  heroTrash,
} from '@ng-icons/heroicons/outline';
import { compendiumBundle } from '../compendium.i18n';

@Component({
  selector: 'app-entity-detail-header',
  imports: [NgIcon],
  viewProviders: [provideIcons({ heroDocument, heroPencil, heroTrash })],
  template: `
    <div
      class="bg-linear-to-r from-primary/10 to-secondary/10 p-6 border-b border-base-300"
    >
      <div class="flex items-start gap-4">
        <!-- Image or Icon -->
        @if (entity().image) {
          <img
            [src]="entity().image"
            [alt]="entity().name"
            class="w-16 h-16 rounded-xl object-cover shrink-0"
          />
        } @else {
          <div
            class="shrink-0 w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center"
          >
            <ng-icon name="heroDocument" class="text-4xl text-primary" />
          </div>
        }
        <div class="flex-1 min-w-0">
          <h1
            class="text-3xl md:text-4xl font-black tracking-tight text-base-content"
          >
            {{ entity().name }}
          </h1>
          <div class="flex flex-wrap items-center gap-3 mt-3">
            <span class="badge badge-primary">{{ entity().type }}</span>
          </div>
        </div>
        <!-- Action Buttons -->
        @if (!isEditing()) {
          <div class="flex gap-2">
            <button
              class="btn btn-ghost btn-sm gap-2"
              (click)="editClick.emit()"
            >
              <ng-icon name="heroPencil" class="text-lg" />
              {{ t('edit.editButton') }}
            </button>
            <button
              class="btn btn-ghost btn-sm gap-2 text-error hover:bg-error/10"
              (click)="deleteClick.emit()"
            >
              <ng-icon name="heroTrash" class="text-lg" />
              {{ t('delete.button') }}
            </button>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityDetailHeaderComponent {
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.useBundleT(compendiumBundle);

  readonly entity = input.required<Entity>();
  readonly isEditing = input(false);

  readonly editClick = output<void>();
  readonly deleteClick = output<void>();
}
