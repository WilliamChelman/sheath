import { CommandRegistryService } from '@/command-palette';
import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { phosphorFileText } from '@ng-icons/phosphor-icons/regular';
import { EntityCommandProviderService } from './services/entity-command-provider.service';

export function provideEntityConfig(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideIcons({ phosphorFileText }),
    provideEnvironmentInitializer(() => {
      const commandRegistryService = inject(CommandRegistryService);
      const commandProvider = inject(EntityCommandProviderService);
      commandRegistryService.registerProvider(commandProvider);
    }),
  ]);
}
