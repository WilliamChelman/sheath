import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FolderEntityService, FolderSettingsService } from '@/standalone-api';

@Injectable({ providedIn: 'root' })
export class FolderEntityInitializerService {
  private readonly folderSettings = inject(FolderSettingsService);
  private readonly folderEntityService = inject(FolderEntityService);
  private readonly router = inject(Router);

  /**
   * Initialize the entity service from the configured folder.
   * Returns true if initialization succeeds, false if redirect is needed.
   */
  async init(): Promise<boolean> {
    // Check if folder path is configured
    if (!this.folderSettings.hasFolderPath()) {
      await this.router.navigate(['/select-folder']);
      return false;
    }

    try {
      await this.folderEntityService.initialize();
      return true;
    } catch (error) {
      console.error('Failed to initialize entity service:', error);
      // Clear invalid folder path and redirect to selection
      this.folderSettings.clearFolderPath();
      await this.router.navigate(['/select-folder']);
      return false;
    }
  }

  /**
   * Reinitialize after folder change
   */
  async reinitialize(): Promise<void> {
    await this.folderEntityService.reload();
  }
}
