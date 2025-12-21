import {
  EnvironmentProviders,
  inject,
  Injectable,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  Type,
} from '@angular/core';
import { Entity } from '../models/entity';

/**
 * Configuration for a markdown component plugin.
 */
export interface MarkdownComponentConfig {
  /** Unique selector used in markdown (e.g., 'stat-block' for ```component:stat-block) */
  selector: string;
  /** The Angular component class to render */
  component: Type<unknown>;
}

/**
 * Context passed to markdown components when they are hydrated.
 */
export interface MarkdownComponentContext {
  /** The entity being rendered (if available) */
  entity?: Entity;
  /** Parsed inputs from the markdown block */
  inputs: Record<string, unknown>;
}

/**
 * Registry service for markdown component plugins.
 * Components register themselves via provideMarkdownComponent() and are
 * dynamically instantiated when rendering markdown content.
 *
 * @example
 * ```typescript
 * // Register a component in app.config.ts
 * providers: [
 *   provideMarkdownComponent({
 *     selector: 'stat-block',
 *     component: StatBlockComponent,
 *   }),
 * ]
 *
 * // Use in markdown
 * ```component:stat-block
 * speed: 7
 * size: 1M
 * ```
 * ```
 */
@Injectable({ providedIn: 'root' })
export class MarkdownComponentRegistry {
  private readonly registry = new Map<string, Type<unknown>>();

  /**
   * Register a component for a given selector.
   * @param config The component configuration
   */
  register(config: MarkdownComponentConfig): void {
    if (this.registry.has(config.selector)) {
      console.warn(
        `MarkdownComponentRegistry: Overwriting existing component for selector "${config.selector}"`,
      );
    }
    this.registry.set(config.selector, config.component);
  }

  /**
   * Get the component class for a selector.
   * @param selector The component selector from markdown
   * @returns The component class, or undefined if not registered
   */
  get(selector: string): Type<unknown> | undefined {
    return this.registry.get(selector);
  }

  /**
   * Check if a component is registered for a selector.
   * @param selector The component selector from markdown
   */
  has(selector: string): boolean {
    return this.registry.has(selector);
  }

  /**
   * Get all registered selectors.
   */
  getSelectors(): string[] {
    return Array.from(this.registry.keys());
  }
}

/**
 * Provides a markdown component plugin for the application.
 * Use this in your app.config.ts or feature module providers.
 *
 * @example
 * ```typescript
 * // app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideMarkdownComponent({
 *       selector: 'stat-block',
 *       component: StatBlockComponent,
 *     }),
 *   ],
 * };
 * ```
 */
export function provideMarkdownComponent(
  config: MarkdownComponentConfig,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const registry = inject(MarkdownComponentRegistry);
      registry.register(config);
    }),
  ]);
}
