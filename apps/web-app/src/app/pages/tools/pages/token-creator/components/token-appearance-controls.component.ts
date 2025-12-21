import { Component, computed, inject, model } from '@angular/core';
import { I18nService } from '@/i18n';
import { tokenCreatorBundle } from '../token-creator.i18n';
import {
  ButtonGroupComponent,
  ColorPickerComponent,
  type ButtonGroupOption,
} from '@/ui/forms';
import { CardComponent } from '@/ui/card';
import {
  BorderStyle,
  BorderWidth,
  ShadowIntensity,
  TextShadowIntensity,
  TextSize,
  TokenConfig,
  TokenSize,
} from '../models/token.model';
import { DEFAULT_TOKEN_CONFIG } from '../models/token.model';

@Component({
  selector: 'app-token-appearance-controls',
  imports: [ColorPickerComponent, ButtonGroupComponent, CardComponent],
  template: `
    <app-card bodyClass="gap-4">
      <h3 class="card-title text-sm">{{ t('appearance.title') }}</h3>

      <!-- Colors -->
      <div class="grid grid-cols-3 gap-2">
        <app-color-picker
          [label]="t('controls.colors.background')"
          [value]="config().backgroundColor"
          (valueChange)="updateConfig({ backgroundColor: $event })"
        />
        <app-color-picker
          [label]="t('controls.colors.border')"
          [value]="config().borderColor"
          (valueChange)="updateConfig({ borderColor: $event })"
        />
        <app-color-picker
          [label]="t('controls.colors.text')"
          [value]="config().textColor"
          (valueChange)="updateConfig({ textColor: $event })"
        />
      </div>

      <!-- Size Selection -->
      <app-button-group
        [label]="t('controls.size.label')"
        [options]="sizes()"
        [value]="config().size"
        (valueChange)="updateConfig({ size: $event })"
      />

      <!-- Border Width -->
      <app-button-group
        [label]="t('controls.borderWidth.label')"
        [options]="borderWidths()"
        [value]="config().borderWidth"
        (valueChange)="updateConfig({ borderWidth: $event })"
        [fullWidth]="true"
      />

      <!-- Shadow Intensity -->
      <app-button-group
        [label]="t('controls.shadowIntensity.label')"
        [options]="shadowIntensities()"
        [value]="config().shadowIntensity"
        (valueChange)="updateConfig({ shadowIntensity: $event })"
      />

      <!-- Border Style -->
      <app-button-group
        [label]="t('controls.borderStyle.label')"
        [options]="borderStyles()"
        [value]="config().borderStyle"
        (valueChange)="updateConfig({ borderStyle: $event })"
        [fullWidth]="true"
      />

      <!-- Text Settings Section -->
      <div class="divider text-xs text-base-content/50 my-1">
        {{ t('controls.textSettings.label') }}
      </div>

      <!-- Initials Size -->
      <app-button-group
        [label]="t('controls.initialsSize.label')"
        [options]="textSizes()"
        [value]="config().initialsSize"
        (valueChange)="updateConfig({ initialsSize: $event })"
      />

      <!-- Name Size -->
      <app-button-group
        [label]="t('controls.nameSize.label')"
        [options]="textSizes()"
        [value]="config().nameSize"
        (valueChange)="updateConfig({ nameSize: $event })"
      />

      <!-- Text Shadow Intensity -->
      <app-button-group
        [label]="t('controls.textShadowIntensity.label')"
        [options]="textShadowIntensities()"
        [value]="config().textShadowIntensity"
        (valueChange)="updateConfig({ textShadowIntensity: $event })"
      />
    </app-card>
  `,
})
export class TokenAppearanceControlsComponent {
  private i18n = inject(I18nService);
  protected t = this.i18n.useBundleT(tokenCreatorBundle);

  config = model<TokenConfig>(DEFAULT_TOKEN_CONFIG);

  sizes = computed<ButtonGroupOption<TokenSize>[]>(() => {
    this.i18n.locale();
    return [
      {
        value: 'small',
        label: this.t('options.sizes.small'),
      },
      {
        value: 'medium',
        label: this.t('options.sizes.medium'),
      },
      {
        value: 'large',
        label: this.t('options.sizes.large'),
      },
      {
        value: 'huge',
        label: this.t('options.sizes.huge'),
      },
    ];
  });

  borderWidths = computed<ButtonGroupOption<BorderWidth>[]>(() => {
    this.i18n.locale();
    return [
      {
        value: 'none',
        label: this.t('options.borderWidths.none'),
      },
      {
        value: 'thin',
        label: this.t('options.borderWidths.thin'),
      },
      {
        value: 'medium',
        label: this.t('options.borderWidths.medium'),
      },
      {
        value: 'thick',
        label: this.t('options.borderWidths.thick'),
      },
    ];
  });

  shadowIntensities = computed<ButtonGroupOption<ShadowIntensity>[]>(() => {
    this.i18n.locale();
    return [
      {
        value: 'none',
        label: this.t('options.shadowIntensities.none'),
      },
      {
        value: 'subtle',
        label: this.t('options.shadowIntensities.subtle'),
      },
      {
        value: 'medium',
        label: this.t('options.shadowIntensities.medium'),
      },
      {
        value: 'strong',
        label: this.t('options.shadowIntensities.strong'),
      },
      {
        value: 'dramatic',
        label: this.t('options.shadowIntensities.dramatic'),
      },
    ];
  });

  borderStyles = computed<ButtonGroupOption<BorderStyle>[]>(() => {
    this.i18n.locale();
    return [
      {
        value: 'solid',
        label: this.t('options.borderStyles.solid'),
      },
      {
        value: 'metallic',
        label: this.t('options.borderStyles.metallic'),
      },
    ];
  });

  textSizes = computed<ButtonGroupOption<TextSize>[]>(() => {
    this.i18n.locale();
    return [
      {
        value: 'small',
        label: this.t('options.textSizes.small'),
      },
      {
        value: 'medium',
        label: this.t('options.textSizes.medium'),
      },
      {
        value: 'large',
        label: this.t('options.textSizes.large'),
      },
      {
        value: 'extra-large',
        label: this.t('options.textSizes.extraLarge'),
      },
    ];
  });

  textShadowIntensities = computed<ButtonGroupOption<TextShadowIntensity>[]>(() => {
    this.i18n.locale();
    return [
      {
        value: 'none',
        label: this.t('options.textShadowIntensities.none'),
      },
      {
        value: 'subtle',
        label: this.t('options.textShadowIntensities.subtle'),
      },
      {
        value: 'medium',
        label: this.t('options.textShadowIntensities.medium'),
      },
      {
        value: 'strong',
        label: this.t('options.textShadowIntensities.strong'),
      },
    ];
  });

  updateConfig(partial: Partial<TokenConfig>) {
    this.config.update((current) => ({ ...current, ...partial }));
  }
}
