import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorListBullets,
  phosphorCaretUp,
  phosphorMagnifyingGlass,
  phosphorX,
} from '@ng-icons/phosphor-icons/regular';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { I18nService } from '@/i18n';
import { compendiumDetailBundle } from '../compendium-detail.i18n';
import type { TocEntry } from '../models/toc-entry';

@Component({
  selector: 'app-compendium-toc',
  standalone: true,
  imports: [NgIcon, RouterLink],
  viewProviders: [
    provideIcons({
      phosphorListBullets,
      phosphorCaretUp,
      phosphorMagnifyingGlass,
      phosphorX,
    }),
  ],
  template: `
    @if (entries().length > 0) {
      <nav
        class="toc-container sticky top-8 max-h-[calc(100vh-4rem)] overflow-hidden backdrop-blur-sm border border-base-300/50 rounded-xl shadow-lg"
      >
        <!-- Header -->
        <div
          class="flex items-center gap-2 px-3 py-2 bg-base-200/60 border-b border-base-300/50"
        >
          <ng-icon
            name="phosphorListBullets"
            class="text-lg text-primary shrink-0"
          />
          <span class="font-semibold text-base-content text-sm">{{
            title()
          }}</span>
        </div>

        <!-- Search Input -->
        <div class="px-3 py-2 border-b border-base-300/50">
          <label
            class="input input-sm input-bordered flex items-center gap-2 bg-base-100/50"
          >
            <ng-icon
              name="phosphorMagnifyingGlass"
              class="text-base-content/50"
            />
            <input
              type="text"
              class="grow text-sm bg-transparent"
              [placeholder]="t('detail.searchPlaceholder')"
              [value]="searchInput()"
              (input)="onSearchInput($any($event.target).value)"
            />
            @if (searchInput()) {
              <button
                class="btn btn-ghost btn-xs btn-circle"
                (click)="clearSearch()"
                [attr.aria-label]="t('detail.searchClear')"
              >
                <ng-icon name="phosphorX" class="text-sm" />
              </button>
            }
          </label>
        </div>

        <!-- No results message -->
        @if (hasNoResults()) {
          <div class="px-3 py-4 text-center text-base-content/50 text-sm">
            {{ t('detail.searchNoResults') }}
          </div>
        }

        <!-- TOC List -->
        <div class="overflow-y-auto max-h-[calc(100vh-12rem)] py-2 toc-scroll">
          <ul class="space-y-0.5">
            @for (entry of filteredEntries(); track entry.id) {
              <li>
                <a
                  [routerLink]="[]"
                  [queryParamsHandling]="'merge'"
                  [fragment]="entry.id"
                  class="toc-link block px-3 py-1.5 text-sm transition-all duration-200 hover:bg-primary/10 hover:text-primary border-l-2"
                  [class.toc-link-active]="activeId() === entry.id"
                  [class.border-transparent]="activeId() !== entry.id"
                  [class.border-l-primary]="activeId() === entry.id"
                  [class.text-primary]="activeId() === entry.id"
                  [class.font-medium]="activeId() === entry.id"
                  [style.padding-left.rem]="0.75 + (entry.level - 2) * 0.75"
                  (click)="scrollToHeading($event, entry.id)"
                >
                  <span
                    class="line-clamp-2"
                    [class]="
                      entry.level > 2
                        ? 'text-base-content/70'
                        : 'text-base-content/90'
                    "
                    >{{ entry.text }}</span
                  >
                </a>
              </li>
            }
          </ul>
        </div>

        <!-- Back to Top -->
        @if (showBackToTop()) {
          <div class="border-t border-base-300/50 p-2">
            <button
              class="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-base-content/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
              (click)="scrollToTop()"
            >
              <ng-icon name="phosphorCaretUp" class="text-sm" />
              <span>Back to top</span>
            </button>
          </div>
        }
      </nav>
    }
  `,
  styles: `
    .toc-container {
      background-color: color-mix(
        in oklch,
        var(--color-base-100) 95%,
        transparent
      );
      min-width: 200px;
    }

    .toc-link-active {
      background-color: color-mix(
        in oklch,
        var(--color-primary) 15%,
        transparent
      );
    }

    .toc-scroll {
      scrollbar-width: thin;
      scrollbar-color: color-mix(
          in oklch,
          var(--color-base-content) 20%,
          transparent
        )
        transparent;
    }

    .toc-scroll::-webkit-scrollbar {
      width: 4px;
    }

    .toc-scroll::-webkit-scrollbar-track {
      background: transparent;
    }

    .toc-scroll::-webkit-scrollbar-thumb {
      background: color-mix(
        in oklch,
        var(--color-base-content) 20%,
        transparent
      );
      border-radius: 4px;
    }

    .toc-scroll::-webkit-scrollbar-thumb:hover {
      background: color-mix(
        in oklch,
        var(--color-base-content) 30%,
        transparent
      );
    }
  `,
})
export class CompendiumTocComponent implements OnInit, OnDestroy {
  private readonly elementRef = inject(ElementRef);
  private readonly i18n = inject(I18nService);

