import { Injectable, signal } from '@angular/core';

export type EditorMode = 'live-preview' | 'split-view';

interface EditorPreferences {
  mode: EditorMode;
  tocVisible: boolean;
  propertiesExpanded: boolean;
}

const STORAGE_KEY = 'sheath.editor-preferences';

const DEFAULT_PREFERENCES: EditorPreferences = {
  mode: 'split-view',
  tocVisible: true,
  propertiesExpanded: true,
};

@Injectable({ providedIn: 'root' })
export class EditorModeService {
  readonly mode = signal<EditorMode>(DEFAULT_PREFERENCES.mode);
  readonly tocVisible = signal(DEFAULT_PREFERENCES.tocVisible);
  readonly propertiesExpanded = signal(DEFAULT_PREFERENCES.propertiesExpanded);

  constructor() {
    this.loadPreferences();
  }

  setMode(mode: EditorMode): void {
    this.mode.set(mode);
    this.savePreferences();
  }

  toggleToc(): void {
    this.tocVisible.update((v) => !v);
    this.savePreferences();
  }

  toggleProperties(): void {
    this.propertiesExpanded.update((v) => !v);
    this.savePreferences();
  }

  private loadPreferences(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const prefs = JSON.parse(stored) as Partial<EditorPreferences>;
        if (prefs.mode) this.mode.set(prefs.mode);
        if (prefs.tocVisible !== undefined)
          this.tocVisible.set(prefs.tocVisible);
        if (prefs.propertiesExpanded !== undefined)
          this.propertiesExpanded.set(prefs.propertiesExpanded);
      }
    } catch {
      // Ignore parse errors, use defaults
    }
  }

  private savePreferences(): void {
    const prefs: EditorPreferences = {
      mode: this.mode(),
      tocVisible: this.tocVisible(),
      propertiesExpanded: this.propertiesExpanded(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }
}
