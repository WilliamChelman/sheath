import { DomainService, provideMarkdownComponent } from '@/entity';
import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { StatBlockComponent } from './components/stat-block.component';
import { allDsClassConfigs, allDsPropertyConfigs } from './models/configs';

export function provideDrawSteelConfig(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const domainService = inject(DomainService);
      domainService.registerClassConfigs(allDsClassConfigs);
      domainService.registerPropertyConfigs(allDsPropertyConfigs);
    }),
    provideMarkdownComponent({
      selector: 'sheath.ds.stat-block',
      component: StatBlockComponent,
    }),
  ]);
}
