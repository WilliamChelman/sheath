import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { EntityRendererService } from '@/entity';
import { BOARD_TYPE_ID } from './models/board.config';
import { BoardEntityViewerComponent } from './components/board-entity-viewer/board-entity-viewer.component';
import { BoardEntityEditorComponent } from './components/board-entity-editor/board-entity-editor.component';

/**
 * Provides the board entity renderer registration.
 * Call this in your app.config.ts providers array to enable
 * custom board rendering in the compendium detail view.
 *
 * @example
 * ```typescript
 * // app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideBoardEntityRenderer(),
 *     // ... other providers
 *   ],
 * };
 * ```
 */
export function provideBoardEntityRenderer(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const rendererService = inject(EntityRendererService);
      rendererService.register(BOARD_TYPE_ID, {
        viewerComponent: BoardEntityViewerComponent,
        editorComponent: BoardEntityEditorComponent,
      });
    }),
  ]);
}
