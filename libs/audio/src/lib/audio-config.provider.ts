import { DomainService } from '@/entity';
import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { audioClassConfig, audioPropertyConfigs } from './models';

/**
 * Provides the audio entity configuration.
 * Registers the audio class and property configs with the domain service.
 *
 * @example
 * ```typescript
 * // app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideAudioConfig(),
 *     // ... other providers
 *   ],
 * };
 * ```
 */
export function provideAudioConfig(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const domainService = inject(DomainService);
      domainService.registerClassConfigs([audioClassConfig]);
      domainService.registerPropertyConfigs(audioPropertyConfigs);
    }),
  ]);
}
