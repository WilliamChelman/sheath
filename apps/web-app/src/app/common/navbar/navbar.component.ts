import { FlattenKeys, I18nService } from '@/i18n';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorList,
  phosphorCaretDown,
} from '@ng-icons/phosphor-icons/regular';
import { navbarBundle } from './navbar.i18n';
import { ThemeSwitchComponent } from '../theme-switch/theme-switch.component';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { ButtonDirective } from '@/ui/button';
import {
  DropdownContainerDirective,
  MenuItemDirective,
  MenuPanelComponent,
  MenuTriggerDirective,
} from '@/ui/menu';
import { CommandPaletteComponent } from '@/command-palette';

@Component({
  imports: [
    RouterLink,
    RouterLinkActive,
    NgIcon,
    ThemeSwitchComponent,
    LanguageSwitcherComponent,
    DropdownContainerDirective,
    MenuTriggerDirective,
    MenuPanelComponent,
    MenuItemDirective,
    ButtonDirective,
    CommandPaletteComponent,
  ],
  viewProviders: [provideIcons({ phosphorList, phosphorCaretDown })],
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
            <ng-icon name="phosphorList" class="text-xl" />
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
                  <ng-icon name="phosphorCaretDown" class="text-sm" />
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
        <app-command-palette />
        <app-theme-switch />
        <app-language-switcher />
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
        { path: '/token-creator', labelKey: 'links.tokenCreator' },
        { path: '/tools', labelKey: 'links.allTools' },
      ],
    },
  ];
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
