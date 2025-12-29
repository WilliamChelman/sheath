import { computed, Injectable, signal } from '@angular/core';

const FOLDER_PATH_KEY = 'sheath.entity-folder.path';

@Injectable({ providedIn: 'root' })
export class FolderSettingsService {
  private readonly _folderPath = signal<string | null>(this.loadFromStorage());

  readonly folderPath = this._folderPath.asReadonly();
  readonly hasFolderPath = computed(() => this._folderPath() !== null);

  private loadFromStorage(): string | null {
    try {
      return localStorage.getItem(FOLDER_PATH_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Open Tauri folder picker dialog and save the selected path
   */
  async selectFolder(): Promise<string | null> {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Select Entity Folder',
    });

    if (selected && typeof selected === 'string') {
      this.setFolderPath(selected);
      return selected;
    }

    return null;
  }

  /**
   * Set and persist the folder path
   */
  setFolderPath(path: string): void {
    try {
      localStorage.setItem(FOLDER_PATH_KEY, path);
    } catch {
      // Ignore storage errors
    }
    this._folderPath.set(path);
  }

  /**
   * Clear the saved folder path
   */
  clearFolderPath(): void {
    try {
      localStorage.removeItem(FOLDER_PATH_KEY);
    } catch {
      // Ignore storage errors
    }
    this._folderPath.set(null);
  }
}
