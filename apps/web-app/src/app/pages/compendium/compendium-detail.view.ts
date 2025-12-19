import { I18nService } from '@/i18n';
import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeft,
  heroTag,
  heroFolder,
} from '@ng-icons/heroicons/outline';
import { PageTitleDirective } from '../../common/page-title/page-title.directive';
import { BadgeComponent } from '@/ui/badge';
import { ButtonDirective } from '@/ui/button';
import { compendiumBundle } from './compendium.i18n';
import { CompendiumTocComponent } from './components/compendium-toc.component';
import type { CompendiumEntry } from './models/compendium.model';
import {
  CompendiumHtmlProcessorService,
  type TocEntry,
} from './services/compendium-html-processor.service';
import { CompendiumService } from './services/compendium.service';
import {
  COMPENDIUM_ICONS,
  getCompendiumTypeIcon,
} from './utils/compendium-icons';

@Component({
  selector: 'app-compendium-detail-view',
  imports: [
    RouterLink,
    NgIcon,
    PageTitleDirective,
    BadgeComponent,
    ButtonDirective,
    CompendiumTocComponent,
  ],
  viewProviders: [
    provideIcons({ heroArrowLeft, heroTag, heroFolder, ...COMPENDIUM_ICONS }),
  ],
  encapsulation: ViewEncapsulation.None,
  styles: `
    @reference '../../../styles.css';

    app-compendium-detail-view .stat-block-table {
      @apply border border-base-300 rounded-lg overflow-hidden shadow-sm;
    }

    /* =============================================================================
       Stat Block Tables
       ============================================================================= */

    app-compendium-detail-view .stat-block-table tr:first-child {
      @apply bg-gradient-to-r from-primary/15 to-secondary/15;
    }

    app-compendium-detail-view .stat-block-cell {
      @apply align-middle;
    }

    app-compendium-detail-view .stat-cell-content {
      @apply py-1;
    }

    app-compendium-detail-view .stat-value {
      @apply font-mono;
    }

    app-compendium-detail-view .stat-label {
      @apply whitespace-nowrap;
    }

    /* Ability Cards */
    app-compendium-detail-view .ability-card {
      @apply shadow-sm transition-shadow hover:shadow-md;
    }

    app-compendium-detail-view .ability-card-title {
      @apply border-b border-base-300/30 pb-2;
    }

    app-compendium-detail-view .ability-info-table {
      @apply bg-base-200/30 rounded;
    }

    /* Power Roll Tiers */
    app-compendium-detail-view .power-roll-item {
      @apply relative pl-4;
    }

    app-compendium-detail-view .power-roll-item::before {
      content: '•';
      @apply absolute left-0 text-base-content/40;
    }

    app-compendium-detail-view .power-roll-tier-1::before {
      @apply text-error;
    }

    app-compendium-detail-view .power-roll-tier-2::before {
      @apply text-warning;
    }

    app-compendium-detail-view .power-roll-tier-3::before {
      @apply text-success;
    }

    /* Enhance strong elements in ability cards for tier results */
    app-compendium-detail-view .ability-card strong {
      @apply text-base-content font-semibold;
    }

    /* Keywords line styling */
    app-compendium-detail-view .keywords-line strong {
      @apply font-medium;
    }

    /* Effect text styling */
    app-compendium-detail-view .ability-effect strong:first-child {
      @apply text-primary;
    }

    /* =============================================================================
       Compendium Content Container Styles
       ============================================================================= */

    /* Content wrapper for processed HTML */
    app-compendium-detail-view .compendium-content {
      @apply text-base-content;
    }

    /* Headings within compendium content */
    app-compendium-detail-view .compendium-content h1,
    app-compendium-detail-view .compendium-content h2,
    app-compendium-detail-view .compendium-content h3,
    app-compendium-detail-view .compendium-content h4,
    app-compendium-detail-view .compendium-content h5,
    app-compendium-detail-view .compendium-content h6 {
      @apply text-base-content font-bold tracking-tight;
    }

    app-compendium-detail-view .compendium-content h1 {
      @apply text-3xl mt-6 mb-3;
    }
    app-compendium-detail-view .compendium-content h2 {
      @apply text-2xl mt-5 mb-3;
    }
    app-compendium-detail-view .compendium-content h3 {
      @apply text-xl mt-4 mb-2;
    }
    app-compendium-detail-view .compendium-content h4 {
      @apply text-lg mt-4 mb-2;
    }
    app-compendium-detail-view .compendium-content h5,
    app-compendium-detail-view .compendium-content h6 {
      @apply text-base mt-3 mb-2;
    }

    /* Paragraphs */
    app-compendium-detail-view .compendium-content p {
      @apply text-base-content/80 leading-relaxed my-2;
    }

    /* Emphasis and strong */
    app-compendium-detail-view .compendium-content em {
      @apply italic text-base-content/70;
    }

    app-compendium-detail-view .compendium-content strong {
      @apply font-semibold text-base-content;
    }

    /* Links */
    app-compendium-detail-view .compendium-content a {
      @apply text-primary hover:text-primary/80 underline underline-offset-2;
    }

    /* Generic blockquotes (not ability cards) */
    app-compendium-detail-view
      .compendium-content
      blockquote:not(.ability-card) {
      @apply border-l-4 border-base-300 pl-4 py-2 my-4 bg-base-200/30 rounded-r-lg italic text-base-content/70;
    }

    /* Generic tables (not stat blocks or ability tables) */
    app-compendium-detail-view
      .compendium-content
      table:not(.stat-block-table):not(.ability-info-table) {
      @apply w-full my-4 border-collapse;
    }

    app-compendium-detail-view
      .compendium-content
      table:not(.stat-block-table):not(.ability-info-table)
      th {
      @apply bg-base-200 text-base-content font-semibold px-3 py-2 text-left border border-base-300;
    }

    app-compendium-detail-view
      .compendium-content
      table:not(.stat-block-table):not(.ability-info-table)
      td {
      @apply px-3 py-2 text-base-content/80 border border-base-300;
    }

    app-compendium-detail-view
      .compendium-content
      table:not(.stat-block-table):not(.ability-info-table)
      tr:nth-child(even) {
      @apply bg-base-200/30;
    }

    /* Lists */
    app-compendium-detail-view .compendium-content ul:not(.power-roll-list) {
      @apply list-disc pl-6 my-3 space-y-1 text-base-content/80;
    }

    app-compendium-detail-view .compendium-content ol:not(.power-roll-list) {
      @apply list-decimal pl-6 my-3 space-y-1 text-base-content/80;
    }

    app-compendium-detail-view .compendium-content li {
      @apply leading-relaxed;
    }

    /* Nested lists */
    app-compendium-detail-view .compendium-content li ul,
    app-compendium-detail-view .compendium-content li ol {
      @apply mt-1 mb-0;
    }

    /* Code elements */
    app-compendium-detail-view .compendium-content code {
      @apply bg-base-300 px-1.5 py-0.5 rounded text-sm font-mono text-base-content;
    }

    app-compendium-detail-view .compendium-content pre {
      @apply bg-base-300 p-4 rounded-lg overflow-x-auto my-4 border border-base-300;
    }

    app-compendium-detail-view .compendium-content pre code {
      @apply bg-transparent p-0;
    }

    /* Horizontal rules */
    app-compendium-detail-view .compendium-content hr {
      @apply my-8 border-t border-base-300/50;
    }

    /* Images */
    app-compendium-detail-view .compendium-content img {
      @apply rounded-lg shadow-sm max-w-full h-auto my-4;
    }

    /* Headings with IDs (for TOC linking) */
    app-compendium-detail-view .compendium-content h2[id],
    app-compendium-detail-view .compendium-content h3[id],
    app-compendium-detail-view .compendium-content h4[id],
    app-compendium-detail-view .compendium-content h5[id],
    app-compendium-detail-view .compendium-content h6[id] {
      scroll-margin-top: 5rem;
    }

    /* Smooth scroll behavior for TOC navigation - scoped to when this component is present */
    app-compendium-detail-view {
      scroll-behavior: smooth;
      scroll-padding-top: 5rem;
    }
  `,
  template: `
    <div
      class="min-h-screen bg-linear-to-br from-base-300 via-base-100 to-base-200"
    >
      <div class="container mx-auto px-4 py-8 max-w-7xl">
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
            <a routerLink="/compendium" appButton="primary" class="mt-4">
              {{ t('detail.backToSearch') }}
            </a>
          </div>
        }

        <!-- Content with TOC -->
        @if (entry(); as currentEntry) {
          <div class="flex gap-8">
            <!-- Main Content -->
            <article
              class="flex-1 min-w-0 bg-base-100/80 backdrop-blur-sm border border-base-300 rounded-2xl overflow-hidden"
            >
              <!-- Header -->
              <div
                class="bg-linear-to-r from-primary/10 to-secondary/10 p-6 border-b border-base-300"
              >
                <div class="flex items-start gap-4">
                  <!-- Type Icon -->
                  <div
                    class="shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl bg-primary/20 flex items-center justify-center"
                  >
                    <ng-icon
                      [name]="getTypeIcon(currentEntry.frontmatter.type)"
                      class="text-3xl md:text-4xl text-primary"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h1
                      appPageTitle
                      class="text-3xl md:text-4xl font-black tracking-tight text-base-content"
                    >
                      {{ displayName() }}
                    </h1>
                    <div class="flex flex-wrap items-center gap-3 mt-3">
                      @if (currentEntry.frontmatter.type) {
                        <app-badge color="primary" class="gap-1">
                          {{
                            compendium.formatFacetLabel(
                              'type',
                              currentEntry.frontmatter.type
                            )
                          }}
                        </app-badge>
                      }
                      @if (category()) {
                        <app-badge variant="ghost" class="gap-1">
                          <ng-icon name="heroFolder" class="text-sm" />
                          {{ category() }}
                        </app-badge>
                      }
                      @if (currentEntry.frontmatter.source) {
                        <span class="text-sm text-base-content/50">
                          {{ t('detail.source') }}:
                          {{ currentEntry.frontmatter.source }}
                        </span>
                      }
                    </div>
                  </div>
                </div>
              </div>

              <!-- Rendered Content -->
              <div
                class="compendium-content p-6 md:p-8"
                [innerHTML]="safeHtml()"
              ></div>
            </article>

            <!-- Floating TOC (visible on xl screens) -->
            @if (tocEntries().length > 1) {
              <aside class="hidden xl:block w-64 shrink-0">
                <app-compendium-toc
                  [entries]="tocEntries()"
                  [title]="t('detail.tableOfContents')"
                />
              </aside>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class CompendiumDetailView implements OnInit {
  private readonly i18n = inject(I18nService);
  protected readonly compendium = inject(CompendiumService);
  private readonly htmlProcessor = inject(CompendiumHtmlProcessorService);
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
      return this.compendium.formatFacetLabel('type', parts[1]);
    }
    return '';
  });

  protected readonly processedContent = computed(() => {
    const e = this.entry();
    if (!e) return { html: '', toc: [] as TocEntry[] };
    return this.htmlProcessor.processWithToc(e.html, this.displayName());
  });

  protected readonly safeHtml = computed((): SafeHtml => {
    const content = this.processedContent();
    return this.sanitizer.bypassSecurityTrustHtml(content.html);
  });

  protected readonly tocEntries = computed((): TocEntry[] => {
    return this.processedContent().toc;
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

  protected getTypeIcon(type: string | undefined): string {
    return getCompendiumTypeIcon(type);
  }
}
