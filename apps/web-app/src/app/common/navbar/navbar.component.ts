import { FlattenKeys, I18nService, type SupportedLocale } from '@/i18n';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroBars3,
  heroChevronDown,
  heroGlobeAlt,
} from '@ng-icons/heroicons/outline';
import { navbarBundle } from './navbar.i18n';
import { ThemeSwitchComponent } from '../theme-switch/theme-switch.component';
import { ButtonDirective } from '@/ui/button';
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
    ButtonDirective,
  ],
  viewProviders: [provideIcons({ heroBars3, heroChevronDown, heroGlobeAlt })],
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
            appButton="ghost"
          >
            <ng-icon name="heroBars3" class="text-xl" />
          </button>
          <ng-template #mobileMenu>
            <app-menu-panel>
              @for (link of navLinks; track link) {
                @if ('path' in link) {
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
                } @else {
                  <li class="menu-title">{{ t(link.labelKey) }}</li>
                  @for (child of link.children; track child.path) {
                    <li>
                      <a
                        appMenuItem
                        [routerLink]="child.path"
                        routerLinkActive="active"
                      >
                        {{ t(child.labelKey) }}
                      </a>
                    </li>
                  }
                }
              }
            </app-menu-panel>
          </ng-template>
        </div>
        <a
          routerLink="/"
          appButton="ghost"
          class="text-xl font-bold tracking-tight"
        >
          <span class="text-primary">⚔️</span>
          <span
            class="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent"
          >
            {{ t('brand') }}
          </span>
        </a>
      </div>
      <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal px-1 gap-1">
          @for (link of navLinks; track link) {
            @if ('path' in link) {
              <li>
                <a
                  [routerLink]="link.path"
                  routerLinkActive="bg-primary/10 text-primary"
                  [routerLinkActiveOptions]="{ exact: link.exact ?? false }"
                  class="rounded-lg font-medium transition-colors hover:bg-primary/5"
                >
                  {{ t(link.labelKey) }}
                </a>
              </li>
            } @else {
              <li appDropdownContainer>
                <button
                  appMenuTrigger
                  [appMenuTriggerFor]="toolsMenu"
                  class="rounded-lg font-medium transition-colors hover:bg-primary/5"
                >
                  {{ t(link.labelKey) }}
                  <ng-icon name="heroChevronDown" class="text-sm" />
                </button>
                <ng-template #toolsMenu>
                  <app-menu-panel>
                    @for (child of link.children; track child.path) {
                      <li>
                        <a
                          appMenuItem
                          [routerLink]="child.path"
                          routerLinkActive="active"
                        >
                          {{ t(child.labelKey) }}
                        </a>
                      </li>
                    }
                  </app-menu-panel>
                </ng-template>
              </li>
            }
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
            appButton="ghost"
            appButtonShape="circle"
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

  protected readonly navLinks: ReadonlyArray<Link> = [
    { path: '/', labelKey: 'links.home', exact: true },
    { path: '/about', labelKey: 'links.about' },
    {
      labelKey: 'links.tools',
      children: [
        { path: '/compendium', labelKey: 'links.compendium' },
        { path: '/tools/token-creator', labelKey: 'links.tokenCreator' },
        { path: '/tools', labelKey: 'links.allTools' },
      ],
    },
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

type SingleLink = {
  path: string;
  labelKey: FlattenKeys<typeof navbarBundle.schema>;
  exact?: boolean;
};

type Link =
  | SingleLink
  | {
      labelKey: FlattenKeys<typeof navbarBundle.schema>;
      children: ReadonlyArray<SingleLink>;
    };
