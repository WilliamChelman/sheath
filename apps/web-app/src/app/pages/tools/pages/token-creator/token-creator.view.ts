import { I18nService } from '@/i18n';
import { BadgeComponent } from '@/ui/badge';
import { CardComponent } from '@/ui/card';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { PageTitleDirective } from '../../../../common/page-title/page-title.directive';
import { TokenAppearanceControlsComponent } from './components/token-appearance-controls.component';
import { TokenBackgroundControlsComponent } from './components/token-background-controls.component';
import { TokenContentControlsComponent } from './components/token-content-controls.component';
import { TokenExportControlsComponent } from './components/token-export-controls.component';
import { TokenPreviewComponent } from './components/token-preview.component';
import {
  BackgroundImage,
  BatchToken,
  DEFAULT_TOKEN_CONFIG,
  ExportFormat,
  TokenConfig,
} from './models/token.model';
import { TokenExportService } from './services/token-export.service';
import { tokenCreatorBundle } from './token-creator.i18n';

type PersistedTokenConfig = Pick<
  TokenConfig,
  | 'backgroundColor'
  | 'borderColor'
  | 'size'
  | 'borderWidth'
  | 'shadowIntensity'
  | 'borderStyle'
  | 'showInitials'
  | 'showName'
  | 'showMinionIcon'
  | 'minionIconPosition'
  | 'namePosition'
>;

const TOKEN_CREATOR_CONFIG_STORAGE_KEY = 'sheath.token-creator.v1.config';

@Component({
  selector: 'app-token-creator-view',
  imports: [
    TokenPreviewComponent,
    TokenContentControlsComponent,
    TokenAppearanceControlsComponent,
    TokenBackgroundControlsComponent,
    TokenExportControlsComponent,
    CardComponent,
    PageTitleDirective,
    BadgeComponent,
  ],
  template: `
    <div class="container mx-auto max-w-6xl px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <app-badge color="primary" variant="outline" class="mb-4 gap-2">
          <span>🎨</span> {{ t('header.badge') }}
        </app-badge>
        <h1 appPageTitle class="text-3xl md:text-4xl font-bold mb-3">
          {{ t('header.title') }}
        </h1>
        <p class="text-base-content/60 max-w-xl mx-auto">
          {{ t('header.subtitle') }}
        </p>
      </div>

      <!-- Main Content -->
      <div class="grid lg:grid-cols-5 gap-4">
        <!-- Preview Panel -->
        <div class="lg:col-span-2">
          <app-card bodyClass="items-center justify-center">
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

        <!-- Controls Panels (2x2 Grid) -->
        <div class="lg:col-span-3 grid grid-cols-2 gap-4">
          <!-- Panel 1: Token Content -->
          <app-token-content-controls [(config)]="tokenConfig" />

          <!-- Panel 2: Appearance -->
          <app-token-appearance-controls [(config)]="tokenConfig" />

          <!-- Panel 3: Background Image -->
          <app-token-background-controls
            [(config)]="tokenConfig"
            (backgroundImageChange)="onBackgroundImageChange($event)"
          />

          <!-- Panel 4: Export -->
          <app-token-export-controls
            [(config)]="tokenConfig"
            [(onExportRequest)]="exportRequest"
            [(batchExportRequest)]="batchExportRequest"
            [(isExportingBatch)]="isExportingBatch"
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
          <li>
            • {{ t('tips.items.inspiration') }}
            <div class="mt-2 ml-4 text-xs space-y-1">
              <div>
                <a
                  href="https://www.reddit.com/user/Max_Hamm/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link link-primary"
                >
                  Max_Hamm's Profile
                </a>
              </div>
              <div>
                <a
                  href="https://www.reddit.com/r/drawsteel/comments/1oty323/drawing_draw_steel_tokens_weeks_1_and_2/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link link-primary"
                >
                  Weeks 1-2 Tokens
                </a>
              </div>
              <div>
                <a
                  href="https://www.reddit.com/r/drawsteel/comments/1p5vew9/drawing_steel_weeks_3_and_4/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link link-primary"
                >
                  Weeks 3-4 Tokens
                </a>
              </div>
              <div>
                <a
                  href="https://www.reddit.com/r/drawsteel/comments/1phtf1y/drawing_steel_weeks_5_and_6/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link link-primary"
                >
                  Weeks 5-6 Tokens
                </a>
              </div>
            </div>
          </li>
        </ul>
      </app-card>
    </div>
  `,
})
export class TokenCreatorView {
  private exportService = inject(TokenExportService);
  private i18n = inject(I18nService);
  protected t = this.i18n.useBundleT(tokenCreatorBundle);

  tokenConfig = signal<TokenConfig>(DEFAULT_TOKEN_CONFIG);
  exportRequest = signal<{ format: 'svg' | 'png' | 'jpg' | 'webp' } | null>(
    null,
  );
  batchExportRequest = signal<{
    format: ExportFormat;
    tokens: BatchToken[];
  } | null>(null);
  isExportingBatch = signal(false);

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
        shadowIntensity: cfg.shadowIntensity,
        borderStyle: cfg.borderStyle,
        showInitials: cfg.showInitials,
        showName: cfg.showName,
        showMinionIcon: cfg.showMinionIcon,
        minionIconPosition: cfg.minionIconPosition,
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

    effect(() => {
      const request = this.batchExportRequest();
      if (request && !this.isExportingBatch()) {
        this.handleBatchExport(request);
        this.batchExportRequest.set(null);
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
      const raw = localStorage.getItem(TOKEN_CREATOR_CONFIG_STORAGE_KEY);
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
      if (typeof obj.showMinionIcon === 'boolean')
        result.showMinionIcon = obj.showMinionIcon;

      if (
        obj.minionIconPosition === 'top-left' ||
        obj.minionIconPosition === 'top-right' ||
        obj.minionIconPosition === 'bottom-left' ||
        obj.minionIconPosition === 'bottom-right'
      ) {
        result.minionIconPosition = obj.minionIconPosition;
      }

      if (
        obj.namePosition === 'top' ||
        obj.namePosition === 'bottom' ||
        obj.namePosition === 'bottom-flat'
      ) {
        result.namePosition = obj.namePosition;
      }

      if (
        obj.shadowIntensity === 'none' ||
        obj.shadowIntensity === 'subtle' ||
        obj.shadowIntensity === 'medium' ||
        obj.shadowIntensity === 'strong' ||
        obj.shadowIntensity === 'dramatic'
      ) {
        result.shadowIntensity = obj.shadowIntensity;
      }

      if (obj.borderStyle === 'solid' || obj.borderStyle === 'metallic') {
        result.borderStyle = obj.borderStyle;
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
        TOKEN_CREATOR_CONFIG_STORAGE_KEY,
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

  private async handleBatchExport(request: {
    format: ExportFormat;
    tokens: BatchToken[];
  }): Promise<void> {
    const container = this.previewContainer();
    if (!container) return;

    this.isExportingBatch.set(true);
    const originalConfig = this.tokenConfig();

    try {
      await this.exportService.exportBatch(
        () => container.nativeElement.querySelector('svg'),
        originalConfig,
        request.tokens,
        request.format,
        (config) => this.tokenConfig.set(config),
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );
    } catch (error) {
      console.error('Batch export failed:', error);
    } finally {
      this.tokenConfig.set(originalConfig);
      this.isExportingBatch.set(false);
    }
  }
}
