import { I18nService } from '@/i18n';
import { BadgeComponent } from '@/ui/badge';
import { ButtonDirective } from '@/ui/button';
import { PageTitleDirective } from '@/ui/page-title';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { homeBundle } from './home.i18n';

@Component({
  selector: 'app-home-view',
  imports: [RouterLink, PageTitleDirective, BadgeComponent, ButtonDirective],
  template: `
    <span class="sr-only" appPageTitle>{{ t('hero.title') }}</span>
    <div class="relative overflow-hidden">
      <!-- Hero Section -->
      <section class="hero min-h-[calc(100vh-4rem)] relative">
        <!-- Background Pattern - Sword/geometric pattern -->
        <div
          class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/15 via-base-100 to-base-100"
        ></div>
        <div
          class="absolute inset-0 opacity-20"
          style='background-image: url(&apos;data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" stroke="%23666" stroke-opacity="0.15" stroke-width="1"%3E%3Cpath d="M40 0v80M0 40h80M20 20l40 40M60 20L20 60"/%3E%3C/g%3E%3C/svg%3E&apos;)'
        ></div>

        <div class="hero-content text-center relative z-10">
          <div class="max-w-3xl">
            <app-badge
              color="primary"
              variant="outline"
              class="mb-6 animate-fade-in gap-2"
              style="animation-delay: 0.1s"
            >
              <span class="text-lg">⚔️</span> {{ t('hero.badge') }}
            </app-badge>
            <h1
              class="text-5xl md:text-7xl font-black tracking-tight animate-fade-in"
              style="animation-delay: 0.2s"
            >
              <span
                class="bg-linear-to-r from-primary via-secondary to-primary bg-clip-text text-transparent"
              >
                {{ t('hero.title') }}
              </span>
            </h1>
            <p
              class="py-6 text-lg md:text-xl text-base-content/70 max-w-xl mx-auto animate-fade-in"
              style="animation-delay: 0.3s"
            >
              {{ t('hero.subtitle') }}
            </p>
            <div
              class="flex gap-4 justify-center animate-fade-in"
              style="animation-delay: 0.4s"
            >
              <a
                routerLink="/tools"
                appButton="primary"
                appButtonSize="lg"
                class="shadow-lg shadow-primary/25"
              >
                {{ t('hero.cta.explore') }}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>
              <a routerLink="/about" appButton="ghost" appButtonSize="lg">
                {{ t('hero.cta.learn') }}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: `
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-in {
      animation: fade-in 0.6s ease-out forwards;
      opacity: 0;
    }
  `,
})
export class HomeView {
  private readonly i18n = inject(I18nService);

  // Bundle-scoped translator - only allows keys from homeBundle
  protected readonly t = this.i18n.useBundleT(homeBundle);
}
