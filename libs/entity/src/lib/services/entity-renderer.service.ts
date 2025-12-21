import { Injectable, Type } from '@angular/core';
import { EntityRenderer } from '../models/entity-renderer';

/**
 * Registry service for custom entity renderers.
 * Allows different entity types to use specialized viewer/editor components.
 *
 * @example
 * ```typescript
 * // Register a custom renderer for board entities
 * rendererService.register('sheath.core.board', {
 *   viewerComponent: BoardViewerWrapperComponent,
 *   editorComponent: BoardEditorWrapperComponent,
 * });
 *
 * // Get renderer for an entity type
 * const renderer = rendererService.getRenderer(entity.type);
 * if (renderer) {
 *   // Use custom components
 * } else {
 *   // Use default markdown renderer
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class EntityRendererService {
  private readonly registry = new Map<string, EntityRenderer>();

  /**
   * Register a custom renderer for an entity type.
   * @param entityType The entity type identifier (e.g., 'sheath.core.board')
   * @param renderer The renderer configuration with viewer and editor components
   */
  register(entityType: string, renderer: EntityRenderer): void {
    this.registry.set(entityType, renderer);
  }

  /**
   * Get the custom renderer for an entity type.
   * @param entityType The entity type identifier
   * @returns The renderer configuration, or undefined if no custom renderer is registered
   */
  getRenderer(entityType: string): EntityRenderer | undefined {
    return this.registry.get(entityType);
  }

  /**
   * Check if a custom renderer is registered for an entity type.
   * @param entityType The entity type identifier
   */
  hasRenderer(entityType: string): boolean {
    return this.registry.has(entityType);
  }

  /**
   * Get the viewer component for an entity type, if a custom renderer is registered.
   * @param entityType The entity type identifier
   */
  getViewerComponent(entityType: string): Type<unknown> | undefined {
    return this.registry.get(entityType)?.viewerComponent;
  }

  /**
   * Get the editor component for an entity type, if a custom renderer is registered.
   * @param entityType The entity type identifier
   */
  getEditorComponent(entityType: string): Type<unknown> | undefined {
    return this.registry.get(entityType)?.editorComponent;
  }
}
