import { provideBoardConfig, provideBoardEntityRenderer } from '@/board';
import { provideDrawSteelConfig } from '@/draw-steel';
import { EntityService, provideEntityConfig } from '@/entity';
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
import { provideNotFound } from './pages/not-found/provide-not-found';
import { FolderEntityInitializerService } from './services/folder-entity-initializer.service';
import { FolderEntityService } from './services/folder-entity.service';
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
      useExisting: FolderEntityService,
    },
    provideBoardConfig(),
    provideBoardEntityRenderer(),
    provideDrawSteelConfig(),
    provideEntityConfig({
      canActivate: [
        async () => {
          const entityInitializerService = inject(FolderEntityInitializerService);
          return entityInitializerService.init();
        },
      ],
    }),
    provideTokenCreator({ fileDownloader: TauriFileDownloader }),
    provideNotFound(),
  ],
};
