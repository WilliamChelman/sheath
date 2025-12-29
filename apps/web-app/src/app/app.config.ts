import { provideBoardConfig, provideBoardEntityRenderer } from '@/board';
import { provideCustomErrorHandler } from '@/common/error-handler';
import { provideDrawSteelConfig } from '@/draw-steel';
import {
  EntityService,
  IndexedDbEntityService,
  provideEntityConfig,
} from '@/entity';
import { I18nService } from '@/i18n';
import { provideTokenCreator } from '@/token-creator';
import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { appRoutes } from './app.routes';
import { EntityInitializerService } from './pages/compendium/services/entity-initializer.service';
import { provideNotFound } from './pages/not-found/provide-not-found';
import { ConfigService } from './services/config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    // provideZoneChangeDetection({ eventCoalescing: true }),
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideBrowserGlobalErrorListeners(),
    provideCustomErrorHandler(),
    provideRouter(
      appRoutes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'top',
      }),
    ),
    provideAppInitializer(() => {
      const configService = inject(ConfigService);
      return configService.init();
    }),
    provideAppInitializer(() => {
      const i18n = inject(I18nService);
      i18n.init({
        defaultLocale: 'en',
        bundles: [],
      });
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    {
      provide: EntityService,
      useExisting: IndexedDbEntityService,
    },
    provideBoardConfig(),
    provideBoardEntityRenderer(),
    provideDrawSteelConfig(),
    provideEntityConfig({
      canActivate: [
        async () => {
          const entityInitializerService = inject(EntityInitializerService);
          await entityInitializerService.init();
          return true;
        },
      ],
    }),
    provideTokenCreator(),
    // need to always be last since it is matching **
    provideNotFound(),
  ],
};
