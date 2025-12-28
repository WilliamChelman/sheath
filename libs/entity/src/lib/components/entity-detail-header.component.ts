import { I18nService } from '@/i18n';
import { PageTitleDirective } from '@/ui/page-title';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorPencilSimple, phosphorTrashSimple } from '@ng-icons/phosphor-icons/regular';
import { compendiumDetailBundle } from '../compendium-detail.i18n';
import { Entity } from '../models/entity';
import { DomainService } from '../services/domain.service';
import { FeatureFlagsService } from '../services/feature-flags.service';
import { EntityDisplayedPropertiesComponent } from './entity-displayed-properties.component';
import { EntityIconComponent } from './entity-icon.component';

@Component({
  selector: 'app-entity-detail-header',
  imports: [NgIcon, PageTitleDirective, EntityDisplayedPropertiesComponent, EntityIconComponent],
  viewProviders: [provideIcons({ phosphorPencilSimple, phosphorTrashSimple })],
  template: `
    <div
      class="bg-linear-to-r from-primary/10 to-secondary/10 p-6 border-b border-base-300"
    >
      <div class="flex items-start gap-4">
        <app-entity-icon [entity]="entity()" size="lg" containerClass="shrink-0" />
        <div class="flex-1 min-w-0">
          <h1
            appPageTitle
            class="text-3xl md:text-4xl font-black tracking-tight text-base-content"
          >
            {{ entity().name }}
          </h1>
          <div class="flex flex-wrap items-center gap-3 mt-3">
            <span class="badge badge-primary">{{ typeName() }}</span>
            <app-entity-displayed-properties [entity]="entity()" />
          </div>
        </div>
        <!-- Action Buttons -->
        @if (!isEditing()) {
          <div class="flex gap-2">
            @if (canEdit()) {
              <button
                class="btn btn-ghost btn-sm gap-2"
                (click)="editClick.emit()"
              >
                <ng-icon name="phosphorPencilSimple" class="text-lg" />
                {{ t('edit.editButton') }}
              </button>
            }
            @if (canDelete()) {
              <button
                class="btn btn-ghost btn-sm gap-2 text-error hover:bg-error/10"
                (click)="deleteClick.emit()"
              >
                <ng-icon name="phosphorTrashSimple" class="text-lg" />
                {{ t('delete.button') }}
              </button>
            }
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityDetailHeaderComponent {
  private readonly i18n = inject(I18nService);
  private readonly domainService = inject(DomainService);
  private readonly featureFlags = inject(FeatureFlagsService);
  protected readonly t = this.i18n.useBundleT(compendiumDetailBundle);

  protected readonly canEdit = this.featureFlags.canEditEntity;
  protected readonly canDelete = this.featureFlags.canDeleteEntity;

  readonly entity = input.required<Entity>();
  readonly isEditing = input(false);

  readonly editClick = output<void>();
  readonly deleteClick = output<void>();

  protected readonly typeName = computed(() => {
    const entityType = this.entity().type;
    const classConfig = this.domainService.allClassConfigs.find(
      (c) => c.id === entityType,
    );
    return classConfig?.name ?? entityType;
  });
}
