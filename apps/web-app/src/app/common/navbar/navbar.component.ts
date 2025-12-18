import { I18nService, type SupportedLocale } from '@/i18n';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroBars3, heroGlobeAlt } from '@ng-icons/heroicons/outline';
import { navbarBundle } from './navbar.i18n';
import { ThemeSwitchComponent } from '../theme-switch/theme-switch.component';
import {
  DropdownContainerDirective,
  MenuItemDirective,
  MenuPanelComponent,
  MenuTriggerDirective,
} from '@/ui/menu';

@Component({
  imports: [
    RouterLink,
    RouterLinkActive,
    NgIcon,
    ThemeSwitchComponent,
    DropdownContainerDirective,
    MenuTriggerDirective,
    MenuPanelComponent,
    MenuItemDirective,
  ],
  viewProviders: [provideIcons({ heroBars3, heroGlobeAlt })],
  selector: 'app-navbar',
  template: `
    <div
      class="navbar bg-base-200/80 backdrop-blur-md sticky top-0 z-50 border-b border-base-300"
    >
      <div class="navbar-start">
        <!-- Mobile Navigation Dropdown -->
        <div appDropdownContainer class="lg:hidden">
          <button
            appMenuTrigger
            [appMenuTriggerFor]="mobileMenu"
            class="btn btn-ghost"
          >
            <ng-icon name="heroBars3" class="text-xl" />
          </button>
          <ng-template #mobileMenu>
            <app-menu-panel>
              @for (link of navLinks; track link.path) {
                <li>
                  <a
                    appMenuItem
                    [routerLink]="link.path"
                    routerLinkActive="active"
                    [routerLinkActiveOptions]="{ exact: link.exact ?? false }"
                  >
                    {{ t(link.labelKey) }}
                  </a>
                </li>
              }
            </app-menu-panel>
          </ng-template>
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
          @for (link of navLinks; track link.path) {
            <li>
              <a
                [routerLink]="link.path"
                routerLinkActive="bg-error/10 text-error"
                [routerLinkActiveOptions]="{ exact: link.exact ?? false }"
                class="rounded-lg font-medium transition-colors hover:bg-error/5"
              >
                {{ t(link.labelKey) }}
              </a>
            </li>
          }
        </ul>
      </div>
      <div class="navbar-end gap-2">
        <app-theme-switch />
        <!-- Language Switcher Dropdown -->
        <div appDropdownContainer align="end">
          <button
            appMenuTrigger
            [appMenuTriggerFor]="languageMenu"
            class="btn btn-ghost btn-circle"
          >
            <ng-icon name="heroGlobeAlt" class="text-xl" />
          </button>
          <ng-template #languageMenu>
            <app-menu-panel width="10rem">
              <li class="menu-title">{{ t('language.label') }}</li>
              @for (locale of availableLocales(); track locale) {
                <li>
                  <button
                    appMenuItem
                    [active]="currentLocale() === locale"
                    (click)="switchLocale(locale)"
                  >
                    {{ getLocaleName(locale) }}
                  </button>
                </li>
              }
            </app-menu-panel>
          </ng-template>
        </div>
      </div>
    </div>
  `,
})
export class NavbarComponent {
  private readonly i18n = inject(I18nService);

  // Bundle-scoped translator - only allows keys from navbarBundle
  protected readonly t = this.i18n.useBundleT(navbarBundle);

  protected readonly navLinks: ReadonlyArray<{
    path: string;
    labelKey: 'links.home' | 'links.tools' | 'links.compendium' | 'links.about';
    exact?: boolean;
  }> = [
    { path: '/', labelKey: 'links.home', exact: true },
    { path: '/compendium', labelKey: 'links.compendium' },
    { path: '/tools', labelKey: 'links.tools' },
    { path: '/about', labelKey: 'links.about' },
  ];

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
