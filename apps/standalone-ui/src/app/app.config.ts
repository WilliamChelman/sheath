import {
  AUDIO_PATH_RESOLVER,
  provideAudioConfig,
  provideAudioEntityRenderer,
  provideAudioWatcher,
} from '@/audio';
import { provideBoardConfig, provideBoardEntityRenderer } from '@/board';
import { provideCustomErrorHandler } from '@/common/error-handler';
import { provideDrawSteelConfig } from '@/draw-steel';
import { provideEntityConfig } from '@/entity';
import { I18nService } from '@/i18n';
import { provideStandaloneApi } from '@/standalone-api';
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
import { AudioPathResolverService } from './services/audio-path-resolver.service';
import { FolderEntityInitializerService } from './services/folder-entity-initializer.service';
import { TauriFileDownloader } from './services/tauri-file-downloader';
import { provideWindowManager } from './services/window-manager.service';

export const appConfig: ApplicationConfig = {
  providers: [
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
      const i18n = inject(I18nService);
      i18n.init({
        defaultLocale: 'en',
        bundles: [],
      });
    }),
    provideStandaloneApi(),
    {
      provide: AUDIO_PATH_RESOLVER,
      useExisting: AudioPathResolverService,
    },
    provideAudioConfig(),
    provideAudioEntityRenderer(),
    provideAudioWatcher(),
    provideBoardConfig(),
    provideBoardEntityRenderer(),
    provideDrawSteelConfig(),
    provideEntityConfig({
      canActivate: [
        async () => {
          const entityInitializerService = inject(
            FolderEntityInitializerService,
          );
          return entityInitializerService.init();
        },
      ],
    }),
    provideTokenCreator({ fileDownloader: TauriFileDownloader }),
    provideWindowManager(),
    provideNotFound(),
  ],
};
