import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Route, ROUTES } from '@angular/router';

export function provideTokenCreator(): EnvironmentProviders {
  return makeEnvironmentProviders([
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
