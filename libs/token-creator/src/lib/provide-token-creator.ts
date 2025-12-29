import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  Type,
} from '@angular/core';
import { Route, ROUTES } from '@angular/router';
import { BrowserFileDownloader } from './services/browser-file-downloader';
import { FileDownloader } from './services/file-downloader';

export interface TokenCreatorConfig {
  fileDownloader?: Type<FileDownloader>;
}

export function provideTokenCreator(
  config?: TokenCreatorConfig,
): EnvironmentProviders {
  const FileDownloaderImpl = config?.fileDownloader ?? BrowserFileDownloader;

  return makeEnvironmentProviders([
    {
      provide: FileDownloader,
      useClass: FileDownloaderImpl,
    },
    {
      provide: ROUTES,
      multi: true,
      useValue: [
        {
          path: 'token-creator',
          loadComponent: () =>
            import('./token-creator.view').then((m) => m.TokenCreatorView),
        },
      ] as Route[],
    },
  ]);
}
