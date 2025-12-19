import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroListBullet, heroChevronUp } from '@ng-icons/heroicons/outline';
import type { TocEntry } from '../services/compendium-html-processor.service';

@Component({
  selector: 'app-compendium-toc',
  standalone: true,
  imports: [NgIcon, RouterLink],
  viewProviders: [provideIcons({ heroListBullet, heroChevronUp })],
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
            name="heroListBullet"
            class="text-lg text-primary shrink-0"
          />
          <span class="font-semibold text-base-content text-sm">{{
            title()
          }}</span>
        </div>

        <!-- TOC List -->
        <div class="overflow-y-auto max-h-[calc(100vh-8rem)] py-2 toc-scroll">
          <ul class="space-y-0.5">
            @for (entry of entries(); track entry.id) {
              <li>
                <a
                  [routerLink]="[]"
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
              <ng-icon name="heroChevronUp" class="text-sm" />
              <span>Back to top</span>
            </button>
          </div>
        }
      </nav>
    }
  `,
  styles: `
    .toc-container {
      background-color: oklch(var(--b1) / 0.95);
      min-width: 200px;
    }

    .toc-link-active {
      background-color: oklch(var(--p) / 0.15);
    }

    .toc-scroll {
      scrollbar-width: thin;
      scrollbar-color: oklch(var(--bc) / 0.2) transparent;
    }

    .toc-scroll::-webkit-scrollbar {
      width: 4px;
    }

    .toc-scroll::-webkit-scrollbar-track {
      background: transparent;
    }

    .toc-scroll::-webkit-scrollbar-thumb {
      background: oklch(var(--bc) / 0.2);
      border-radius: 4px;
    }

    .toc-scroll::-webkit-scrollbar-thumb:hover {
      background: oklch(var(--bc) / 0.3);
    }
  `,
})
export class CompendiumTocComponent implements OnInit, OnDestroy {
  private readonly elementRef = inject(ElementRef);

  /** TOC entries to display */
  readonly entries = input.required<TocEntry[]>();

  /** Title for the TOC */
  readonly title = input<string>('Contents');

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
}
