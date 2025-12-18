import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { I18nService } from '@/i18n';
import { TokenControlsComponent } from './components/token-controls.component';
import { TokenPreviewComponent } from './components/token-preview.component';
import { tokenGeneratorBundle } from './token-generator.i18n';
import { CardComponent } from '@/ui/card';
import {
  BackgroundImage,
  DEFAULT_TOKEN_CONFIG,
  TokenConfig,
} from './models/token.model';
import { TokenExportService } from './services/token-export.service';

type PersistedTokenConfig = Pick<
  TokenConfig,
  | 'backgroundColor'
  | 'borderColor'
  | 'size'
  | 'borderWidth'
  | 'showInitials'
  | 'showName'
  | 'namePosition'
>;

const TOKEN_GENERATOR_CONFIG_STORAGE_KEY = 'sheath.token-generator.v1.config';

@Component({
  selector: 'app-token-generator-view',
  imports: [TokenPreviewComponent, TokenControlsComponent, CardComponent],
  template: `
    <div class="container mx-auto max-w-6xl px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="badge badge-primary badge-outline mb-4 gap-2">
          <span>🎨</span> {{ t('header.badge') }}
        </div>
        <h1 class="text-3xl md:text-4xl font-bold mb-3">
          {{ t('header.title') }}
        </h1>
        <p class="text-base-content/60 max-w-xl mx-auto">
          {{ t('header.subtitle') }}
        </p>
      </div>

      <!-- Main Content -->
      <div class="grid lg:grid-cols-5 gap-8">
        <!-- Preview Panel -->
        <div class="lg:col-span-3">
          <app-card
            [fullHeight]="true"
            bodyClass="items-center justify-center min-h-[400px]"
          >
            <div class="mb-4 text-sm text-base-content/50">
              {{ t('preview.livePreview') }}
            </div>

            <!-- Checkered background for transparency preview -->
            <div
              class="flex items-center justify-center p-8 rounded-xl"
              style="background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
                       linear-gradient(-45deg, #ccc 25%, transparent 25%),
                       linear-gradient(45deg, transparent 75%, #ccc 75%),
                       linear-gradient(-45deg, transparent 75%, #ccc 75%);
                       background-size: 20px 20px;
                       background-position: 0 0, 0 10px, 10px -10px, -10px 0px;"
            >
              <div #previewContainer>
                <app-token-preview
                  [config]="tokenConfig()"
                  (backgroundImageChange)="onBackgroundImageChange($event)"
                />
              </div>
            </div>

            <!-- Size indicator -->
            <div class="mt-4 text-sm text-base-content/50">
              {{
                t('preview.sizeIndicator', {
                  sizeLabel: sizeLabel(),
                  sizePx: getSizePx(tokenConfig().size),
                })
              }}
            </div>
          </app-card>
        </div>

        <!-- Controls Panel -->
        <div class="lg:col-span-2">
          <app-token-controls
            [(config)]="tokenConfig"
            [(onExportRequest)]="exportRequest"
          />
        </div>
      </div>

      <!-- Tips Section -->
      <app-card variant="soft" class="mt-8">
        <h3 class="font-semibold flex items-center gap-2">
          <span>💡</span> {{ t('tips.title') }}
        </h3>
        <ul class="text-sm text-base-content/70 space-y-1">
          <li>• {{ t('tips.items.png') }}</li>
          <li>• {{ t('tips.items.svg') }}</li>
          <li>• {{ t('tips.items.webp') }}</li>
          <li>• {{ t('tips.items.resolution') }}</li>
        </ul>
      </app-card>
    </div>
  `,
})
export class TokenGeneratorView {
  private exportService = inject(TokenExportService);
  private i18n = inject(I18nService);
  protected t = this.i18n.useBundleT(tokenGeneratorBundle);

