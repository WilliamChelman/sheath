import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorGithubLogo } from '@ng-icons/phosphor-icons/regular';
import { I18nService } from '@/i18n';
import { ConfigService } from '../../services/config.service';
import { footerBundle } from './footer.i18n';

@Component({
  imports: [RouterLink, NgIcon],
  viewProviders: [provideIcons({ phosphorGithubLogo })],
  selector: 'app-footer',
  template: `
    <footer class="bg-base-200 text-base-content p-10 border-t border-base-300">
      <div class="mx-auto w-full max-w-5xl flex flex-col items-center gap-6">
        <nav class="flex flex-wrap justify-center gap-x-4 gap-y-2">
          <a routerLink="/about" class="link link-hover">{{
            t('links.about')
          }}</a>
          <a routerLink="/tools" class="link link-hover">{{
            t('links.tools')
          }}</a>
          <a
            href="https://www.mcdmproductions.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="link link-hover"
            >{{ t('links.mcdm') }}</a
          >
        </nav>

        <nav class="w-full">
          <div class="flex justify-center">
            <a
              class="hover:text-primary transition-colors inline-flex items-center justify-center"
              href="https://github.com/WilliamChelman/sheath"
              [attr.aria-label]="t('social.github')"
            >
              <span class="sr-only">{{ t('social.github') }}</span>
              <ng-icon name="phosphorGithubLogo" class="text-2xl" />
            </a>
          </div>
        </nav>

        <aside class="w-full">
          <p class="mx-auto max-w-prose text-center">
            {{
              t('legal.prefix', { year: currentYear, appName: t('appName') })
            }}
            <a
              href="https://www.mcdmproductions.com/"
              target="_blank"
              rel="noopener noreferrer"
              class="link link-primary"
              >{{ t('legal.mcdmProductions') }}</a
            >{{ t('legal.suffix') }}
          </p>
          <p class="mt-2 text-center text-sm opacity-60">
            @if (version) {
              {{ t('version', { version }) }} -
            }
            @if (formattedBuildDate) {
              {{ t('buildDate', { date: formattedBuildDate }) }}
            }
          </p>
        </aside>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  private readonly i18n = inject(I18nService);
  private readonly configService = inject(ConfigService);

  protected readonly t = this.i18n.useBundleT(footerBundle);

  protected readonly currentYear = new Date().getFullYear();

  protected get formattedBuildDate(): string {
    const buildDate = this.configService.config?.buildDate;
    if (!buildDate) return '';
    return new Date(buildDate).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  protected get version(): string {
    return this.configService.config?.version ?? 'SNAPSHOT';
  }
}
