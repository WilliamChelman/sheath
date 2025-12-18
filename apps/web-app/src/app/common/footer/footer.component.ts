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
    <footer
      class="footer footer-center bg-base-200 text-base-content p-10 border-t border-base-300"
    >
      <nav class="grid grid-flow-col gap-4">
        <a routerLink="/about" class="link link-hover">{{
          t('links.about')
        }}</a>
        <a routerLink="/features" class="link link-hover">{{
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
      <nav>
        <div class="grid grid-flow-col gap-4">
          <a
            class="cursor-pointer hover:text-error transition-colors"
            href="https://github.com/WilliamChelman/sheath"
          >
            <ng-icon name="simpleGithub" class="text-2xl" />
          </a>
        </div>
      </nav>
      <aside>
        <p>
          {{ t('legal.prefix', { year: currentYear, appName: t('appName') }) }}
          <a
            href="https://www.mcdmproductions.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="link link-error"
            >{{ t('legal.mcdmProductions') }}</a
          >{{ t('legal.suffix') }}
        </p>
      </aside>
    </footer>
  `,
})
export class FooterComponent {
  private readonly i18n = inject(I18nService);

  protected readonly t = this.i18n.useBundleT(footerBundle);

  protected readonly currentYear = new Date().getFullYear();
}
