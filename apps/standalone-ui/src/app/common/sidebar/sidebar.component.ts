import { FlattenKeys, I18nService } from '@/i18n';
import { Component, computed, effect, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorHouse,
  phosphorBook,
  phosphorPaintBrush,
  phosphorToolbox,
  phosphorInfo,
  phosphorCaretDoubleLeft,
  phosphorCaretDoubleRight,
} from '@ng-icons/phosphor-icons/regular';
import { sidebarBundle } from './sidebar.i18n';

type NavLink = {
  path: string;
  labelKey: FlattenKeys<typeof sidebarBundle.schema>;
  icon: string;
  exact?: boolean;
};

const NAV_LINKS: readonly NavLink[] = [
  { path: '/', labelKey: 'links.home', icon: 'phosphorHouse', exact: true },
  { path: '/compendium', labelKey: 'links.compendium', icon: 'phosphorBook' },
  {
    path: '/tools/token-creator',
    labelKey: 'links.tokenCreator',
    icon: 'phosphorPaintBrush',
  },
  { path: '/tools', labelKey: 'links.allTools', icon: 'phosphorToolbox' },
  { path: '/about', labelKey: 'links.about', icon: 'phosphorInfo' },
];

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, NgIcon],
  viewProviders: [
    provideIcons({
      phosphorHouse,
      phosphorBook,
      phosphorPaintBrush,
      phosphorToolbox,
      phosphorInfo,
      phosphorCaretDoubleLeft,
      phosphorCaretDoubleRight,
    }),
  ],
  template: `
    <aside
      class="h-full bg-base-200 flex flex-col border-r border-base-300 transition-all duration-300"
      [class.w-64]="!collapsed()"
      [class.w-16]="collapsed()"
    >
      <!-- Header -->
      <div
        class="h-14 flex items-center border-b border-base-300 px-3"
        [class.justify-between]="!collapsed()"
        [class.justify-center]="collapsed()"
      >
        @if (!collapsed()) {
          <a routerLink="/" class="flex items-center gap-2 text-lg font-bold">
            <span class="text-primary">{{ brandEmoji }}</span>
            <span
              class="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent"
            >
              {{ t('brand') }}
            </span>
          </a>
        }
        <button
          class="btn btn-ghost btn-sm btn-square"
          [title]="collapsed() ? t('expand') : t('collapse')"
          (click)="toggle.emit()"
        >
          <ng-icon
            [name]="collapsed() ? 'phosphorCaretDoubleRight' : 'phosphorCaretDoubleLeft'"
            class="text-lg"
          />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-2 overflow-y-auto">
        <ul class="menu gap-1 px-2">
          @for (link of navLinks; track link.path) {
            <li>
              <a
                [routerLink]="link.path"
                routerLinkActive="bg-primary/10 text-primary"
                [routerLinkActiveOptions]="{ exact: link.exact ?? false }"
                class="flex items-center gap-3 rounded-lg transition-colors hover:bg-primary/5"
                [class.justify-center]="collapsed()"
                [class.px-3]="!collapsed()"
                [class.px-0]="collapsed()"
                [title]="collapsed() ? t(link.labelKey) : ''"
              >
                <ng-icon [name]="link.icon" class="text-xl shrink-0" />
                @if (!collapsed()) {
                  <span class="truncate">{{ t(link.labelKey) }}</span>
                }
              </a>
            </li>
          }
        </ul>
      </nav>

      <!-- Footer slot for theme/language -->
      <div
        class="border-t border-base-300 p-2"
        [class.flex]="!collapsed()"
        [class.flex-col]="collapsed()"
        [class.gap-1]="true"
      >
        <ng-content />
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.useBundleT(sidebarBundle);

  collapsed = input(false);
  toggle = output<void>();

  protected readonly navLinks = NAV_LINKS;
  protected readonly brandEmoji = '\u2694\uFE0F';
}