  tokenConfig = signal<TokenConfig>(DEFAULT_TOKEN_CONFIG);
  exportRequest = signal<{ format: 'svg' | 'png' | 'jpg' | 'webp' } | null>(
    null,
  );

  previewContainer = viewChild<ElementRef<HTMLDivElement>>('previewContainer');

  sizeLabel = computed(() => {
    // Ensure this recomputes on locale changes.
    this.i18n.locale();
    const size = this.tokenConfig().size;
    return this.t(`options.sizes.${size}` as const);
  });

  private sizePxMap: Record<string, number> = {
    small: 50,
    medium: 100,
    large: 150,
    huge: 200,
  };

  constructor() {
    // Restore persisted config (colors, sizes, toggles, etc.) on startup.
    const restored = this.readPersistedTokenConfig();
    if (restored) {
      this.tokenConfig.set({
        ...DEFAULT_TOKEN_CONFIG,
        ...restored,
      });
    }

    // Persist a small subset of config as it changes.
    effect(() => {
      const cfg = this.tokenConfig();
      this.writePersistedTokenConfig({
        backgroundColor: cfg.backgroundColor,
        borderColor: cfg.borderColor,
        size: cfg.size,
        borderWidth: cfg.borderWidth,
        showInitials: cfg.showInitials,
        showName: cfg.showName,
        namePosition: cfg.namePosition,
      });
    });

    effect(() => {
      const request = this.exportRequest();
      if (request) {
        this.handleExport(request.format);
        this.exportRequest.set(null);
      }
    });
  }

  getSizePx(size: string): number {
    return this.sizePxMap[size] || 100;
  }

  onBackgroundImageChange(backgroundImage: BackgroundImage): void {
    this.tokenConfig.update((current) => ({
      ...current,
      backgroundImage,
    }));
  }

  private readPersistedTokenConfig(): PersistedTokenConfig | null {
    if (!this.isStorageAvailable()) return null;

    try {
      const raw = localStorage.getItem(TOKEN_GENERATOR_CONFIG_STORAGE_KEY);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;

      const obj = parsed as Partial<PersistedTokenConfig>;
      const result: Partial<PersistedTokenConfig> = {};

      if (typeof obj.backgroundColor === 'string')
        result.backgroundColor = obj.backgroundColor;
      if (typeof obj.borderColor === 'string')
        result.borderColor = obj.borderColor;

      if (
        obj.size === 'small' ||
        obj.size === 'medium' ||
        obj.size === 'large' ||
        obj.size === 'huge'
      ) {
        result.size = obj.size;
      }

      if (
        obj.borderWidth === 'none' ||
        obj.borderWidth === 'thin' ||
        obj.borderWidth === 'medium' ||
        obj.borderWidth === 'thick'
      ) {
        result.borderWidth = obj.borderWidth;
      }

      if (typeof obj.showInitials === 'boolean')
        result.showInitials = obj.showInitials;
      if (typeof obj.showName === 'boolean') result.showName = obj.showName;

      if (obj.namePosition === 'top' || obj.namePosition === 'bottom') {
        result.namePosition = obj.namePosition;
      }

      return Object.keys(result).length
        ? (result as PersistedTokenConfig)
        : null;
    } catch {
      return null;
    }
  }

  private writePersistedTokenConfig(value: PersistedTokenConfig): void {
    if (!this.isStorageAvailable()) return;

    try {
      localStorage.setItem(
        TOKEN_GENERATOR_CONFIG_STORAGE_KEY,
        JSON.stringify(value),
      );
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

  private async handleExport(
    format: 'svg' | 'png' | 'jpg' | 'webp',
  ): Promise<void> {
    const container = this.previewContainer();
    if (!container) return;

    const svgElement = container.nativeElement.querySelector('svg');
    if (!svgElement) return;

    try {
      await this.exportService.exportToken(
        svgElement,
        this.tokenConfig(),
        format,
      );
    } catch (error) {
      console.error('Export failed:', error);
    }
  }
}
