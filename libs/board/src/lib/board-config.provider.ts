import { DomainService } from '@/entity';
import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { boardClassConfig, boardPropertyConfigs } from './models';

export function provideBoardConfig(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const domainService = inject(DomainService);
      domainService.registerClassConfigs([boardClassConfig]);
      domainService.registerPropertyConfigs(boardPropertyConfigs);
    }),
  ]);
}
