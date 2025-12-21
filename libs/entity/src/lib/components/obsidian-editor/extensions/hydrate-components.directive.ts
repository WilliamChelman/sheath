import {
  AfterViewInit,
  ComponentRef,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  OnChanges,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import { Entity } from '../../../models/entity';
import { MarkdownComponentRegistry } from '../../../services/markdown-component.registry';

/**
 * Directive that hydrates markdown component placeholders into real Angular components.
 *
 * When applied to an element containing rendered markdown HTML, this directive:
 * 1. Scans for elements with `data-md-component` attributes
 * 2. Looks up the corresponding component in the registry
 * 3. Creates the component dynamically and injects inputs
 *
 * @example
 * ```html
 * <div
 *   [innerHTML]="safeHtml()"
 *   appHydrateComponents
 *   [entity]="entity()"
 * ></div>
 * ```
 */
@Directive({
  selector: '[appHydrateComponents]',
})
export class HydrateComponentsDirective implements AfterViewInit, OnChanges {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly registry = inject(MarkdownComponentRegistry);
  private readonly destroyRef = inject(DestroyRef);

  /** The entity being rendered, passed to components that accept it */
  entity = input<Entity>();

  /** Track created components for cleanup */
  private componentRefs: ComponentRef<unknown>[] = [];

  /** MutationObserver to detect DOM changes */
  private observer?: MutationObserver;

  ngAfterViewInit(): void {
    this.setupObserver();
    this.hydrateComponents();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-hydrate when entity changes (components may need updated context)
    if (changes['entity'] && !changes['entity'].firstChange) {
      this.hydrateComponents();
    }
  }

  /**
   * Set up a MutationObserver to detect when innerHTML changes.
   * This handles the case where content is updated after initial render.
   */
  private setupObserver(): void {
    this.observer = new MutationObserver(() => {
      this.hydrateComponents();
    });

    this.observer.observe(this.elementRef.nativeElement, {
      childList: true,
      subtree: true,
    });

    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
      this.cleanupComponents();
    });
  }

  /**
   * Find all component placeholders and hydrate them.
   */
  private hydrateComponents(): void {
    const element = this.elementRef.nativeElement;
    const placeholders = element.querySelectorAll('[data-md-component]');

    placeholders.forEach((placeholder: HTMLElement) => {
      // Skip if already hydrated
      if (placeholder.dataset['mdHydrated'] === 'true') {
        return;
      }

      const selector = placeholder.dataset['mdComponent'];
      const inputsJson = placeholder.dataset['mdInputs'];

      if (!selector) return;

      const componentType = this.registry.get(selector);
      if (!componentType) {
        console.warn(
          `HydrateComponentsDirective: No component registered for selector "${selector}"`,
        );
        this.renderFallback(placeholder, selector);
        return;
      }

      try {
        const inputs = inputsJson ? JSON.parse(inputsJson) : {};
        this.createComponent(placeholder, componentType, inputs);
      } catch (error) {
        console.error(
          `HydrateComponentsDirective: Failed to hydrate component "${selector}"`,
          error,
        );
        this.renderFallback(placeholder, selector);
      }
    });
  }

  /**
   * Create an Angular component and insert it into the DOM.
   */
  private createComponent(
    placeholder: HTMLElement,
    componentType: import('@angular/core').Type<unknown>,
    inputs: Record<string, unknown>,
  ): void {
    // Create the component
    const componentRef = this.viewContainerRef.createComponent(componentType);

    // Set inputs from markdown
    for (const [key, value] of Object.entries(inputs)) {
      componentRef.setInput(key, value);
    }

    // Inject entity if the component accepts it
    const entity = this.entity();
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

    // Track for cleanup
    this.componentRefs.push(componentRef);
  }

  /**
   * Render a fallback for unregistered components.
   */
  private renderFallback(placeholder: HTMLElement, selector: string): void {
    placeholder.innerHTML = `<span class="text-warning text-sm italic">Unknown component: ${selector}</span>`;
    placeholder.dataset['mdHydrated'] = 'true';
  }

  /**
   * Clean up created components.
   */
  private cleanupComponents(): void {
    this.componentRefs.forEach((ref) => ref.destroy());
    this.componentRefs = [];
  }
}
