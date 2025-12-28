import {
  Component,
  inject,
  input,
  output,
  type WritableSignal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretDown, phosphorCaretUp } from '@ng-icons/phosphor-icons/regular';
import { type EntityClassPropertyConfig } from '@/entity';
import { I18nService } from '@/i18n';
import {
  NumberInputComponent,
  TagInputComponent,
  TextInputComponent,
  ToggleComponent,
} from '@/ui/forms';
import { compendiumDetailBundle } from '../../compendium-detail.i18n';

export type FieldType = 'string' | 'number' | 'boolean' | 'multi-string';

export interface PropertyField {
  config: EntityClassPropertyConfig;
  fieldType: FieldType;
  stringSignal?: WritableSignal<string>;
  numberSignal?: WritableSignal<number | null>;
  booleanSignal?: WritableSignal<boolean>;
  arraySignal?: WritableSignal<string[]>;
}

@Component({
  selector: 'app-properties-panel',
  imports: [
    NgIcon,
    TextInputComponent,
    NumberInputComponent,
    ToggleComponent,
    TagInputComponent,
  ],
  viewProviders: [provideIcons({ phosphorCaretDown, phosphorCaretUp })],
  template: `
    <div class="properties-panel border-b border-base-300">
      <!-- Header (clickable to toggle) -->
      <button
        type="button"
        class="w-full flex items-center justify-between px-6 py-3 hover:bg-base-200/50 transition-colors"
        (click)="toggle()"
      >
        <span class="font-semibold text-sm text-base-content/70">
          {{ t('edit.propertiesSection') }}
        </span>
        <ng-icon
          [name]="expanded() ? 'phosphorCaretUp' : 'phosphorCaretDown'"
          class="text-base-content/50"
        />
      </button>

      <!-- Collapsible content -->
      @if (expanded()) {
        <div class="px-6 pb-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (field of fields(); track field.config.id) {
              @switch (field.fieldType) {
                @case ('number') {
                  <app-number-input
                    [label]="field.config.name"
                    [helperText]="field.config.description ?? null"
                    [(value)]="field.numberSignal!"
                  />
                }
                @case ('boolean') {
                  <app-toggle
                    [label]="field.config.name"
                    [(checked)]="field.booleanSignal!"
                  />
                }
                @case ('multi-string') {
                  <div class="md:col-span-2">
                    <app-tag-input
                      [label]="field.config.name"
                      [helperText]="field.config.description ?? null"
                      [(values)]="field.arraySignal!"
                    />
                  </div>
                }
                @default {
                  <app-text-input
                    [label]="field.config.name"
                    [helperText]="field.config.description ?? null"
                    [(value)]="field.stringSignal!"
                  />
                }
              }
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    app-properties-panel {
      display: block;
    }
  `,
})
export class PropertiesPanelComponent {
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.useBundleT(compendiumDetailBundle);

  fields = input.required<PropertyField[]>();
  expanded = input(true);
  expandedChange = output<void>();

  protected toggle(): void {
    this.expandedChange.emit();
  }
}
