import { I18nService, type SupportedLocale } from '@/i18n';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroBars3, heroGlobeAlt } from '@ng-icons/heroicons/outline';
import { navbarBundle } from './navbar.i18n';
import { ThemeSwitchComponent } from '../theme-switch/theme-switch.component';

@Component({
  imports: [RouterLink, RouterLinkActive, NgIcon, ThemeSwitchComponent],
  viewProviders: [provideIcons({ heroBars3, heroGlobeAlt })],
  selector: 'app-navbar',
  template: `
    <div
      class="navbar bg-base-200/80 backdrop-blur-md sticky top-0 z-50 border-b border-base-300"
    >
      <div class="navbar-start">
        <div class="dropdown">
          <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
            <ng-icon name="heroBars3" class="text-xl" />
          </div>
          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow-lg"
          >
            <li>
              <a
                routerLink="/"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: true }"
              >
                {{ t('links.home') }}
              </a>
            </li>
            <li>
              <a routerLink="/about" routerLinkActive="active">{{
                t('links.about')
              }}</a>
            </li>
            <li>
              <a routerLink="/features" routerLinkActive="active">{{
                t('links.tools')
              }}</a>
            </li>
          </ul>
        </div>
        <a
          routerLink="/"
          class="btn btn-ghost text-xl font-bold tracking-tight"
        >
          <span class="text-error">⚔️</span>
          <span
            class="bg-linear-to-r from-error to-warning bg-clip-text text-transparent"
          >
            {{ t('brand') }}
          </span>
        </a>
      </div>
      <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal px-1 gap-1">
          <li>
            <a
              routerLink="/"
              routerLinkActive="bg-error/10 text-error"
              [routerLinkActiveOptions]="{ exact: true }"
              class="rounded-lg font-medium transition-colors hover:bg-error/5"
            >
              {{ t('links.home') }}
            </a>
          </li>
          <li>
            <a
              routerLink="/features"
              routerLinkActive="bg-error/10 text-error"
              class="rounded-lg font-medium transition-colors hover:bg-error/5"
            >
              {{ t('links.tools') }}
            </a>
          </li>
          <li>
            <a
              routerLink="/about"
              routerLinkActive="bg-error/10 text-error"
              class="rounded-lg font-medium transition-colors hover:bg-error/5"
            >
              {{ t('links.about') }}
            </a>
          </li>
        </ul>
      </div>
      <div class="navbar-end gap-2">
        <app-theme-switch />
        <!-- Language Switcher -->
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
            <ng-icon name="heroGlobeAlt" class="text-xl" />
          </div>
          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-40 p-2 shadow-lg"
          >
            <li class="menu-title">{{ t('language.label') }}</li>
            @for (locale of availableLocales(); track locale) {
            <li>
              <button
                (click)="switchLocale(locale)"
                [class.active]="currentLocale() === locale"
              >
                {{ getLocaleName(locale) }}
              </button>
            </li>
            }
          </ul>
        </div>
      </div>
    </div>
  `,
})
export class NavbarComponent {
  private readonly i18n = inject(I18nService);

  // Bundle-scoped translator - only allows keys from navbarBundle
  protected readonly t = this.i18n.useBundleT(navbarBundle);

  protected readonly currentLocale = this.i18n.locale;
  protected readonly availableLocales = this.i18n.availableLocales;

  protected switchLocale(locale: string): void {
    this.i18n.setLocale(locale as SupportedLocale);
  }

  protected getLocaleName(locale: string): string {
    switch (locale) {
      case 'en':
        return this.t('language.en');
      default:
        return locale.toUpperCase();
    }
  }
}
