import { I18nService } from '@/i18n';
import { BadgeComponent } from '@/ui/badge';
import { CardComponent } from '@/ui/card';
import { TourService } from '@/ui/tour';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroQuestionMarkCircle } from '@ng-icons/heroicons/outline';
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
import { TOKEN_CREATOR_TOUR_CONFIG } from './tour/token-creator-tour.config';

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
  | 'textColor'
  | 'initialsSize'
  | 'nameSize'
  | 'textShadowIntensity'
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
    NgIcon,
  ],
  viewProviders: [provideIcons({ heroQuestionMarkCircle })],
  template: `
    <div class="container mx-auto max-w-6xl px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="flex justify-center items-center gap-3 mb-4">
          <app-badge color="primary" variant="outline" class="gap-2">
            <span>🎨</span> {{ t('header.badge') }}
          </app-badge>
          <button
            class="btn btn-ghost btn-circle btn-sm"
            (click)="startTour()"
            [title]="t('header.helpTitle')"
          >
            <ng-icon name="heroQuestionMarkCircle" class="text-xl" />
          </button>
        </div>
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
        <div class="lg:col-span-2" data-tour="token-preview">
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
                  [config]="previewConfig()"
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
          <app-token-content-controls
            data-tour="token-content"
            [(config)]="tokenConfig"
            [isBatchMode]="isBatchMode()"
          />

          <!-- Panel 2: Appearance -->
          <app-token-appearance-controls
            data-tour="token-appearance"
            [(config)]="tokenConfig"
          />

          <!-- Panel 3: Background Image -->
          <app-token-background-controls
            data-tour="token-background"
            [(config)]="tokenConfig"
            (backgroundImageChange)="onBackgroundImageChange($event)"
          />

          <!-- Panel 4: Export -->
          <app-token-export-controls
            data-tour="token-export"
            [(config)]="tokenConfig"
            [(onExportRequest)]="exportRequest"
            [(batchExportRequest)]="batchExportRequest"
            [(isExportingBatch)]="isExportingBatch"
            [isBatchMode]="isBatchMode()"
            [batchTokens]="batchTokens()"
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
  private tourService = inject(TourService);
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

  // Batch mode: detect comma-separated or newline-separated values in the name field
  isBatchMode = computed(() => {
    const name = this.tokenConfig().name;
    return /[,\n]/.test(name) && name.split(/[,\n]/).filter((s) => s.trim()).length > 1;
  });

  batchTokens = computed<BatchToken[]>(() => {
    if (!this.isBatchMode()) return [];
    return this.tokenConfig()
      .name.split(/[,\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => {
        // Check for minion suffix (!)
        const isMinion = s.endsWith('!');
        let token = isMinion ? s.slice(0, -1).trim() : s;

        // Check for custom initials suffix (@XX)
        let customInitials: string | null = null;
        const atIndex = token.lastIndexOf('@');
        if (atIndex > 0) {
          customInitials = token.slice(atIndex + 1).trim().toUpperCase();
          token = token.slice(0, atIndex).trim();
        }

        const name = token;
        const initials = customInitials || this.generateInitials(name);
        return { name, initials, isMinion };
      });
  });

  // In batch mode, use the first token for preview
  previewConfig = computed<TokenConfig>(() => {
    const config = this.tokenConfig();
    const tokens = this.batchTokens();
    if (tokens.length > 0) {
      const first = tokens[0];
      return {
        ...config,
        name: first.name,
        initials: first.initials,
        showMinionIcon: first.isMinion || config.showMinionIcon,
      };
    }
    return config;
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
        textColor: cfg.textColor,
        initialsSize: cfg.initialsSize,
        nameSize: cfg.nameSize,
        textShadowIntensity: cfg.textShadowIntensity,
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

  onBackgroundImageChange(backgroundImage: BackgroundImage): void {
    this.tokenConfig.update((current) => ({
      ...current,
      backgroundImage,
    }));
  }

  startTour(): void {
    this.tourService.start(TOKEN_CREATOR_TOUR_CONFIG);
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

      if (typeof obj.textColor === 'string') {
        result.textColor = obj.textColor;
      }

      if (
        obj.initialsSize === 'small' ||
        obj.initialsSize === 'medium' ||
        obj.initialsSize === 'large' ||
        obj.initialsSize === 'extra-large'
      ) {
        result.initialsSize = obj.initialsSize;
      }

      if (
        obj.nameSize === 'small' ||
        obj.nameSize === 'medium' ||
        obj.nameSize === 'large' ||
        obj.nameSize === 'extra-large'
      ) {
        result.nameSize = obj.nameSize;
      }

      if (
        obj.textShadowIntensity === 'none' ||
        obj.textShadowIntensity === 'subtle' ||
        obj.textShadowIntensity === 'medium' ||
        obj.textShadowIntensity === 'strong'
      ) {
        result.textShadowIntensity = obj.textShadowIntensity;
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
