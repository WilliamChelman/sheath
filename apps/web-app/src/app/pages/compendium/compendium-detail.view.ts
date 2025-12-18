import { I18nService } from '@/i18n';
import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeft,
  heroTag,
  heroFolder,
} from '@ng-icons/heroicons/outline';
import { compendiumBundle } from './compendium.i18n';
import type { CompendiumEntry } from './models/compendium.model';
import { CompendiumService } from './services/compendium.service';

@Component({
  selector: 'app-compendium-detail-view',
  imports: [RouterLink, NgIcon],
  viewProviders: [provideIcons({ heroArrowLeft, heroTag, heroFolder })],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-base-300 via-base-100 to-base-200"
    >
      <div class="container mx-auto px-4 py-8 max-w-4xl">
        <!-- Back Button -->
        <a
          routerLink="/compendium"
          class="inline-flex items-center gap-2 text-base-content/60 hover:text-primary transition-colors mb-6 group"
        >
          <ng-icon
            name="heroArrowLeft"
            class="text-lg group-hover:-translate-x-1 transition-transform"
          />
          <span>{{ t('detail.backToSearch') }}</span>
        </a>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center py-16">
            <span
              class="loading loading-spinner loading-lg text-primary"
            ></span>
            <p class="mt-4 text-base-content/60">{{ t('search.loading') }}</p>
          </div>
        }

        <!-- Not Found State -->
        @if (!isLoading() && !entry()) {
          <div
            class="text-center py-16 bg-base-200/50 rounded-2xl border border-base-300"
          >
            <h2 class="text-2xl font-bold text-base-content/60">
              {{ t('detail.notFound') }}
            </h2>
            <a routerLink="/compendium" class="btn btn-primary mt-4">
              {{ t('detail.backToSearch') }}
            </a>
          </div>
        }

        <!-- Content -->
        @if (entry(); as currentEntry) {
          <article
            class="bg-base-100/80 backdrop-blur-sm border border-base-300 rounded-2xl overflow-hidden"
          >
            <!-- Header -->
            <div
              class="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 border-b border-base-300"
            >
              <h1
                class="text-3xl md:text-4xl font-black tracking-tight text-base-content"
              >
                {{ displayName() }}
              </h1>
              <div class="flex flex-wrap items-center gap-3 mt-3">
                @if (currentEntry.frontmatter.type) {
                  <span class="badge badge-primary gap-1">
                    <ng-icon name="heroTag" class="text-sm" />
                    {{ currentEntry.frontmatter.type }}
                  </span>
                }
                @if (category()) {
                  <span class="badge badge-ghost gap-1">
                    <ng-icon name="heroFolder" class="text-sm" />
                    {{ category() }}
                  </span>
                }
                @if (currentEntry.frontmatter.source) {
                  <span class="text-sm text-base-content/50">
                    {{ t('detail.source') }}:
                    {{ currentEntry.frontmatter.source }}
                  </span>
                }
              </div>
            </div>

            <!-- Rendered Content -->
            <div
              class="prose prose-lg max-w-none p-6 md:p-8 
                   prose-headings:text-base-content prose-headings:font-bold
                   prose-p:text-base-content/80
                   prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                   prose-strong:text-base-content
                   prose-code:bg-base-300 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                   prose-pre:bg-base-300 prose-pre:border prose-pre:border-base-300
                   prose-table:border-collapse
                   prose-th:bg-base-200 prose-th:border prose-th:border-base-300 prose-th:p-2
                   prose-td:border prose-td:border-base-300 prose-td:p-2"
              [innerHTML]="safeHtml()"
            ></div>
          </article>
        }
      </div>
    </div>
  `,
})
export class CompendiumDetailView implements OnInit {
  private readonly i18n = inject(I18nService);
  private readonly compendium = inject(CompendiumService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly route = inject(ActivatedRoute);

  protected readonly t = this.i18n.useBundleT(compendiumBundle);

  protected readonly isLoading = signal(true);
  protected readonly entry = signal<CompendiumEntry | null>(null);
  private readonly entryId = signal<string | null>(null);

  protected readonly displayName = computed(() => {
    const e = this.entry();
    if (!e) return '';
    return (
      e.frontmatter.item_name ??
      e.frontmatter.title ??
      e.frontmatter.file_basename ??
      'Unknown'
    );
  });

  protected readonly category = computed(() => {
    const e = this.entry();
    if (!e) return '';

    // Extract from path
    const parts = e.publicPath.split('/');
    if (parts.length >= 2) {
      return parts[1];
    }
    return '';
  });

  protected readonly safeHtml = computed((): SafeHtml => {
    const e = this.entry();
    if (!e) return '';
    return this.sanitizer.bypassSecurityTrustHtml(e.html);
  });

  constructor() {
    // React to entry ID changes and load the entry
    effect(() => {
      const id = this.entryId();
      if (!id || !this.compendium.isLoaded()) return;

      const foundEntry = this.compendium.getById(id);
      this.entry.set(foundEntry ?? null);
      this.isLoading.set(false);
    });
  }

  async ngOnInit(): Promise<void> {
    // Load compendium data first
    await this.compendium.load();

    // Subscribe to route params
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.entryId.set(id);
    });
  }
}
