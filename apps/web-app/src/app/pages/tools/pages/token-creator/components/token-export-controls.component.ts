import { Component, effect, inject, input, model, signal } from '@angular/core';
import { I18nService } from '@/i18n';
import { tokenCreatorBundle } from '../token-creator.i18n';
import { SelectComponent, type SelectOption } from '@/ui/forms';
import { CardComponent } from '@/ui/card';
import { ButtonDirective } from '@/ui/button';
import {
  BatchToken,
  EXPORT_FORMATS,
  ExportFormat,
  TokenConfig,
} from '../models/token.model';
import { DEFAULT_TOKEN_CONFIG } from '../models/token.model';

const TOKEN_CREATOR_EXPORT_FORMAT_STORAGE_KEY =
  'sheath.token-creator.v1.exportFormat';

@Component({
  selector: 'app-token-export-controls',
  imports: [SelectComponent, CardComponent, ButtonDirective],
  template: `
    <app-card bodyClass="gap-4">
      <h3 class="card-title text-sm">{{ t('export.title') }}</h3>

      <app-select
        [label]="t('export.format.label')"
        [options]="exportFormatOptions"
        [(value)]="exportFormat"
        size="sm"
      />

      @if (isBatchMode()) {
        <button
          appButton="primary"
          class="w-full"
          appButtonSize="sm"
          [disabled]="isExportingBatch()"
          (click)="onBatchExport()"
        >
          @if (isExportingBatch()) {
            <span class="loading loading-spinner loading-sm"></span>
            {{ t('batch.exporting') }}
          } @else {
            {{ t('batch.exportButton', { count: batchTokens().length }) }}
          }
        </button>
      } @else {
        <button
          appButton="primary"
          class="w-full"
          appButtonSize="sm"
          (click)="onExport()"
        >
          {{ t('export.download', { format: exportFormat().toUpperCase() }) }}
        </button>
      }
    </app-card>
  `,
})
export class TokenExportControlsComponent {
  private i18n = inject(I18nService);
  protected t = this.i18n.useBundleT(tokenCreatorBundle);

  config = model<TokenConfig>(DEFAULT_TOKEN_CONFIG);
  exportFormat = signal<ExportFormat>('png');
  onExportRequest = model<{ format: ExportFormat } | null>(null);

  // Batch export (tokens parsed from name field in parent)
  batchTokens = input<BatchToken[]>([]);
  isBatchMode = input(false);
  isExportingBatch = model(false);
  batchExportRequest = model<{
    format: ExportFormat;
    tokens: BatchToken[];
  } | null>(null);

  exportFormatOptions: SelectOption<ExportFormat>[] = EXPORT_FORMATS;

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
  }

  onExport() {
    this.onExportRequest.set({ format: this.exportFormat() });
  }

  onBatchExport() {
    const tokens = this.batchTokens();
    if (tokens.length > 0) {
      this.batchExportRequest.set({
        format: this.exportFormat(),
        tokens,
      });
    }
  }

  private readPersistedExportFormat(): ExportFormat | null {
    if (!this.isStorageAvailable()) return null;

    try {
      const raw = sessionStorage.getItem(
        TOKEN_CREATOR_EXPORT_FORMAT_STORAGE_KEY,
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
      sessionStorage.setItem(TOKEN_CREATOR_EXPORT_FORMAT_STORAGE_KEY, value);
    } catch {
      // Ignore quota/security errors.
    }
  }

  private isStorageAvailable(): boolean {
    try {
      return typeof sessionStorage !== 'undefined';
    } catch {
      return false;
    }
  }
}
