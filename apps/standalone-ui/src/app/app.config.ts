import { provideBoardConfig, provideBoardEntityRenderer } from '@/board';
import { provideDrawSteelConfig } from '@/draw-steel';
import {
  EntityService,
  IndexedDbEntityService,
  provideEntityConfig,
} from '@/entity';
import { I18nService } from '@/i18n';
import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      appRoutes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'top',
      }),
    ),
    provideAppInitializer(() => {
      const i18n = inject(I18nService);
      i18n.init({
        defaultLocale: 'en',
        bundles: [],
      });
    }),
    {
      provide: EntityService,
      useExisting: IndexedDbEntityService,
    },
    provideBoardConfig(),
    provideBoardEntityRenderer(),
    provideDrawSteelConfig(),
    provideEntityConfig(),
  ],
};
