import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorMoon, phosphorSun } from '@ng-icons/phosphor-icons/regular';
import { I18nService } from '@/i18n';
import { themeSwitchBundle } from './theme-switch.i18n';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'sheath.theme';

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
    ? 'dark'
    : 'light';
}

function readStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

@Component({
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorSun, phosphorMoon })],
  selector: 'app-theme-switch',
  template: `
    <label class="swap swap-rotate btn btn-ghost btn-circle" [title]="t('theme')">
      <input
        type="checkbox"
        class="theme-controller"
        [checked]="isDark()"
        (change)="toggle()"
        [attr.aria-label]="t('toggleTheme')"
      />
      <ng-icon name="phosphorSun" class="swap-off text-xl" />
      <ng-icon name="phosphorMoon" class="swap-on text-xl" />
    </label>
  `,
})
export class ThemeSwitchComponent {
  private readonly document = inject(DOCUMENT);
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.useBundleT(themeSwitchBundle);

  private readonly _theme = signal<Theme>(
    readStoredTheme() ?? getSystemTheme(),
  );
  protected readonly isDark = computed(() => this._theme() === 'dark');

  constructor() {
    // Ensure theme is applied even before the first user interaction.
    this.applyTheme(this._theme());
  }

  protected toggle(): void {
    const next: Theme = this._theme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  private setTheme(theme: Theme): void {
    this._theme.set(theme);
    this.applyTheme(theme);
    this.persistTheme(theme);
  }

  private applyTheme(theme: Theme): void {
    // DaisyUI reads `data-theme` on the root element.
    this.document.documentElement.setAttribute('data-theme', theme);
  }

  private persistTheme(theme: Theme): void {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore storage failures (private mode, blocked storage, etc.)
    }
  }
}
