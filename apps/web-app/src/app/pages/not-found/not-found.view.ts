import { I18nService } from '@/i18n';
import { BadgeComponent } from '@/ui/badge';
import { ButtonDirective } from '@/ui/button';
import { CardComponent } from '@/ui/card';
import { PageTitleDirective } from '@/ui/page-title';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { notFoundBundle } from './not-found.i18n';

@Component({
  imports: [
    RouterLink,
    CardComponent,
    BadgeComponent,
    ButtonDirective,
    PageTitleDirective,
  ],
  selector: 'app-not-found-view',
  template: `
    <div class="container mx-auto px-4 py-12">
      <app-card bodyClass="items-center text-center gap-4">
        <app-badge [label]="t('badge')" color="error" />
        <h1 appPageTitle class="text-2xl sm:text-3xl font-bold">
          {{ t('title') }}
        </h1>
        <p class="text-base-content/70 max-w-prose">
          {{ t('subtitle') }}
        </p>
        <div class="card-actions mt-2">
          <a routerLink="/" appButton="primary">{{ t('actions.goHome') }}</a>
          <a routerLink="/tools" appButton="ghost">
            {{ t('actions.browseTools') }}
          </a>
        </div>
      </app-card>
    </div>
  `,
})
export class NotFoundView {
  private i18n = inject(I18nService);
  protected t = this.i18n.useBundleT(notFoundBundle);
}
