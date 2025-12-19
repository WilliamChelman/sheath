import { BadgeComponent } from '@/ui/badge';
import { ButtonDirective } from '@/ui/button';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowRight, heroDocumentText } from '@ng-icons/heroicons/outline';
import type { CompendiumSearchResult } from '../models/compendium.model';
import {
  COMPENDIUM_ICONS,
  getCompendiumTypeIcon,
} from '../utils/compendium-icons';

@Component({
  selector: 'app-compendium-results',
  standalone: true,
  imports: [RouterLink, NgIcon, BadgeComponent, ButtonDirective],
  viewProviders: [
    provideIcons({ heroDocumentText, heroArrowRight, ...COMPENDIUM_ICONS }),
  ],
  template: `
    <div class="flex-1 min-w-0">
      <div class="space-y-3">
        @if (results().length === 0 && hasActiveSearch()) {
          <div
            class="text-center py-12 bg-base-200/50 rounded-2xl border border-base-300"
          >
            <ng-icon
              name="heroDocumentText"
              class="text-5xl text-base-content/30 mx-auto"
            />
            <p class="mt-4 text-base-content/60">
              {{ noResultsText() }}
            </p>
          </div>
        } @else {
          @for (result of results().slice(0, resultsLimit()); track result.id) {
            <a
              [routerLink]="['/compendium', result.id]"
              class="block w-full text-left group bg-base-100/80 backdrop-blur-sm border border-base-300 rounded-xl p-4 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
            >
              <div class="flex items-start justify-between gap-4">
                <!-- Type Icon -->
                <div
                  class="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                >
                  <ng-icon
                    [name]="getTypeIcon(result.entry.frontmatter.type)"
                    class="text-xl text-primary"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <h3
                    class="font-semibold text-lg text-base-content group-hover:text-primary transition-colors truncate"
                  >
                    {{ result.displayName }}
                  </h3>
                  <div class="flex items-center gap-2 mt-1 flex-wrap">
                    <app-badge variant="ghost" size="sm" [class]="'text-xs'">
                      {{ result.category }}
                    </app-badge>
                    @if (result.entry.frontmatter.source) {
                      <span class="text-xs text-base-content/40">
                        {{ result.entry.frontmatter.source }}
                      </span>
                    }
                  </div>
                  @if (result.entry.html) {
                    <p class="text-sm text-base-content/60 mt-2 line-clamp-2">
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

          <!-- Load More Button -->
          @if (results().length > resultsLimit()) {
            <div class="text-center pt-4">
              <button
                type="button"
                appButton="primary"
                appButtonOutline
                (click)="loadMore()"
              >
                Load more ({{ results().length - resultsLimit() }} remaining)
              </button>
            </div>
          }
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompendiumResultsComponent {
  readonly results = input.required<readonly CompendiumSearchResult[]>();
  readonly hasActiveSearch = input<boolean>(false);
  readonly noResultsText = input<string>('No results found.');

  protected readonly resultsLimit = signal(50);

  protected loadMore(): void {
    this.resultsLimit.update((limit) => limit + 50);
  }

  protected getSnippet(html: string): string {
    // Remove headers, links, and extra whitespace
    const el = document.createElement('div');
    el.innerHTML = html;
    el.querySelector('h1, h2, h3, h4, h5, h6')?.remove();
    const cleaned = (el.textContent ?? '').trim();

    // Return first ~200 chars
    if (cleaned.length <= 200) {
      return cleaned;
    }
    return cleaned.slice(0, 200).trim() + '...';
  }

  /** Reset results limit (called from parent when search/filters change) */
  resetLimit(): void {
    this.resultsLimit.set(50);
  }

  protected getTypeIcon(type: string | undefined): string {
    return getCompendiumTypeIcon(type);
  }
}
