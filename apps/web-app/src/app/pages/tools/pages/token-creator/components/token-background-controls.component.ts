import { Component, inject, model, output } from '@angular/core';
import { I18nService } from '@/i18n';
import { tokenBackgroundControlsBundle } from './token-background-controls.i18n';
import {
  FileInputComponent,
  RangeInputComponent,
} from '@/ui/forms';
import { CardComponent } from '@/ui/card';
import { ButtonDirective } from '@/ui/button';
import {
  BackgroundImage,
  DEFAULT_BACKGROUND_IMAGE_SETTINGS,
  TokenConfig,
} from '../models/token.model';
import { DEFAULT_TOKEN_CONFIG } from '../models/token.model';

@Component({
  selector: 'app-token-background-controls',
  imports: [
    FileInputComponent,
    RangeInputComponent,
    CardComponent,
    ButtonDirective,
  ],
  template: `
    <app-card bodyClass="gap-4">
      <h3 class="card-title text-sm">{{ t('title') }}</h3>

      <app-file-input
        id="token-bg-upload"
        [label]="t('upload.label')"
        accept="image/*"
        size="sm"
        (fileSelected)="onBackgroundImageSelected($event)"
      />

      @if (config().backgroundImage) {
        <div class="flex flex-col gap-3">
          <!-- Opacity Slider -->
          <app-range-input
            id="token-bg-opacity"
            [label]="t('opacity.label')"
            [min]="0"
            [max]="1"
            [step]="0.05"
            size="sm"
            [value]="config().backgroundImage!.opacity"
            (valueChange)="onOpacityChange($event)"
            [valueFormatter]="opacityFormatter"
          />

          <!-- Image action buttons -->
          <div class="flex gap-2">
            <button
              appButton
              appButtonSize="sm"
              appButtonOutline
              class="flex-1"
              (click)="resetImagePosition()"
              [title]="t('actions.resetTitle')"
            >
              {{ t('actions.reset') }}
            </button>
            <button
              appButton="error"
              appButtonSize="sm"
              appButtonOutline
              class="flex-1"
              (click)="removeImage()"
              [title]="t('actions.removeTitle')"
            >
              {{ t('actions.remove') }}
            </button>
          </div>

          <p class="text-xs text-base-content/50">
            {{ t('hint') }}
          </p>
        </div>
      }
    </app-card>
  `,
})
export class TokenBackgroundControlsComponent {
  private i18n = inject(I18nService);
  protected t = this.i18n.useBundleT(tokenBackgroundControlsBundle);

  config = model<TokenConfig>(DEFAULT_TOKEN_CONFIG);
  backgroundImageChange = output<BackgroundImage>();

  protected opacityFormatter = (opacity: number) =>
    `${Math.round(opacity * 100)}%`;

  onBackgroundImageSelected(file: File | null): void {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const backgroundImage: BackgroundImage = {
        dataUrl,
        ...DEFAULT_BACKGROUND_IMAGE_SETTINGS,
      };
      this.updateConfig({ backgroundImage });
      this.backgroundImageChange.emit(backgroundImage);
    };
    reader.readAsDataURL(file);
  }

  onOpacityChange(opacity: number): void {
    const current = this.config().backgroundImage;
    if (current) {
      this.updateConfig({
        backgroundImage: { ...current, opacity },
      });
    }
  }

  resetImagePosition(): void {
    const current = this.config().backgroundImage;
    if (current) {
      this.updateConfig({
        backgroundImage: {
          ...current,
          panX: DEFAULT_BACKGROUND_IMAGE_SETTINGS.panX,
          panY: DEFAULT_BACKGROUND_IMAGE_SETTINGS.panY,
          zoom: DEFAULT_BACKGROUND_IMAGE_SETTINGS.zoom,
        },
      });
    }
  }

  removeImage(): void {
    this.updateConfig({ backgroundImage: undefined });
  }

  private updateConfig(partial: Partial<TokenConfig>) {
    this.config.update((current) => ({ ...current, ...partial }));
  }
}
