import { provideBoardConfig, provideBoardEntityRenderer } from '@/board';
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
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { appRoutes } from './app.routes';
import { EntityInitializerService } from './pages/compendium/services/entity-initializer.service';
import { provideNotFound } from './pages/not-found/provide-not-found';
import { TauriFileDownloader } from './services/tauri-file-downloader';

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
    provideEntityConfig({
      canActivate: [
        async () => {
          const entityInitializerService = inject(EntityInitializerService);
          await entityInitializerService.init();
          return true;
        },
      ],
    }),
    provideTokenCreator({ fileDownloader: TauriFileDownloader }),
    provideNotFound(),
  ],
};
