import { I18nService, type SupportedLocale } from '@/i18n';
import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorGlobeSimple } from '@ng-icons/phosphor-icons/regular';
import {
  DropdownContainerDirective,
  MenuItemDirective,
  MenuPanelComponent,
  MenuTriggerDirective,
} from '@/ui/menu';
import { languageSwitcherBundle } from './language-switcher.i18n';

@Component({
  selector: 'app-language-switcher',
  imports: [
    NgIcon,
    DropdownContainerDirective,
    MenuTriggerDirective,
    MenuPanelComponent,
    MenuItemDirective,
  ],
  viewProviders: [provideIcons({ phosphorGlobeSimple })],
  template: `
    @if (availableLocales().length > 1) {
      <div appDropdownContainer align="end">
        <button
          appMenuTrigger
          [appMenuTriggerFor]="languageMenu"
          class="btn btn-ghost btn-sm btn-square"
        >
          <ng-icon name="phosphorGlobeSimple" class="text-lg" />
        </button>
        <ng-template #languageMenu>
          <app-menu-panel width="10rem">
            <li class="menu-title">{{ t('label') }}</li>
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
    }
  `,
})
export class LanguageSwitcherComponent {
  private readonly i18n = inject(I18nService);

  protected readonly t = this.i18n.useBundleT(languageSwitcherBundle);

  protected readonly currentLocale = this.i18n.locale;
  protected readonly availableLocales = this.i18n.availableLocales;

  protected switchLocale(locale: string): void {
    this.i18n.setLocale(locale as SupportedLocale);
  }

  protected getLocaleName(locale: string): string {
    switch (locale) {
      case 'en':
        return this.t('en');
      default:
        return locale.toUpperCase();
    }
  }
}
