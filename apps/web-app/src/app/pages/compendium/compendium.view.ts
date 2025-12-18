import { I18nService } from '@/i18n';
import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroMagnifyingGlass,
  heroDocumentText,
  heroArrowRight,
} from '@ng-icons/heroicons/outline';
import { compendiumBundle } from './compendium.i18n';
import { CompendiumService } from './services/compendium.service';
import type { CompendiumSearchResult } from './models/compendium.model';

@Component({
  selector: 'app-compendium-view',
  imports: [FormsModule, NgIcon, RouterLink],
  viewProviders: [
    provideIcons({ heroMagnifyingGlass, heroDocumentText, heroArrowRight }),
  ],
  template: `
    <div
      class="min-h-screen bg-linear-to-br from-base-300 via-base-100 to-base-200"
    >
      <div class="container mx-auto px-4 py-8 max-w-5xl">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1
            class="text-4xl md:text-5xl font-black tracking-tight bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent"
          >
            {{ t('title') }}
          </h1>
          @if (compendium.isLoaded()) {
            <p class="text-base-content/60 mt-2">
              {{
                t('browse.showingCount', {
                  count: displayedResults().length,
                  total: compendium.totalCount(),
                })
              }}
            </p>
          }
        </div>

        <!-- Search Box -->
        <div class="relative mb-8">
          <div
            class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"
          >
            <ng-icon
              name="heroMagnifyingGlass"
              class="text-xl text-base-content/50"
            />
          </div>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            [placeholder]="t('search.placeholder')"
            class="input input-bordered input-lg w-full pl-12 bg-base-100/80 backdrop-blur-sm border-base-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <!-- Loading State -->
        @if (compendium.isLoading()) {
          <div class="flex flex-col items-center justify-center py-16">
            <span
              class="loading loading-spinner loading-lg text-primary"
            ></span>
            <p class="mt-4 text-base-content/60">{{ t('search.loading') }}</p>
          </div>
        }

        <!-- Error State -->
        @if (compendium.error()) {
          <div class="alert alert-error">
            <span>{{ t('search.error') }}</span>
          </div>
        }

        <!-- Results -->
        @if (compendium.isLoaded() && !compendium.error()) {
          <div class="space-y-3">
            @if (displayedResults().length === 0 && searchQuery().trim()) {
              <div
                class="text-center py-12 bg-base-200/50 rounded-2xl border border-base-300"
              >
                <ng-icon
                  name="heroDocumentText"
                  class="text-5xl text-base-content/30 mx-auto"
                />
                <p class="mt-4 text-base-content/60">
                  {{ t('search.noResults') }}
                </p>
              </div>
            } @else {
              @for (result of displayedResults(); track result.id) {
                <a
                  [routerLink]="['/compendium', result.id]"
                  class="block w-full text-left group bg-base-100/80 backdrop-blur-sm border border-base-300 rounded-xl p-4 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 min-w-0">
                      <h3
                        class="font-semibold text-lg text-base-content group-hover:text-primary transition-colors truncate"
                      >
                        {{ result.displayName }}
                      </h3>
                      <div class="flex items-center gap-2 mt-1">
                        <span class="badge badge-sm badge-ghost text-xs">
                          {{ result.category }}
                        </span>
                        @if (result.entry.frontmatter.source) {
                          <span class="text-xs text-base-content/40">
                            {{ result.entry.frontmatter.source }}
                          </span>
                        }
                      </div>
                      @if (result.entry.html) {
                        <p
                          class="text-sm text-base-content/60 mt-2 line-clamp-2"
                        >
                          {{ getSnippet(result.entry.html) }}
                        </p>
                      }
                    </div>
                    <ng-icon
                      name="heroArrowRight"
                      class="text-xl text-base-content/30 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-1"
                    />
                  </div>
                </a>
              }
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `,
})
export class CompendiumView implements OnInit {
  private readonly i18n = inject(I18nService);
  protected readonly compendium = inject(CompendiumService);

  protected readonly t = this.i18n.useBundleT(compendiumBundle);

  protected readonly searchQuery = signal('');
  private readonly searchResults = signal<CompendiumSearchResult[]>([]);

  protected readonly displayedResults = computed(() => {
    const query = this.searchQuery().trim();
    if (query) {
      return this.searchResults();
    }
    // Show browse results when no search query
    return this.compendium.getAllResults(100);
  });

  constructor() {
    // Debounced search effect
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    effect(() => {
      const query = this.searchQuery();

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (!query.trim()) {
        this.searchResults.set([]);
        return;
      }

      timeoutId = setTimeout(() => {
        const results = this.compendium.search(query, 50);
        this.searchResults.set(results);
      }, 150);
    });
  }

  ngOnInit(): void {
    void this.compendium.load();
  }

  protected onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  protected getSnippet(html: string): string {
    // Remove headers, links, and extra whitespace
    const el = document.createElement('div');
    el.innerHTML = html;
    el.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) =>
      heading.remove(),
    );
    const cleaned = (el.textContent ?? '')
      .replace(/^#+\s+.*/gm, '') // Remove headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
      .replace(/[*_`]/g, '') // Remove formatting
      .replace(/\n+/g, ' ') // Collapse newlines
      .trim();

    // Return first ~200 chars
    if (cleaned.length <= 200) {
      return cleaned;
    }
    return cleaned.slice(0, 200).trim() + '...';
  }
}
