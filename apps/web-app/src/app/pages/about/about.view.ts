import { I18nService } from '@/i18n';
import { Component, inject } from '@angular/core';
import { CardComponent } from '@/ui/card';
import { aboutBundle } from './about.i18n';

@Component({
  selector: 'app-about-view',
  imports: [CardComponent],
  template: `
    <div class="container mx-auto max-w-3xl px-4 py-16">
      <app-card
        class="bg-base-100 shadow-xl"
        bodyClass="items-center text-center gap-6"
      >
        <div class="rounded-xl in-data-[theme=dark]:bg-white p-3">
          <img
            src="/powered-by-draw-steel.webp"
            alt="Powered by DRAW STEEL"
            class="w-full max-w-sm"
            loading="lazy"
            decoding="async"
          />
        </div>

        <p class="text-sm md:text-base text-base-content/70 max-w-2xl">
          {{ t('legal') }}
        </p>
      </app-card>
    </div>
  `,
})
export class AboutView {
  private readonly i18n = inject(I18nService);

  protected readonly t = this.i18n.useBundleT(aboutBundle);
}
