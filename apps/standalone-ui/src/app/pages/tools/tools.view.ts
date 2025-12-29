import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService, type FlattenKeys } from '@/i18n';
import { PageTitleDirective } from '@/ui/page-title';
import { BadgeComponent } from '@/ui/badge';
import { toolsBundle } from './tools.i18n';

type FeatureKey = FlattenKeys<typeof toolsBundle.schema>;

interface Feature {
  icon: string;
  titleKey: FeatureKey;
  descriptionKey: FeatureKey;
  link: string | null;
}

@Component({
  selector: 'app-tools-view',
  imports: [RouterLink, PageTitleDirective, BadgeComponent],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 appPageTitle class="text-3xl font-bold mb-2">
          {{ t('pageTitle') }}
        </h1>
        <p class="text-base-content/60">
          {{ t('subtitle') }}
        </p>
        <p class="mt-2 text-sm text-base-content/40">
          {{ t('toolCount', { count: availableFeatures.length }) }}
        </p>
      </div>

      <!-- Available Now Section -->
      <div class="mb-8">
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
          <app-badge color="success">
            {{ t('sections.available.badge') }}
          </app-badge>
          {{ t('sections.available.title') }}
        </h2>
        <div class="grid md:grid-cols-2 gap-4">
          @for (feature of availableFeatures; track feature.titleKey) {
            @if (feature.link) {
              <a
                [routerLink]="feature.link"
                class="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer group border border-base-300"
              >
                <div class="card-body">
                  <div class="flex items-start gap-4">
                    <div
                      class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl group-hover:bg-primary group-hover:text-primary-content transition-colors"
                    >
                      {{ feature.icon }}
                    </div>
                    <div class="flex-1">
                      <h3 class="font-semibold text-lg mb-1">
                        {{ t(feature.titleKey) }}
                      </h3>
                      <p class="text-base-content/60 text-sm">
                        {{ t(feature.descriptionKey) }}
                      </p>
                    </div>
                  </div>
                </div>
              </a>
            }
          }
        </div>
      </div>

      <!-- Ideas Section -->
      <div>
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
          <app-badge color="secondary">
            {{ t('sections.comingSoon.badge') }}
          </app-badge>
          {{ t('sections.comingSoon.title') }}
        </h2>
        <p class="text-base-content/60 italic">
          {{ t('sections.comingSoon.placeholder') }}
        </p>
      </div>
    </div>
  `,
})
export class ToolsView {
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.useBundleT(toolsBundle);

  availableFeatures: Feature[] = [
    {
      icon: '\uD83C\uDFA8',
      titleKey: 'tools.tokenCreator.title',
      descriptionKey: 'tools.tokenCreator.description',
      link: '/tools/token-creator',
    },
    {
      icon: '\uD83D\uDCD6',
      titleKey: 'tools.compendium.title',
      descriptionKey: 'tools.compendium.description',
      link: '/compendium',
    },
  ];
}
