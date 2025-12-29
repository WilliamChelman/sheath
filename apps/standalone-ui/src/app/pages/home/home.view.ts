import { I18nService } from '@/i18n';
import { PageTitleDirective } from '@/ui/page-title';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorBook,
  phosphorPaintBrush,
  phosphorToolbox,
} from '@ng-icons/phosphor-icons/regular';
import { homeBundle } from './home.i18n';

@Component({
  selector: 'app-home-view',
  imports: [RouterLink, PageTitleDirective, NgIcon],
  viewProviders: [
    provideIcons({ phosphorBook, phosphorPaintBrush, phosphorToolbox }),
  ],
  template: `
    <span class="sr-only" appPageTitle>{{ t('pageTitle') }}</span>
    <div class="p-6 max-w-4xl mx-auto">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">
          <span
            class="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent"
          >
            {{ t('welcome') }}
          </span>
        </h1>
        <p class="text-base-content/70">{{ t('subtitle') }}</p>
      </div>

      <!-- Quick Actions -->
      <div>
        <h2 class="text-lg font-semibold mb-4">{{ t('quickActions') }}</h2>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <a
            routerLink="/compendium"
            class="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer"
          >
            <div class="card-body">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-primary/10">
                  <ng-icon name="phosphorBook" class="text-2xl text-primary" />
                </div>
                <div>
                  <h3 class="card-title text-base">
                    {{ t('actions.compendium') }}
                  </h3>
                  <p class="text-sm text-base-content/60">
                    {{ t('actions.compendiumDesc') }}
                  </p>
                </div>
              </div>
            </div>
          </a>

          <a
            routerLink="/token-creator"
            class="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer"
          >
            <div class="card-body">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-secondary/10">
                  <ng-icon
                    name="phosphorPaintBrush"
                    class="text-2xl text-secondary"
                  />
                </div>
                <div>
                  <h3 class="card-title text-base">
                    {{ t('actions.tokenCreator') }}
                  </h3>
                  <p class="text-sm text-base-content/60">
                    {{ t('actions.tokenCreatorDesc') }}
                  </p>
                </div>
              </div>
            </div>
          </a>

          <a
            routerLink="/tools"
            class="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer"
          >
            <div class="card-body">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-accent/10">
                  <ng-icon
                    name="phosphorToolbox"
                    class="text-2xl text-accent"
                  />
                </div>
                <div>
                  <h3 class="card-title text-base">
                    {{ t('actions.allTools') }}
                  </h3>
                  <p class="text-sm text-base-content/60">
                    {{ t('actions.allToolsDesc') }}
                  </p>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  `,
})
export class HomeView {
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.useBundleT(homeBundle);
}
