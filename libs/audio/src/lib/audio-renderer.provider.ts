import { EntityRendererService } from '@/entity';
import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { AudioEntityEditorComponent } from './components/audio-entity-editor/audio-entity-editor.component';
import { AudioEntityViewerComponent } from './components/audio-entity-viewer/audio-entity-viewer.component';
import { AUDIO_TYPE_ID } from './models/audio.config';

/**
 * Provides the audio entity renderer registration.
 * Call this in your app.config.ts providers array to enable
 * custom audio rendering in the compendium detail view.
 *
 * @example
 * ```typescript
 * // app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideAudioEntityRenderer(),
 *     // ... other providers
 *   ],
 * };
 * ```
 */
export function provideAudioEntityRenderer(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const rendererService = inject(EntityRendererService);
      rendererService.register(AUDIO_TYPE_ID, {
        viewerComponent: AudioEntityViewerComponent,
        editorComponent: AudioEntityEditorComponent,
      });
    }),
  ]);
}
