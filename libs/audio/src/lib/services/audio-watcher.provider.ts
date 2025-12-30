import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { AudioWatcherService } from './audio-watcher.service';

/**
 * Provides audio file watching and auto-discovery.
 * When provided, the app will automatically:
 * 1. Scan for audio files without companion .md entities on startup
 * 2. Watch for new audio files and create companion entities automatically
 *
 * @example
 * ```typescript
 * // app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideAudioWatcher(),
 *     // ... other providers
 *   ],
 * };
 * ```
 */
export function provideAudioWatcher(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const audioWatcher = inject(AudioWatcherService);
      audioWatcher.initialize();
    }),
  ]);
}
