import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '@/i18n';
import { PageTitleDirective } from '../../common/page-title/page-title.directive';
import { BadgeComponent } from '@/ui/badge';
import { ButtonDirective } from '@/ui/button';
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
                routerLink="/features"
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

      <!-- Features Section -->
      <section class="py-24 px-4 bg-base-200/50">
        <div class="container mx-auto max-w-6xl">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">
              {{ t('features.title') }}
            </h2>
            <p class="text-base-content/60 max-w-2xl mx-auto">
              {{ t('features.subtitle') }}
            </p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <!-- Hero Management -->
            <div
              class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-base-300"
            >
              <div class="card-body">
                <div
                  class="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center text-2xl mb-4"
                >
                  🛡️
                </div>
                <h3 class="card-title">
                  {{ t('features.heroManagement.title') }}
                </h3>
                <p class="text-base-content/60">
                  {{ t('features.heroManagement.description') }}
                </p>
              </div>
            </div>

            <!-- Combat Tracker -->
            <div
              class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-base-300"
            >
              <div class="card-body">
                <div
                  class="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center text-2xl mb-4"
                >
                  ⚔️
                </div>
                <h3 class="card-title">
                  {{ t('features.combatTracker.title') }}
                </h3>
                <p class="text-base-content/60">
                  {{ t('features.combatTracker.description') }}
                </p>
              </div>
            </div>

            <!-- Quick Reference -->
            <div
              class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-base-300"
            >
              <div class="card-body">
                <div
                  class="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center text-2xl mb-4"
                >
                  📖
                </div>
                <h3 class="card-title">
                  {{ t('features.quickReference.title') }}
                </h3>
                <p class="text-base-content/60">
                  {{ t('features.quickReference.description') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- What is Draw Steel Section -->
      <section class="py-24 px-4">
        <div class="container mx-auto max-w-4xl">
          <div class="card bg-base-100 shadow-xl border border-base-300">
            <div class="card-body p-8 md:p-12">
              <h2 class="text-2xl md:text-3xl font-bold mb-6 text-center">
                {{ t('drawSteel.title') }}
              </h2>
              <div class="prose prose-lg max-w-none text-base-content/80">
                <p>{{ t('drawSteel.description1') }}</p>
                <p>{{ t('drawSteel.description2') }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-24 px-4">
        <div class="container mx-auto max-w-4xl">
          <div
            class="card bg-linear-to-br from-primary to-secondary text-primary-content shadow-2xl"
          >
            <div class="card-body text-center py-16">
              <h2 class="text-3xl md:text-4xl font-bold mb-4">
                {{ t('cta.title') }}
              </h2>
              <p class="text-primary-content/80 mb-8 max-w-xl mx-auto">
                {{ t('cta.subtitle') }}
              </p>
              <div class="flex gap-4 justify-center flex-wrap">
                <a
                  routerLink="/features"
                  appButton
                  appButtonSize="lg"
                  class="bg-white text-primary hover:bg-white/90 border-0"
                >
                  {{ t('cta.getStarted') }}
                </a>
                <a
                  href="https://www.mcdmproductions.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  appButton
                  appButtonSize="lg"
                  appButtonOutline
                  class="border-white text-white hover:bg-white/10"
                >
                  {{ t('cta.visitMcdm') }}
                </a>
              </div>
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
