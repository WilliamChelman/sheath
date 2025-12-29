import { I18nService } from '@/i18n';
import { CardComponent } from '@/ui/card';
import { PageTitleDirective } from '@/ui/page-title';
import { Component, inject } from '@angular/core';
import { aboutBundle } from './about.i18n';

@Component({
  selector: 'app-about-view',
  imports: [CardComponent, PageTitleDirective],
  template: `
    <span class="sr-only" appPageTitle>{{ t('pageTitle') }}</span>
    <div class="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      <!-- Legal / Draw Steel -->
      <app-card bodyClass="items-center text-center gap-6">
        <div class="rounded-xl in-data-[theme=dark]:bg-white p-3">
          <img
            src="powered-by-draw-steel.webp"
            alt="Powered by DRAW STEEL"
            class="w-full max-w-sm"
            loading="lazy"
            decoding="async"
          />
        </div>
        <p class="text-sm text-base-content/70 max-w-2xl">
          {{ t('legal') }}
        </p>
      </app-card>

      <!-- Inspirations & Thanks -->
      <app-card bodyClass="gap-4">
        <h2 class="text-xl font-bold">{{ t('inspirationsTitle') }}</h2>
        <p class="text-sm text-base-content/70">
          {{ t('inspirationsIntro') }}
        </p>

        <div class="grid gap-4">
          <div class="flex flex-col gap-1">
            <a
              href="https://github.com/andyaiken/forgesteel"
              target="_blank"
              rel="noopener noreferrer"
              class="link link-primary font-semibold"
            >
              {{ t('forgesteelName') }}
            </a>
            <p class="text-sm text-base-content/70">
              {{ t('forgesteelDesc') }}
            </p>
          </div>

          <div class="flex flex-col gap-1">
            <a
              href="https://steelcompendium.io/"
              target="_blank"
              rel="noopener noreferrer"
              class="link link-primary font-semibold"
            >
              {{ t('steelcompendiumName') }}
            </a>
            <p class="text-sm text-base-content/70">
              {{ t('steelcompendiumDesc') }}
            </p>
          </div>

          <div class="flex flex-col gap-1">
            <a
              href="https://rolladvantage.com/tokenstamp/"
              target="_blank"
              rel="noopener noreferrer"
              class="link link-primary font-semibold"
            >
              {{ t('tokenstampName') }}
            </a>
            <p class="text-sm text-base-content/70">
              {{ t('tokenstampDesc') }}
            </p>
          </div>
        </div>
      </app-card>

      <!-- Icon Licensing -->
      <app-card bodyClass="gap-4">
        <h2 class="text-xl font-bold">{{ t('licensingTitle') }}</h2>
        <p class="text-sm text-base-content/70">
          {{ t('licensingIntro') }}
        </p>

        <div class="overflow-x-auto">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Library</th>
                <th>License</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <a
                    href="https://phosphoricons.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link link-primary"
                  >
                    {{ t('phosphoriconsName') }}
                  </a>
                </td>
                <td>{{ t('phosphoriconsLicense') }}</td>
              </tr>
              <tr>
                <td>
                  <a
                    href="https://github.com/twitter/twemoji"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link link-primary"
                  >
                    {{ t('twemojiName') }}
                  </a>
                </td>
                <td>{{ t('twemojiLicense') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </app-card>
    </div>
  `,
})
export class AboutView {
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.useBundleT(aboutBundle);
}
