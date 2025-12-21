import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { Entity } from '../../models/entity';
import { TocEntry } from '../../models/toc-entry';
import { ProcessedContent } from '../../services/entity-html-processor.service';
import { MarkdownService } from '../../services/markdown.service';
import { HydrateComponentsDirective } from './extensions/hydrate-components.directive';

@Component({
  selector: 'app-markdown-preview',
  imports: [HydrateComponentsDirective],
  template: `
    <div class="markdown-preview" [class]="containerClass()">
      @if (content()) {
        <div
          class="markdown-content"
          [innerHTML]="safeHtml()"
          appHydrateComponents
          [entity]="entity()"
        ></div>
      } @else if (showPlaceholder()) {
        <div class="text-base-content/40 italic">
          Preview will appear here...
        </div>
      }
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    @reference '../../../../../ui/src/tailwind.css';

    app-markdown-preview {
      display: block;
      height: 100%;
      overflow-y: auto;
      scroll-behavior: smooth;
      scroll-padding-top: 5rem;
    }
  `,
})
export class MarkdownPreviewComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly markdownService = inject(MarkdownService);

  content = input('');
  displayName = input('');
  showPlaceholder = input(true);
  padding = input(true);

  /** The entity being rendered, passed to embedded components */
  entity = input<Entity>();

  protected readonly containerClass = computed(() => {
    return this.padding() ? 'p-6 md:p-8' : '';
  });

  // Async processed content stored in a signal
  private readonly processedContent = signal<ProcessedContent>({
    html: '',
    toc: [],
  });

  constructor() {
    // Effect to handle async markdown parsing when content changes
    effect(() => {
      const c = this.content();
      const displayName = this.displayName();

      if (!c) {
        this.processedContent.set({ html: '', toc: [] });
        return;
      }

      // Parse markdown asynchronously using the centralized service
      this.parseMarkdownAsync(c, displayName);
    });
  }

  private async parseMarkdownAsync(
    content: string,
    displayName: string,
  ): Promise<void> {
    const processed = await this.markdownService.renderWithToc(
      content,
      displayName,
    );
    this.processedContent.set(processed);
  }

  /** Exposed for consumers who need TOC entries (e.g., sidebar navigation) */
  readonly tocEntries = computed((): TocEntry[] => {
    return this.processedContent().toc;
  });

  protected readonly safeHtml = computed((): SafeHtml => {
    return this.sanitizer.bypassSecurityTrustHtml(this.processedContent().html);
  });
}
