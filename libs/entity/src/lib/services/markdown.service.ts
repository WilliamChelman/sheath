import { inject, Injectable } from '@angular/core';
import { marked } from 'marked';
import { createComponentExtension } from '../components/obsidian-editor/extensions/component-marked-extension';
import { createWikilinkExtension } from '../components/obsidian-editor/extensions/wikilink-marked-extension';
import { EntityService } from './entity.service';
import {
  EntityHtmlProcessorService,
  ProcessedContent,
} from './entity-html-processor.service';

/**
 * Centralized service for rendering markdown with consistent extensions and processing.
 * Configures marked with wikilink support, component blocks, and applies HTML post-processing.
 */
@Injectable({ providedIn: 'root' })
export class MarkdownService {
  private readonly entityService = inject(EntityService);
  private readonly htmlProcessor = inject(EntityHtmlProcessorService);
  private initialized = false;

  /**
   * Ensure marked is configured with extensions.
   * Called lazily on first render to avoid issues with service initialization order.
   */
  private ensureInitialized(): void {
    if (this.initialized) return;

    marked.use(
      createWikilinkExtension({
        entityService: this.entityService,
        basePath: 'compendium',
      }),
      createComponentExtension(),
    );

    this.initialized = true;
  }

  /**
   * Render markdown content to processed HTML.
   * @param content Raw markdown content
   * @param displayName Optional display name for removing duplicate titles
   * @returns Processed HTML string
   */
  async render(content: string, displayName = ''): Promise<string> {
    if (!content) return '';

    this.ensureInitialized();
    const rawHtml = await marked.parse(content, { async: true });
    return this.htmlProcessor.process(rawHtml, displayName);
  }

  /**
   * Render markdown content to processed HTML with TOC entries.
   * @param content Raw markdown content
   * @param displayName Optional display name for removing duplicate titles
   * @returns Processed content with HTML and TOC entries
   */
  async renderWithToc(
    content: string,
    displayName = '',
  ): Promise<ProcessedContent> {
    if (!content) return { html: '', toc: [] };

    this.ensureInitialized();
    const rawHtml = await marked.parse(content, { async: true });
    return this.htmlProcessor.processWithToc(rawHtml, displayName);
  }
}
