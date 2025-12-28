import { I18nService } from '@/i18n';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorFunnel,
  phosphorX,
} from '@ng-icons/phosphor-icons/regular';
import { compendiumBundle } from '../compendium.i18n';
import { Entity } from '../models/entity';
import { EntityClassPropertyConfig } from '../models/entity-class-property-config';
import {
  CompendiumFacetsComponent,
  FacetSelections,
} from './compendium-facets.component';

@Component({
  selector: 'app-compendium-mobile-filters',
  imports: [NgIcon, CompendiumFacetsComponent],
  viewProviders: [provideIcons({ phosphorFunnel, phosphorX })],
  template: `
    <!-- Filter Button -->
    <button
      class="btn btn-outline gap-2"
      [class.btn-primary]="activeFilterCount() > 0"
      (click)="openDrawer()"
      [attr.aria-expanded]="isOpen()"
      aria-haspopup="dialog"
    >
      <ng-icon name="phosphorFunnel" class="text-lg" />
      <span>{{ t('showFilters') }}</span>
      @if (activeFilterCount() > 0) {
        <span class="badge badge-primary badge-sm">
          {{ activeFilterCount() }}
        </span>
      }
    </button>

    <!-- Drawer Backdrop -->
    @if (isOpen()) {
      <div
        class="fixed inset-0 bg-black/50 z-40 transition-opacity"
        (click)="closeDrawer()"
        [attr.aria-label]="t('mobileFilters.closeBackdrop')"
        role="button"
        tabindex="0"
        (keydown.enter)="closeDrawer()"
        (keydown.space)="closeDrawer()"
      ></div>
    }

    <!-- Drawer Panel -->
    <div
      class="fixed inset-y-0 right-0 w-80 max-w-full bg-base-100 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col"
      [class.translate-x-0]="isOpen()"
      [class.translate-x-full]="!isOpen()"
      role="dialog"
      [attr.aria-modal]="isOpen()"
      [attr.aria-label]="t('filters')"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-base-300">
        <h3 class="text-lg font-semibold" id="filters-dialog-title">{{ t('filters') }}</h3>
        <button
          class="btn btn-ghost btn-sm btn-circle"
          (click)="closeDrawer()"
          [attr.aria-label]="t('mobileFilters.closePanel')"
        >
          <ng-icon name="phosphorX" class="text-xl" />
        </button>
      </div>

      <!-- Facets Content -->
      <div class="flex-1 overflow-y-auto p-4">
        <app-compendium-facets
          [propertyConfigs]="propertyConfigs()"
          [entities]="entities()"
          [(selections)]="selections"
        />
      </div>

      <!-- Footer Actions -->
      <div class="p-4 border-t border-base-300 space-y-2">
        @if (activeFilterCount() > 0) {
          <button
            class="btn btn-ghost btn-block"
            (click)="handleClearFilters()"
          >
            {{ t('clearAllFilters') }}
          </button>
        }
        <button
          class="btn btn-primary btn-block"
          (click)="closeDrawer()"
        >
          {{ t('applyFilters') }}
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompendiumMobileFiltersComponent {
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.useBundleT(compendiumBundle);

  readonly propertyConfigs = input.required<EntityClassPropertyConfig[]>();
  readonly entities = input.required<Entity[]>();
  readonly selections = model<FacetSelections>({ strings: {}, numbers: {} });

  readonly clearFilters = output<void>();

  protected readonly isOpen = signal(false);

  protected readonly activeFilterCount = computed(() => {
    const sel = this.selections();
    let count = Object.keys(sel.strings).reduce(
      (acc, key) => acc + (sel.strings[key]?.length ?? 0),
      0
    );
    count += Object.keys(sel.numbers).reduce((acc, key) => {
      const numSel = sel.numbers[key];
      if (!numSel) return acc;
      let c = 0;
      if (numSel.min !== undefined) c++;
      if (numSel.max !== undefined) c++;
      c += numSel.exact?.length ?? 0;
      return acc + c;
    }, 0);
    return count;
  });

  protected openDrawer(): void {
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  protected closeDrawer(): void {
    this.isOpen.set(false);
    document.body.style.overflow = '';
  }

  protected handleClearFilters(): void {
    this.clearFilters.emit();
  }
}
