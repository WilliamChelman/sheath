import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { simpleGithub } from '@ng-icons/simple-icons';
import { I18nService } from '@/i18n';
import { footerBundle } from './footer.i18n';

@Component({
  imports: [RouterLink, NgIcon],
  viewProviders: [provideIcons({ simpleGithub })],
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
              aria-label="GitHub"
            >
              <span class="sr-only">GitHub</span>
              <ng-icon name="simpleGithub" class="text-2xl" />
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
              class="link link-error"
              >{{ t('legal.mcdmProductions') }}</a
            >{{ t('legal.suffix') }}
          </p>
        </aside>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  private readonly i18n = inject(I18nService);

  protected readonly t = this.i18n.useBundleT(footerBundle);

  protected readonly currentYear = new Date().getFullYear();
}
