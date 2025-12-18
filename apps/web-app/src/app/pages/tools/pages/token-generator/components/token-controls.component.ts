import {
  Component,
  computed,
  effect,
  inject,
  model,
  signal,
} from '@angular/core';
import { I18nService } from '@/i18n';
import { tokenGeneratorBundle } from '../token-generator.i18n';
import {
  BackgroundImage,
  BorderWidth,
  DEFAULT_BACKGROUND_IMAGE_SETTINGS,
  DEFAULT_TOKEN_CONFIG,
  EXPORT_FORMATS,
  ExportFormat,
  NamePosition,
  TokenConfig,
  TokenSize,
} from '../models/token.model';
import {
  ButtonGroupComponent,
  ColorPickerComponent,
  FileInputComponent,
  RangeInputComponent,
  SelectComponent,
  TextInputComponent,
  ToggleComponent,
  type ButtonGroupOption,
  type SelectOption,
} from '@/ui/forms';
import { CardComponent } from '@/ui/card';

const TOKEN_GENERATOR_EXPORT_FORMAT_STORAGE_KEY =
  'sheath.token-generator.v1.exportFormat';

@Component({
  selector: 'app-token-controls',
  imports: [
    TextInputComponent,
    SelectComponent,
    ColorPickerComponent,
    ToggleComponent,
    ButtonGroupComponent,
    FileInputComponent,
    RangeInputComponent,
    CardComponent,
  ],
  template: `
    <app-card
      [title]="t('controls.title')"
      titleClass="text-lg"
      bodyClass="gap-4"
    >
      <!-- Name Input -->
      <app-text-input
        [label]="t('controls.name.label')"
        [value]="config().name"
        (valueChange)="updateConfig({ name: $event })"
        [placeholder]="t('controls.name.placeholder')"
      />

      <!-- Initials Input -->
      <app-text-input
        [label]="t('controls.initials.label')"
        [helperText]="t('controls.initials.helperText')"
        [value]="config().initials"
        (valueChange)="updateConfig({ initials: $event })"
        [maxLength]="3"
        [placeholder]="t('controls.initials.placeholder')"
      />

      <!-- Colors -->
      <div class="grid grid-cols-2 gap-4">
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

      <!-- Toggle Options -->
      <app-toggle
        [label]="t('controls.toggles.showInitials')"
        [checked]="config().showInitials"
        (checkedChange)="updateConfig({ showInitials: $event })"
      />

      <app-toggle
        [label]="t('controls.toggles.showName')"
        [checked]="config().showName"
        (checkedChange)="updateConfig({ showName: $event })"
      />

      @if (config().showName) {
        <app-button-group
          [label]="t('controls.namePosition.label')"
          [options]="namePositions()"
          [value]="config().namePosition"
          (valueChange)="updateConfig({ namePosition: $event })"
          [fullWidth]="true"
        />
      }

      <div class="divider my-0"></div>

      <!-- Background Image Section -->
      <h3 class="font-semibold">
        {{ t('backgroundImage.title') }}
      </h3>

      <app-file-input
        id="token-bg-upload"
        [label]="t('backgroundImage.upload.label')"
        accept="image/*"
        size="sm"
        (fileSelected)="onBackgroundImageSelected($event)"
      />

      @if (config().backgroundImage) {
        <div class="flex flex-col gap-3">
          <!-- Opacity Slider -->
          <app-range-input
            id="token-bg-opacity"
            [label]="t('backgroundImage.opacity.label')"
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
              class="btn btn-sm btn-outline flex-1"
              (click)="resetImagePosition()"
              [title]="t('backgroundImage.actions.resetTitle')"
            >
              {{ t('backgroundImage.actions.reset') }}
            </button>
            <button
              class="btn btn-sm btn-error btn-outline flex-1"
              (click)="removeImage()"
              [title]="t('backgroundImage.actions.removeTitle')"
            >
              {{ t('backgroundImage.actions.remove') }}
            </button>
          </div>

          <p class="text-xs text-base-content/50">
            {{ t('backgroundImage.hint') }}
          </p>
        </div>
      }

      <div class="divider my-0"></div>

      <!-- Export Section -->
      <h3 class="font-semibold">{{ t('export.title') }}</h3>

      <app-select
        [label]="t('export.format.label')"
        [options]="exportFormatOptions"
        [(value)]="exportFormat"
      />

      <button class="btn btn-primary w-full" (click)="onExport()">
        {{ t('export.download', { format: exportFormat().toUpperCase() }) }}
      </button>
    </app-card>
  `,
})
export class TokenControlsComponent {
  private i18n = inject(I18nService);
  protected t = this.i18n.useBundleT(tokenGeneratorBundle);

  config = model<TokenConfig>(DEFAULT_TOKEN_CONFIG);
  exportFormat = signal<ExportFormat>('png');
  onExportRequest = model<{ format: ExportFormat } | null>(null);

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
    ];
  });

  exportFormatOptions: SelectOption<ExportFormat>[] = EXPORT_FORMATS;

  private previousName = '';

  constructor() {
    // Restore persisted export format (independent from TokenConfig).
    const restored = this.readPersistedExportFormat();
    if (restored) {
      this.exportFormat.set(restored);
    }

    // Persist export format changes.
    effect(() => {
      this.writePersistedExportFormat(this.exportFormat());
    });

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

  onExport() {
    this.onExportRequest.set({ format: this.exportFormat() });
  }

  private readPersistedExportFormat(): ExportFormat | null {
    if (!this.isStorageAvailable()) return null;

    try {
      const raw = localStorage.getItem(
        TOKEN_GENERATOR_EXPORT_FORMAT_STORAGE_KEY,
      );
      if (raw === 'svg' || raw === 'png' || raw === 'jpg' || raw === 'webp')
        return raw;
      return null;
    } catch {
      return null;
    }
  }

  private writePersistedExportFormat(value: ExportFormat): void {
    if (!this.isStorageAvailable()) return;

    try {
      localStorage.setItem(TOKEN_GENERATOR_EXPORT_FORMAT_STORAGE_KEY, value);
    } catch {
      // Ignore quota/security errors.
    }
  }

  private isStorageAvailable(): boolean {
    try {
      return typeof localStorage !== 'undefined';
    } catch {
      return false;
    }
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
    };
    reader.readAsDataURL(file);
  }

  protected opacityFormatter = (opacity: number) =>
    `${Math.round(opacity * 100)}%`;

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
}
