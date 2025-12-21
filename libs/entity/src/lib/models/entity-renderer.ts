import { Type } from '@angular/core';
import { Entity } from './entity';

/**
 * Input interface for entity viewer components.
 * Custom viewer components should accept these inputs.
 */
export interface EntityViewerInputs {
  /** The entity being displayed */
  entity: Entity;
}

/**
 * Input interface for entity editor components.
 * Custom editor components should accept these inputs and emit these outputs.
 */
export interface EntityEditorInputs {
  /** The entity being edited */
  entity: Entity;
  /** Whether a save operation is in progress */
  isSaving: boolean;
}

/**
 * Output events that editor components should emit.
 */
export interface EntityEditorOutputs {
  /** Emitted when the user saves changes */
  save: (updates: Partial<Entity>) => void;
  /** Emitted when the user cancels editing */
  cancel: () => void;
}

/**
 * Configuration for custom entity type rendering.
 * Allows entity types to specify custom viewer and editor components.
 */
export interface EntityRenderer {
  /** Component for read-only display of the entity */
  viewerComponent: Type<unknown>;
  /** Component for editing the entity */
  editorComponent: Type<unknown>;
}
