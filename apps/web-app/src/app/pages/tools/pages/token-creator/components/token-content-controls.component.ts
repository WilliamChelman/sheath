import { Component, computed, effect, inject, input, model } from '@angular/core';
import { I18nService } from '@/i18n';
import { tokenContentControlsBundle } from './token-content-controls.i18n';
import {
  ButtonGroupComponent,
  TextareaComponent,
  TextInputComponent,
  ToggleComponent,
  type ButtonGroupOption,
} from '@/ui/forms';
import { CardComponent } from '@/ui/card';
import { ButtonDirective } from '@/ui/button';
import { NamePosition, TokenConfig } from '../models/token.model';
import { DEFAULT_TOKEN_CONFIG } from '../models/token.model';

@Component({
  selector: 'app-token-content-controls',
  imports: [
    TextareaComponent,
    TextInputComponent,
    ToggleComponent,
    ButtonGroupComponent,
    CardComponent,
    ButtonDirective,
  ],
  template: `
    <app-card bodyClass="gap-4">
      <!-- Header with title and reset button -->
      <div class="flex items-center justify-between">
        <h3 class="card-title text-sm">{{ t('title') }}</h3>
        <button
          appButton
          appButtonSize="xs"
          appButtonOutline
          (click)="resetToDefaults()"
          [title]="t('reset.title')"
        >
          {{ t('reset.label') }}
        </button>
      </div>

      <!-- Name Input -->
      <app-textarea
        data-tour="token-name-input"
        [label]="t('name.label')"
        [value]="config().name"
        (valueChange)="updateConfig({ name: $event })"
        [placeholder]="t('name.placeholder')"
        [helperText]="
          isBatchMode() ? t('name.batchHint') : t('name.hint')
        "
        [rows]="2"
      />

      <!-- Initials Input -->
      <app-text-input
        [label]="t('initials.label')"
        [helperText]="
          isBatchMode()
            ? t('initials.batchHelperText')
            : t('initials.helperText')
        "
        [value]="config().initials"
        (valueChange)="updateConfig({ initials: $event })"
        [maxLength]="3"
        [placeholder]="t('initials.placeholder')"
        [disabled]="isBatchMode()"
      />

      <!-- Toggle Options -->
      <app-toggle
        [label]="t('toggles.showInitials')"
        [checked]="config().showInitials"
        (checkedChange)="updateConfig({ showInitials: $event })"
      />

      <app-toggle
        [label]="t('toggles.showName')"
        [checked]="config().showName"
        (checkedChange)="updateConfig({ showName: $event })"
      />

      <app-toggle
        [label]="t('toggles.showMinionIcon')"
        [checked]="config().showMinionIcon"
        (checkedChange)="updateConfig({ showMinionIcon: $event })"
      />

      @if (config().showMinionIcon) {
        <app-button-group
          [label]="t('minionIconPosition.label')"
          [options]="minionIconPositions()"
          [value]="config().minionIconPosition"
          (valueChange)="updateMinionIconPosition($event)"
          [fullWidth]="true"
        />
      }

      @if (config().showName) {
        <app-button-group
          [label]="t('namePosition.label')"
          [options]="namePositions()"
          [value]="config().namePosition"
          (valueChange)="updateNamePosition($event)"
          [fullWidth]="true"
        />
      }
    </app-card>
  `,
})
export class TokenContentControlsComponent {
  private i18n = inject(I18nService);
  protected t = this.i18n.useBundleT(tokenContentControlsBundle);

  config = model<TokenConfig>(DEFAULT_TOKEN_CONFIG);
  isBatchMode = input(false);

  namePositions = computed<ButtonGroupOption<NamePosition>[]>(() => {
    this.i18n.locale();
    return [
      {
        value: 'top',
        label: this.t('options.namePositions.top'),
      },
      {
        value: 'bottom',
        label: this.t('options.namePositions.bottom'),
      },
      {
        value: 'bottom-flat',
        label: this.t('options.namePositions.bottomFlat'),
      },
    ];
  });

  minionIconPositions = computed(() => {
    this.i18n.locale();
    return [
      {
        value: 'top-left',
        label: this.t('options.minionIconPositions.topLeft'),
      },
      {
        value: 'top-right',
        label: this.t('options.minionIconPositions.topRight'),
      },
      {
        value: 'bottom-left',
        label: this.t('options.minionIconPositions.bottomLeft'),
      },
      {
        value: 'bottom-right',
        label: this.t('options.minionIconPositions.bottomRight'),
      },
    ];
  });

  private previousName = '';

  constructor() {
    // Auto-generate initials when name changes
    effect(() => {
      const currentName = this.config().name;
      if (currentName !== this.previousName) {
        this.previousName = currentName;
        const initials = this.generateInitials(currentName);
        if (initials !== this.config().initials) {
          this.updateConfig({ initials });
        }
      }
    });
  }

  updateConfig(partial: Partial<TokenConfig>) {
    this.config.update((current) => ({ ...current, ...partial }));
  }

  resetToDefaults(): void {
    this.config.set(DEFAULT_TOKEN_CONFIG);
  }

  private generateInitials(name: string): string {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  updateMinionIconPosition(value: unknown) {
    if (
      value === 'top-left' ||
      value === 'top-right' ||
      value === 'bottom-left' ||
      value === 'bottom-right'
    ) {
      this.updateConfig({ minionIconPosition: value });
    }
  }

  updateNamePosition(value: unknown) {
    if (value === 'top' || value === 'bottom' || value === 'bottom-flat') {
      this.updateConfig({ namePosition: value });
    }
  }
}
