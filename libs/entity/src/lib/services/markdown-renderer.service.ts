import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  signal,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { marked } from 'marked';
import { firstValueFrom } from 'rxjs';
import { createComponentExtension } from '../components/markdown-editor/extensions/component-marked-extension';
import { createEmbedExtension } from '../components/markdown-editor/extensions/embed-marked-extension';
import { createWikilinkExtension } from '../components/markdown-editor/extensions/wikilink-marked-extension';
import { WikilinkPreviewPanelComponent } from '../components/markdown-editor/wikilink-preview-panel.component';
import { Entity } from '../models/entity';
import { TocEntry } from '../models/toc-entry';
import {
  EntityHtmlProcessorService,
  ProcessedContent,
} from './entity-html-processor.service';
import { EntityService } from './entity.service';
import { MarkdownComponentRegistry } from './markdown-component.registry';

/**
 * Result of a render operation, returned for cleanup purposes.
 */
export interface RenderResult {
  /** Component refs created during hydration - caller must track these for cleanup */
  componentRefs: ComponentRef<unknown>[];
  /** TOC entries extracted from headings (only populated by renderWithToc) */
  toc: TocEntry[];
  /** Cleanup function to remove wikilink hover handlers */
  cleanupHoverHandlers?: () => void;
}

/**
 * Centralized service for rendering markdown content directly into DOM elements.
 * Consolidates markdown parsing, HTML processing, and component hydration.
 *
 * @example
 * ```typescript
 * // In a component
 * private readonly renderer = inject(MarkdownRenderer);
 * private readonly viewContainerRef = inject(ViewContainerRef);
 *
 * async ngAfterViewInit() {
 *   const element = this.elementRef.nativeElement;
 *   this.renderResult = await this.renderer.render(this.entity(), element, this.viewContainerRef);
 * }
 *
 * ngOnDestroy() {
 *   this.renderResult?.componentRefs.forEach(ref => ref.destroy());
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class MarkdownRenderer {
  private readonly entityService = inject(EntityService);
  private readonly htmlProcessor = inject(EntityHtmlProcessorService);
  private readonly registry = inject(MarkdownComponentRegistry);
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);
  private initialized = false;

  // Hover preview state
  private previewPanelRef: ComponentRef<WikilinkPreviewPanelComponent> | null =
    null;
  private readonly isMetaKeyPressed = signal(false);
  private readonly isHoveringLink = signal(false);
  private readonly isHoveringPanel = signal(false);
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private currentEntityId: string | null = null;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private keyupHandler: ((e: KeyboardEvent) => void) | null = null;
  private keyHandlersAttached = false;

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
      createEmbedExtension({
        entityService: this.entityService,
        basePath: 'compendium',
      }),
      createComponentExtension(),
    );

    this.initialized = true;
  }

  /**
   * Render an entity's markdown content directly into an HTMLElement.
   * @param entity The entity whose content should be rendered
   * @param element The HTMLElement to render into
   * @param viewContainerRef Optional ViewContainerRef for hydrating embedded components
   * @returns RenderResult containing component refs for cleanup
   */
  async render(
    entity: Entity,
    element: HTMLElement,
    viewContainerRef?: ViewContainerRef,
  ): Promise<RenderResult> {
    return this.renderContent(
      entity.content ?? '',
      element,
      viewContainerRef,
      entity,
      entity.name,
    );
  }

  /**
   * Render markdown content directly into an HTMLElement.
   * @param content Raw markdown content string
   * @param element The HTMLElement to render into
   * @param viewContainerRef Optional ViewContainerRef for hydrating embedded components
   * @param entity Optional entity context for embedded components
   * @param displayName Optional display name for removing duplicate titles
   * @returns RenderResult containing component refs for cleanup
   */
  async renderContent(
    content: string,
    element: HTMLElement,
    viewContainerRef?: ViewContainerRef,
    entity?: Entity,
    displayName = '',
  ): Promise<RenderResult> {
    return this.renderContentInternal(
      content,
      element,
      viewContainerRef,
      entity,
      displayName,
      new Set(),
    );
  }

  /**
   * Internal method for rendering content with circular reference tracking.
   * @param content Raw markdown content string
   * @param element The HTMLElement to render into
   * @param viewContainerRef Optional ViewContainerRef for hydrating embedded components
   * @param entity Optional entity context for embedded components
   * @param displayName Optional display name for removing duplicate titles
   * @param embeddingIds Set of entity IDs currently being embedded (for circular reference detection)
   * @returns RenderResult containing component refs for cleanup
   */
  private async renderContentInternal(
    content: string,
    element: HTMLElement,
    viewContainerRef?: ViewContainerRef,
    entity?: Entity,
    displayName = '',
    embeddingIds: Set<string> = new Set(),
  ): Promise<RenderResult> {
    if (!content) {
      element.innerHTML = '';
      return { componentRefs: [], toc: [], cleanupHoverHandlers: undefined };
    }

    this.ensureInitialized();

    const rawHtml = await marked.parse(content, { async: true });
    const processedHtml = this.htmlProcessor.process(rawHtml, displayName);

    element.innerHTML = processedHtml;

    const componentRefs = viewContainerRef
      ? this.hydrateComponents(element, viewContainerRef, entity)
      : [];

    const embedComponentRefs = viewContainerRef
      ? await this.hydrateEmbeds(
          element,
          viewContainerRef,
          entity,
          embeddingIds,
        )
      : [];

    // Attach wikilink hover handlers
    const cleanupHoverHandlers = this.attachWikilinkHoverHandlers(element);

    return {
      componentRefs: [...componentRefs, ...embedComponentRefs],
      toc: [],
      cleanupHoverHandlers,
    };
  }

  /**
   * Render an entity's markdown content with TOC extraction.
   * @param entity The entity whose content should be rendered
   * @param element The HTMLElement to render into
   * @param viewContainerRef Optional ViewContainerRef for hydrating embedded components
   * @returns RenderResult containing component refs and TOC entries
   */
  async renderWithToc(
    entity: Entity,
    element: HTMLElement,
    viewContainerRef?: ViewContainerRef,
  ): Promise<RenderResult> {
    return this.renderContentWithToc(
      entity.content ?? '',
      element,
      viewContainerRef,
      entity,
      entity.name,
    );
  }

  /**
   * Render markdown content with TOC extraction.
   * @param content Raw markdown content string
   * @param element The HTMLElement to render into
   * @param viewContainerRef Optional ViewContainerRef for hydrating embedded components
   * @param entity Optional entity context for embedded components
   * @param displayName Optional display name for removing duplicate titles
   * @returns RenderResult containing component refs and TOC entries
   */
  async renderContentWithToc(
    content: string,
    element: HTMLElement,
    viewContainerRef?: ViewContainerRef,
    entity?: Entity,
    displayName = '',
  ): Promise<RenderResult> {
    if (!content) {
      element.innerHTML = '';
      return { componentRefs: [], toc: [], cleanupHoverHandlers: undefined };
    }

    this.ensureInitialized();

    const rawHtml = await marked.parse(content, { async: true });
    const processed: ProcessedContent = this.htmlProcessor.processWithToc(
      rawHtml,
      displayName,
    );

    element.innerHTML = processed.html;

    const componentRefs = viewContainerRef
      ? this.hydrateComponents(element, viewContainerRef, entity)
      : [];

    const embedComponentRefs = viewContainerRef
      ? await this.hydrateEmbeds(element, viewContainerRef, entity)
      : [];

    // Attach wikilink hover handlers
    const cleanupHoverHandlers = this.attachWikilinkHoverHandlers(element);

    return {
      componentRefs: [...componentRefs, ...embedComponentRefs],
      toc: processed.toc,
      cleanupHoverHandlers,
    };
  }

  /**
   * Find all component placeholders and hydrate them into real Angular components.
   * @param element The element containing rendered HTML with component placeholders
   * @param viewContainerRef The ViewContainerRef to use for creating components
   * @param entity Optional entity context to pass to components
   * @returns Array of ComponentRefs created (for cleanup)
   */
  private hydrateComponents(
    element: HTMLElement,
    viewContainerRef: ViewContainerRef,
    entity?: Entity,
  ): ComponentRef<unknown>[] {
    const componentRefs: ComponentRef<unknown>[] = [];
    const placeholders = element.querySelectorAll('[data-md-component]');

    placeholders.forEach((placeholder: Element) => {
      const htmlPlaceholder = placeholder as HTMLElement;

      // Skip if already hydrated
      if (htmlPlaceholder.dataset['mdHydrated'] === 'true') {
        return;
      }

      const selector = htmlPlaceholder.dataset['mdComponent'];
      const inputsJson = htmlPlaceholder.dataset['mdInputs'];

      if (!selector) return;

      const componentType = this.registry.get(selector);
      if (!componentType) {
        console.warn(
          `MarkdownRenderer: No component registered for selector "${selector}"`,
        );
        this.renderFallback(htmlPlaceholder, selector);
        return;
      }

      try {
        const inputs = inputsJson ? JSON.parse(inputsJson) : {};
        const componentRef = this.createComponent(
          htmlPlaceholder,
          componentType,
          inputs,
          viewContainerRef,
          entity,
        );
        componentRefs.push(componentRef);
      } catch (error) {
        console.error(
          `MarkdownRenderer: Failed to hydrate component "${selector}"`,
          error,
        );
        this.renderFallback(htmlPlaceholder, selector);
      }
    });

    return componentRefs;
  }

  /**
   * Create an Angular component and insert it into the DOM.
   */
  private createComponent(
    placeholder: HTMLElement,
    componentType: Type<unknown>,
    inputs: Record<string, unknown>,
    viewContainerRef: ViewContainerRef,
    entity?: Entity,
  ): ComponentRef<unknown> {
    // Create the component
    const componentRef = viewContainerRef.createComponent(componentType);

    // Set inputs from markdown
    for (const [key, value] of Object.entries(inputs)) {
      componentRef.setInput(key, value);
    }

    // Inject entity if the component accepts it
    if (entity) {
      try {
        componentRef.setInput('entity', entity);
      } catch {
        // Component doesn't have an entity input, that's fine
      }
    }

    // Move the component's DOM element to replace the placeholder
    const hostElement = componentRef.location.nativeElement;
    placeholder.parentNode?.insertBefore(hostElement, placeholder);
    placeholder.dataset['mdHydrated'] = 'true';
    placeholder.style.display = 'none';

    return componentRef;
  }

  /**
   * Render a fallback for unregistered components.
   */
  private renderFallback(placeholder: HTMLElement, selector: string): void {
    placeholder.innerHTML = `<span class="text-warning text-sm italic">Unknown component: ${selector}</span>`;
    placeholder.dataset['mdHydrated'] = 'true';
  }

  /**
   * Find all embed placeholders and hydrate them with embedded entity content.
   * @param element The element containing rendered HTML with embed placeholders
   * @param viewContainerRef The ViewContainerRef to use for creating components
   * @param entity Optional entity context for circular reference detection
   * @param embeddingIds Set of entity IDs currently being embedded (for circular reference detection)
   * @returns Array of ComponentRefs created from nested renders (for cleanup)
   */
  private async hydrateEmbeds(
    element: HTMLElement,
    viewContainerRef: ViewContainerRef,
    entity?: Entity,
    embeddingIds: Set<string> = new Set(),
  ): Promise<ComponentRef<unknown>[]> {
    const componentRefs: ComponentRef<unknown>[] = [];
    const placeholders = Array.from(
      element.querySelectorAll('[data-md-embed]'),
    );

    for (const placeholder of placeholders) {
      const htmlPlaceholder = placeholder as HTMLElement;

      // Skip if already hydrated
      if (htmlPlaceholder.dataset['mdHydrated'] === 'true') {
        continue;
      }

      const entityId = htmlPlaceholder.dataset['mdEmbed'];
      const label = htmlPlaceholder.dataset['mdEmbedLabel'];

      if (!entityId) continue;

      // Check for circular references
      if (embeddingIds.has(entityId)) {
        htmlPlaceholder.innerHTML = `<div class="md-embed-circular text-warning text-sm italic p-2 border border-warning/30 rounded">
          <span class="font-semibold">Circular embed detected:</span> ${this.escapeHtml(entityId)}
        </div>`;
        htmlPlaceholder.dataset['mdHydrated'] = 'true';
        continue;
      }

      // Fetch the entity
      const entity$ = this.entityService.getById(entityId);
      const embeddedEntity = await firstValueFrom(entity$);

      if (!embeddedEntity) {
        // Broken embed
        const brokenLabel = label || entityId;
        htmlPlaceholder.innerHTML = `<div class="md-embed-broken-content text-error/70 text-sm italic p-2 border border-error/30 rounded">
          <span class="font-semibold">Broken embed:</span> ${this.escapeHtml(brokenLabel)}
        </div>`;
        htmlPlaceholder.dataset['mdHydrated'] = 'true';
        continue;
      }

      // Create a container for the embedded content
      const embedContainer = document.createElement('div');
      embedContainer.className = 'md-embed-content';

      // Add optional label/header if provided
      if (label) {
        const header = document.createElement('div');
        header.className =
          'md-embed-header text-sm font-semibold text-base-content/60 mb-2 pb-1 border-b border-base-300';
        header.textContent = label;
        embedContainer.appendChild(header);
      }

      // Recursively render the embedded entity's content
      const newEmbeddingIds = new Set(embeddingIds);
      newEmbeddingIds.add(entityId);

      const result = await this.renderContentInternal(
        embeddedEntity.content ?? '',
        embedContainer,
        viewContainerRef,
        embeddedEntity,
        embeddedEntity.name,
        newEmbeddingIds,
      );

      // Collect component refs from nested render
      componentRefs.push(...result.componentRefs);

      // Replace placeholder with embedded content
      htmlPlaceholder.parentNode?.replaceChild(embedContainer, htmlPlaceholder);
    }

    return componentRefs;
  }

  /**
   * Escape HTML special characters.
   */
  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Attach hover handlers to all wikilinks in the rendered element.
   * @param element The element containing rendered wikilinks
   * @returns Cleanup function to remove event listeners
   */
  attachWikilinkHoverHandlers(element: HTMLElement): () => void {
    this.ensureKeyHandlers();

    const wikilinks = element.querySelectorAll('a.wikilink[data-entity-id]');
    const handlers: Array<{
      el: Element;
      type: string;
      handler: EventListener;
    }> = [];

    wikilinks.forEach((link) => {
      const entityId = (link as HTMLElement).dataset['entityId'];
      if (!entityId) return;

      const mouseenterHandler = (e: Event) => {
        this.handleWikilinkHover(e as MouseEvent, entityId);
      };
      const mouseleaveHandler = () => {
        this.handleWikilinkHoverOut();
      };

      link.addEventListener('mouseenter', mouseenterHandler);
      link.addEventListener('mouseleave', mouseleaveHandler);

      handlers.push(
        { el: link, type: 'mouseenter', handler: mouseenterHandler },
        { el: link, type: 'mouseleave', handler: mouseleaveHandler },
      );
    });

    return () => {
      handlers.forEach(({ el, type, handler }) => {
        el.removeEventListener(type, handler);
      });
    };
  }

  /**
   * Ensure global keyboard handlers are attached for tracking Meta/Ctrl key state.
   */
  private ensureKeyHandlers(): void {
    if (this.keyHandlersAttached) return;

    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        this.isMetaKeyPressed.set(true);
        this.updatePanelVisibility();
      }
    };

    this.keyupHandler = (e: KeyboardEvent) => {
      if (e.key === 'Meta' || e.key === 'Control') {
        this.isMetaKeyPressed.set(false);
        this.updatePanelVisibility();
      }
    };

    document.addEventListener('keydown', this.keydownHandler);
    document.addEventListener('keyup', this.keyupHandler);
    this.keyHandlersAttached = true;
  }

  /**
   * Handle mouse entering a wikilink.
   */
  private handleWikilinkHover(event: MouseEvent, entityId: string): void {
    this.clearHideTimeout();
    this.isHoveringLink.set(true);
    this.currentEntityId = entityId;

    if (this.isMetaKeyPressed()) {
      this.showPreviewPanel(event, entityId);
    }
  }

  /**
   * Handle mouse leaving a wikilink.
   */
  private handleWikilinkHoverOut(): void {
    this.isHoveringLink.set(false);
    this.scheduleHide();
  }

  /**
   * Update panel visibility based on current state.
   */
  private updatePanelVisibility(): void {
    const shouldShow =
      this.isMetaKeyPressed() &&
      (this.isHoveringLink() || this.isHoveringPanel());

    if (!shouldShow) {
      this.scheduleHide();
    } else if (this.isHoveringLink() && this.currentEntityId) {
      // Meta key was just pressed while hovering - need to show panel
      // Use a synthetic mouse position since we don't have the event
      if (!this.previewPanelRef) {
        // We can't show without mouse position, user needs to re-hover
      }
    }
  }

  /**
   * Schedule hiding the preview panel after a delay.
   */
  private scheduleHide(): void {
    this.clearHideTimeout();
    this.hideTimeout = setTimeout(() => {
      if (!this.isHoveringLink() && !this.isHoveringPanel()) {
        this.hidePreviewPanel();
      }
    }, 150);
  }

  /**
   * Clear any pending hide timeout.
   */
  private clearHideTimeout(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  /**
   * Show the preview panel for the given entity.
   */
  private async showPreviewPanel(
    event: MouseEvent,
    entityId: string,
  ): Promise<void> {
    // Fetch entity
    const entity$ = this.entityService.getById(entityId);
    const entity = await firstValueFrom(entity$);

    // Hide existing panel if showing different entity
    if (this.previewPanelRef && this.currentEntityId !== entityId) {
      this.hidePreviewPanel();
    }

    // Don't create new panel if one already exists for same entity
    if (this.previewPanelRef) {
      return;
    }

    // Calculate position
    const position = this.calculatePanelPosition(event);

    // Create the component
    const componentRef = createComponent(WikilinkPreviewPanelComponent, {
      environmentInjector: this.injector,
    });

    // Set inputs
    componentRef.setInput('entity', entity);
    componentRef.setInput('position', position);

    // Subscribe to outputs
    componentRef.instance.mouseEnter.subscribe(() => {
      this.clearHideTimeout();
      this.isHoveringPanel.set(true);
    });

    componentRef.instance.mouseLeave.subscribe(() => {
      this.isHoveringPanel.set(false);
      this.scheduleHide();
    });

    // Attach to DOM
    document.body.appendChild(componentRef.location.nativeElement);
    this.appRef.attachView(componentRef.hostView);

    this.previewPanelRef = componentRef;
    this.currentEntityId = entityId;
  }

  /**
   * Calculate the position for the preview panel.
   */
  private calculatePanelPosition(event: MouseEvent): { x: number; y: number } {
    const panelWidth = 400; // max-w-md is ~28rem = ~448px, use 400 as estimate
    const panelHeight = 300; // estimate for max-h-[60vh]
    const margin = 16;
    const offset = 12; // Offset from cursor

    let x = event.clientX + offset;
    let y = event.clientY + offset;

    // Adjust if panel would overflow viewport on right
    if (x + panelWidth > window.innerWidth - margin) {
      x = event.clientX - panelWidth - offset;
    }

    // Adjust if panel would overflow viewport on bottom
    if (y + panelHeight > window.innerHeight - margin) {
      y = window.innerHeight - panelHeight - margin;
    }

    // Ensure not off-screen on left/top
    x = Math.max(margin, x);
    y = Math.max(margin, y);

    return { x, y };
  }

  /**
   * Hide and destroy the preview panel.
   */
  private hidePreviewPanel(): void {
    if (this.previewPanelRef) {
      this.appRef.detachView(this.previewPanelRef.hostView);
      this.previewPanelRef.destroy();
      this.previewPanelRef = null;
    }
    this.currentEntityId = null;
    this.clearHideTimeout();
  }
}
