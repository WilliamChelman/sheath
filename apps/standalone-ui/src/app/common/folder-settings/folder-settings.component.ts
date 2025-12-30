import { I18nService } from '@/i18n';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorFolder,
  phosphorFolderOpen,
} from '@ng-icons/phosphor-icons/regular';
import { FolderSettingsService } from '@/standalone-api';
import { FolderEntityInitializerService } from '../../services/folder-entity-initializer.service';
import { folderSettingsBundle } from './folder-settings.i18n';

@Component({
  selector: 'app-folder-settings',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorFolder, phosphorFolderOpen })],
  template: `
    @if (collapsed()) {
      <button
        class="btn btn-ghost btn-sm btn-square"
        [title]="t('changeFolder')"
        (click)="changeFolder()"
        [disabled]="isChanging()"
      >
        @if (isChanging()) {
          <span class="loading loading-spinner loading-xs"></span>
        } @else {
          <ng-icon name="phosphorFolder" class="text-lg" />
        }
      </button>
    } @else {
      <div class="dropdown dropdown-top dropdown-end flex-1">
        <button
          tabindex="0"
          role="button"
          class="btn btn-ghost btn-sm w-full justify-start gap-2 text-left"
        >
          <ng-icon name="phosphorFolder" class="text-lg shrink-0" />
          <span class="truncate flex-1 text-xs font-mono">{{
            folderName()
          }}</span>
        </button>
        <div
          tabindex="0"
          class="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-64"
        >
          <div class="px-2 py-1 text-xs text-base-content/70 mb-1">
            {{ t('currentFolder') }}
          </div>
          <div
            class="px-2 py-1 text-xs font-mono break-all text-base-content/90 mb-2"
          >
            {{ folderPath() }}
          </div>
          <button
            class="btn btn-sm btn-ghost justify-start gap-2"
            (click)="changeFolder()"
            [disabled]="isChanging()"
          >
            @if (isChanging()) {
              <span class="loading loading-spinner loading-xs"></span>
            } @else {
              <ng-icon name="phosphorFolderOpen" class="text-lg" />
            }
            {{ t('changeFolder') }}
          </button>
        </div>
      </div>
    }
  `,
})
export class FolderSettingsComponent {
  private readonly i18n = inject(I18nService);
  private readonly folderSettingsService = inject(FolderSettingsService);
  private readonly folderInitializer = inject(FolderEntityInitializerService);
  private readonly router = inject(Router);

  protected readonly t = this.i18n.useBundleT(folderSettingsBundle);

  collapsed = input(false);
  protected readonly isChanging = signal(false);

  protected readonly folderPath = this.folderSettingsService.folderPath;
  protected readonly folderName = computed(() => {
    const path = this.folderPath();
    if (!path) return '';
    // Extract last segment of path
    const parts = path.split(/[/\\]/);
    return parts[parts.length - 1] || path;
  });

  async changeFolder(): Promise<void> {
    this.isChanging.set(true);
    try {
      const newPath = await this.folderSettingsService.selectFolder();
      if (newPath) {
        // Reinitialize with new folder
        await this.folderInitializer.reinitialize();
        // Refresh current page
        this.router.navigate(['/']);
      }
    } finally {
      this.isChanging.set(false);
    }
  }
}