  protected readonly t = this.i18n.useBundleT(compendiumDetailBundle);

  /** TOC entries to display */
  readonly entries = input.required<TocEntry[]>();

  /** Title for the TOC */
  readonly title = input<string>('Contents');

  /** Section contents for content-based filtering (heading ID -> text content) */
  readonly sectionContents = input<Map<string, string>>(new Map());

  /** Search query - two-way bindable for parent coordination */
  readonly searchQuery = model('');

  /** Local search input for immediate feedback */
  protected readonly searchInput = signal('');

  /** Debounced search for filtering */
  private readonly debouncedSearch = toSignal(
    toObservable(this.searchInput).pipe(
      debounceTime(150),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );

  /** Filtered entries based on search (checks both heading text and section content) */
  readonly filteredEntries = computed(() => {
    const query = this.debouncedSearch().toLowerCase().trim();
    const allEntries = this.entries();

    if (!query) return allEntries;

    const contents = this.sectionContents();

    return allEntries.filter((entry) => {
      // Check heading text
      if (entry.text.toLowerCase().includes(query)) {
        return true;
      }
      // Check section content
      const sectionContent = contents.get(entry.id);
      return sectionContent?.toLowerCase().includes(query) ?? false;
    });
  });

  /** Whether search has no results */
  readonly hasNoResults = computed(() => {
    const query = this.debouncedSearch();
    return query.trim().length > 0 && this.filteredEntries().length === 0;
  });

  /** Currently active heading ID */
  readonly activeId = signal<string | null>(null);

  /** Whether to show back to top button */
  readonly showBackToTop = computed(() => {
    const id = this.activeId();
    const allEntries = this.entries();
    if (!id || allEntries.length === 0) return false;
    // Show if we're past the first heading
    return allEntries.findIndex((e) => e.id === id) > 0;
  });

  private intersectionObserver: IntersectionObserver | null = null;

  constructor() {
    // Sync searchInput when searchQuery is set from parent (e.g., from URL param)
    effect(() => {
      const query = this.searchQuery();
      // Only sync if the values differ (to avoid loops)
      const currentInput = untracked(() => this.searchInput());
      if (query !== currentInput) {
        this.searchInput.set(query);
      }
    });
  }

  ngOnInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
  }

  /**
   * Set up intersection observer to track which heading is currently visible.
   */
  private setupIntersectionObserver(): void {
    // Small delay to ensure headings are in the DOM
    setTimeout(() => {
      const headings = document.querySelectorAll(
        '.compendium-content h2[id], .compendium-content h3[id], .compendium-content h4[id], .compendium-content h5[id], .compendium-content h6[id]',
      );

      if (headings.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          // Find the first visible heading
          const visibleEntries = entries.filter((e) => e.isIntersecting);
          if (visibleEntries.length > 0) {
            // Sort by position and get the topmost
            visibleEntries.sort(
              (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
            );
            this.activeId.set(visibleEntries[0].target.id);
          }
        },
        {
          rootMargin: '-80px 0px -60% 0px',
          threshold: 0,
        },
      );

      this.intersectionObserver = observer;

      headings.forEach((heading) => {
        observer.observe(heading);
      });
    }, 100);
  }

  /**
   * Smooth scroll to a heading.
   */
  scrollToHeading(event: Event, id: string): void {
    this.activeId.set(id);
  }

  /**
   * Scroll back to top of page.
   */
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    this.activeId.set(null);
  }

  /**
   * Handle search input changes.
   */
  protected onSearchInput(value: string): void {
    this.searchInput.set(value);
    this.searchQuery.set(value);
  }

  /**
   * Clear the search input.
   */
  protected clearSearch(): void {
    this.searchInput.set('');
    this.searchQuery.set('');
  }
}
