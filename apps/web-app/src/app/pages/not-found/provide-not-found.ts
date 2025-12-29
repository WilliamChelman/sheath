import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Route, ROUTES } from '@angular/router';

export function provideNotFound(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ROUTES,
      multi: true,
      useValue: [
        {
          path: '**',
          loadComponent: () =>
            import('./not-found.view').then((m) => m.NotFoundView),
        },
      ] as Route[],
    },
  ]);
}
