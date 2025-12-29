import { CommandRegistryService } from '@/command-palette';
import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { CanActivateFn, Route, ROUTES } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { phosphorFileText } from '@ng-icons/phosphor-icons/regular';
import { EntityCommandProviderService } from './services/entity-command-provider.service';

export function provideEntityConfig(
  options: EntityProviderOptions = {},
): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideIcons({ phosphorFileText }),
    provideEnvironmentInitializer(() => {
      const commandRegistryService = inject(CommandRegistryService);
      const commandProvider = inject(EntityCommandProviderService);
      commandRegistryService.registerProvider(commandProvider);
    }),
    {
      provide: ROUTES,
      multi: true,
      useValue: [
        {
          path: 'compendium',
          canActivate: options.canActivate,
          children: [
            {
              path: '',
              loadComponent: () =>
                import('./compendium.view').then((m) => m.CompendiumView),
            },
            {
              path: ':id',
              loadComponent: () =>
                import('./compendium-detail.view').then(
                  (m) => m.CompendiumDetailView,
                ),
            },
          ],
        },
      ] as Route[],
    },
  ]);
}

export interface EntityProviderOptions {
  canActivate?: CanActivateFn[];
}
