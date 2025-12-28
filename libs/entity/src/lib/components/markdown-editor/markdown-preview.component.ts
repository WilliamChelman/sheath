import {
  Component,
  ComponentRef,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  untracked,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { I18nService } from '@/i18n';
import { markdownEditorBundle } from './markdown-editor.i18n';
import { Entity } from '../../models/entity';
import { TocEntry } from '../../models/toc-entry';
import { ContentHighlighterService } from '../../services/content-highlighter.service';
import {
  MarkdownRenderer,
  RenderResult,
} from '../../services/markdown-renderer.service';

@Component({
  selector: 'app-markdown-preview',
  template: `
    <div class="markdown-preview" [class]="containerClass()">
      @if (content()) {
        <div #contentContainer class="markdown-content"></div>
      } @else if (showPlaceholder()) {
        <div class="text-base-content/40 italic">
          {{ t('previewPlaceholder') }}
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
      scroll-behavior: smooth;
      scroll-padding-top: 5rem;
    }

    :host ::ng-deep .search-highlight {
      background-color: color-mix(
        in oklch,
        var(--color-warning) 40%,
        transparent
      );
      border-radius: 2px;
      padding: 0 1px;
    }
  `,
  providers: [ContentHighlighterService],
})
export class MarkdownPreviewComponent {
  private readonly renderer = inject(MarkdownRenderer);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly highlighter = inject(ContentHighlighterService);
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.useBundleT(markdownEditorBundle);

  // Use signal-based viewChild query - reactive and updates when element appears
  private readonly contentContainer =
    viewChild<ElementRef<HTMLElement>>('contentContainer');

  content = input('');
  displayName = input('');
  showPlaceholder = input(true);
  padding = input(true);

  /** The entity being rendered, passed to embedded components */
  entity = input<Entity>();

  /** Search query to highlight in content */
  searchQuery = input('');

  protected readonly containerClass = computed(() => {
    return this.padding() ? 'pb-3 px-6 md:px-8' : '';
  });

  // TOC entries extracted from rendered content
  private readonly tocSignal = signal<TocEntry[]>([]);

  // Section contents for search filtering (heading ID -> text content)
  private readonly sectionContentsSignal = signal<Map<string, string>>(
    new Map(),
  );

  // Track component refs for cleanup
  private componentRefs: ComponentRef<unknown>[] = [];
  private cleanupHoverHandlers?: () => void;

  constructor() {
    // Register cleanup on destroy
    this.destroyRef.onDestroy(() => {
      this.cleanupComponents();
    });

    // Effect to handle async markdown parsing when content changes
    // Uses signal-based viewChild which is reactive
    effect(() => {
      const c = this.content();
      const displayName = this.displayName();
      const entity = this.entity();
      const container = this.contentContainer();

      if (!c || !container) {
        this.tocSignal.set([]);
        this.cleanupComponents();
        return;
      }

      // Parse markdown asynchronously using the renderer
      this.renderAsync(c, container.nativeElement, entity, displayName);
    });

    // Effect to handle search highlighting
    // Tracks tocSignal to re-run after content is rendered (renderAsync sets tocSignal)
    effect(() => {
      const query = this.searchQuery();
      // Track tocSignal so effect re-runs after async render completes
      this.tocSignal();
      const container = untracked(() => this.contentContainer());

      if (!container) {
        return;
      }

      this.highlighter.setContext(container.nativeElement);

      if (query.trim()) {
        this.highlighter.highlight(query);
      } else {
        this.highlighter.clear();
      }
    });
  }

  private async renderAsync(
    content: string,
    element: HTMLElement,
    entity: Entity | undefined,
    displayName: string,
  ): Promise<void> {
    // Cleanup previous components before re-rendering
    this.cleanupComponents();

    const result: RenderResult = await this.renderer.renderContentWithToc(
      content,
      element,
      this.viewContainerRef,
      entity,
      displayName,
    );

    this.componentRefs = result.componentRefs;
    this.cleanupHoverHandlers = result.cleanupHoverHandlers;
    this.tocSignal.set(result.toc);

    // Extract section contents for search filtering
    this.sectionContentsSignal.set(this.extractSectionContents(element));
  }

  /**
   * Extract text content for each section (heading ID -> content between this heading and the next).
   */
  private extractSectionContents(container: HTMLElement): Map<string, string> {
    const contents = new Map<string, string>();
    const headings = container.querySelectorAll(
      'h2[id], h3[id], h4[id], h5[id], h6[id]',
    );

    headings.forEach((heading, index) => {
      const id = heading.getAttribute('id');
      if (!id) return;

      const nextHeading = headings[index + 1];
      const textParts: string[] = [];

      // Collect text from siblings until the next heading
      let sibling = heading.nextElementSibling;
      while (sibling && sibling !== nextHeading) {
        const text = sibling.textContent?.trim();
        if (text) {
          textParts.push(text);
        }
        sibling = sibling.nextElementSibling;
      }

      contents.set(id, textParts.join(' '));
    });

    return contents;
  }

  private cleanupComponents(): void {
    this.cleanupHoverHandlers?.();
    this.cleanupHoverHandlers = undefined;
    this.componentRefs.forEach((ref) => ref.destroy());
    this.componentRefs = [];
  }

  /** Exposed for consumers who need TOC entries (e.g., sidebar navigation) */
  readonly tocEntries = computed((): TocEntry[] => {
    return this.tocSignal();
  });

  /** Exposed for consumers who need section contents (e.g., search filtering) */
  readonly sectionContents = computed((): Map<string, string> => {
    return this.sectionContentsSignal();
  });
}
