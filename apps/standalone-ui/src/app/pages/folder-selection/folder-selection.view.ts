import { I18nService } from '@/i18n';
import { CardComponent } from '@/ui/card';
import { PageTitleDirective } from '@/ui/page-title';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroFolderOpen, heroArrowRight } from '@ng-icons/heroicons/outline';
import { FolderSettingsService } from '../../services/folder-settings.service';
import { folderSelectionBundle } from './folder-selection.i18n';

@Component({
  selector: 'app-folder-selection-view',
  imports: [CardComponent, PageTitleDirective, NgIcon],
  viewProviders: [provideIcons({ heroFolderOpen, heroArrowRight })],
  template: `
    <span class="sr-only" appPageTitle>{{ t('pageTitle') }}</span>
    <div
      class="min-h-screen flex items-center justify-center p-6 bg-base-200/50"
    >
      <app-card bodyClass="items-center text-center gap-6 max-w-lg">
        <div
          class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
        >
          <ng-icon
            name="heroFolderOpen"
            class="text-4xl text-primary"
          ></ng-icon>
        </div>

        <div class="flex flex-col gap-2">
          <h1 class="text-2xl font-bold">{{ t('title') }}</h1>
          <p class="text-base-content/70">{{ t('description') }}</p>
        </div>

        @if (folderPath()) {
          <div class="w-full bg-base-200 rounded-lg p-4">
            <p class="text-sm text-base-content/70 mb-1">
              {{ t('currentFolder') }}
            </p>
            <p class="font-mono text-sm break-all">{{ folderPath() }}</p>
          </div>
        }

        <div class="flex flex-col gap-3 w-full">
          <button
            class="btn btn-primary btn-lg w-full"
            (click)="selectFolder()"
            [disabled]="isSelecting()"
          >
            @if (isSelecting()) {
              <span class="loading loading-spinner loading-sm"></span>
            }
            {{ t('selectButton') }}
          </button>

          @if (folderPath()) {
            <button
              class="btn btn-ghost btn-lg w-full gap-2"
              (click)="continue()"
            >
              {{ t('continueButton') }}
              <ng-icon name="heroArrowRight" class="text-lg"></ng-icon>
            </button>
          }
        </div>

        <p class="text-xs text-base-content/50 mt-2">{{ t('hint') }}</p>
      </app-card>
    </div>
  `,
})
export class FolderSelectionView {
  private readonly i18n = inject(I18nService);
  private readonly folderSettings = inject(FolderSettingsService);
  private readonly router = inject(Router);

  protected readonly t = this.i18n.useBundleT(folderSelectionBundle);
  protected readonly folderPath = this.folderSettings.folderPath;
  protected readonly isSelecting = signal(false);

  async selectFolder(): Promise<void> {
    this.isSelecting.set(true);
    try {
      await this.folderSettings.selectFolder();
    } finally {
      this.isSelecting.set(false);
    }
  }

  continue(): void {
    this.router.navigate(['/']);
  }
}
