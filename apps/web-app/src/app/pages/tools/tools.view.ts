import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService, type FlattenKeys } from '@/i18n';
import { toolsBundle } from './tools.i18n';

// Type for keys in this bundle
type FeatureKey = FlattenKeys<typeof toolsBundle.schema>;

interface Feature {
  icon: string;
  titleKey: FeatureKey;
  descriptionKey: FeatureKey;
  link: string | null;
}

@Component({
  selector: 'app-features-view',
  imports: [RouterLink],
  template: `
    <div class="container mx-auto max-w-6xl px-4 py-16">
      <div class="text-center mb-16">
        <div class="badge badge-error badge-outline mb-4 gap-2">
          <span>⚔️</span> {{ t('header.badge') }}
        </div>
        <h1 class="text-4xl md:text-5xl font-bold mb-4">
          {{ t('header.title') }}
        </h1>
        <p class="text-base-content/60 max-w-2xl mx-auto text-lg">
          {{ t('header.subtitle') }}
        </p>
        <!-- ICU Plural Demo -->
        <p class="mt-4 text-sm text-base-content/40">
          {{ t('toolCount', { count: availableFeatures.length }) }}
        </p>
      </div>

      <!-- Available Now Section -->
      <div class="mb-16">
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
          <span class="badge badge-success">{{
            t('sections.available.badge')
          }}</span>
          {{ t('sections.available.title') }}
        </h2>
        <div class="grid md:grid-cols-2 gap-6">
          @for (feature of availableFeatures; track feature.titleKey) {
            @if (feature.link) {
              <a
                [routerLink]="feature.link"
                class="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer group border border-base-300"
              >
                <div class="card-body">
                  <div class="flex items-start gap-4">
                    <div
                      class="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center text-xl group-hover:bg-error group-hover:text-error-content transition-colors"
                    >
                      {{ feature.icon }}
                    </div>
                    <div class="flex-1">
                      <h3 class="font-semibold text-lg mb-2">
                        {{ t(feature.titleKey) }}
                      </h3>
                      <p class="text-base-content/60 text-sm">
                        {{ t(feature.descriptionKey) }}
                      </p>
                    </div>
                  </div>
                </div>
              </a>
            } @else {
              <div class="card bg-base-200 border border-base-300">
                <div class="card-body">
                  <div class="flex items-start gap-4">
                    <div
                      class="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center text-xl"
                    >
                      {{ feature.icon }}
                    </div>
                    <div class="flex-1">
                      <h3 class="font-semibold text-lg mb-2">
                        {{ t(feature.titleKey) }}
                      </h3>
                      <p class="text-base-content/60 text-sm">
                        {{ t(feature.descriptionKey) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            }
          }
        </div>
      </div>

      <!-- Coming Soon Section -->
      <div>
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
          <span class="badge badge-warning">{{
            t('sections.comingSoon.badge')
          }}</span>
          {{ t('sections.comingSoon.title') }}
        </h2>
        <div class="grid md:grid-cols-2 gap-6">
          @for (feature of comingSoonFeatures; track feature.titleKey) {
            <div
              class="card bg-base-200/50 border border-dashed border-base-300 opacity-75"
            >
              <div class="card-body">
                <div class="flex items-start gap-4">
                  <div
                    class="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center text-xl"
                  >
                    {{ feature.icon }}
                  </div>
                  <div class="flex-1">
                    <h3 class="font-semibold text-lg mb-2">
                      {{ t(feature.titleKey) }}
                    </h3>
                    <p class="text-base-content/60 text-sm">
                      {{ t(feature.descriptionKey) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class ToolsView {
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.useBundleT(toolsBundle);

  availableFeatures: Feature[] = [
    {
      icon: '🎨',
      titleKey: 'tools.tokenGenerator.title',
      descriptionKey: 'tools.tokenGenerator.description',
      link: '/tools/token-generator',
    },
    {
      icon: '🛡️',
      titleKey: 'tools.heroBuilder.title',
      descriptionKey: 'tools.heroBuilder.description',
      link: null,
    },
    {
      icon: '📖',
      titleKey: 'tools.rulesReference.title',
      descriptionKey: 'tools.rulesReference.description',
      link: null,
    },
  ];

  comingSoonFeatures: Feature[] = [
    {
      icon: '⚔️',
      titleKey: 'tools.combatTracker.title',
      descriptionKey: 'tools.combatTracker.description',
      link: null,
    },
    {
      icon: '🎭',
      titleKey: 'tools.npcManager.title',
      descriptionKey: 'tools.npcManager.description',
      link: null,
    },
    {
      icon: '🗺️',
      titleKey: 'tools.encounterBuilder.title',
      descriptionKey: 'tools.encounterBuilder.description',
      link: null,
    },
    {
      icon: '🎲',
      titleKey: 'tools.diceRoller.title',
      descriptionKey: 'tools.diceRoller.description',
      link: null,
    },
    {
      icon: '📝',
      titleKey: 'tools.sessionNotes.title',
      descriptionKey: 'tools.sessionNotes.description',
      link: null,
    },
    {
      icon: '👥',
      titleKey: 'tools.partyDashboard.title',
      descriptionKey: 'tools.partyDashboard.description',
      link: null,
    },
  ];
}
