import { DomainService, provideMarkdownComponent } from '@/entity';
import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { StatBlockComponent } from './components/stat-block.component';
import { allDsClassConfigs, allDsPropertyConfigs } from './models/configs';

import { provideIcons } from '@ng-icons/core';
import {
  phosphorBookOpen,
  phosphorBriefcase,
  phosphorFlask,
  phosphorFolderOpen,
  phosphorGlobeSimple,
  phosphorGraduationCap,
  phosphorHash,
  phosphorHeart,
  phosphorLightbulb,
  phosphorMountains,
  phosphorPawPrint,
  phosphorSneakerMove,
  phosphorStar,
  phosphorSword,
  phosphorTreasureChest,
  phosphorTrophy,
  phosphorUser,
  phosphorWarning,
} from '@ng-icons/phosphor-icons/regular';

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
    provideIcons({
      phosphorWarning,
      phosphorSneakerMove,
      phosphorGlobeSimple,
      phosphorHash,
      phosphorSword,
      phosphorBriefcase,
      phosphorBookOpen,
      phosphorUser,
      phosphorPawPrint,
      phosphorFlask,
      phosphorTrophy,
      phosphorGraduationCap,
      phosphorHeart,
      phosphorMountains,
      phosphorLightbulb,
      phosphorStar,
      phosphorFolderOpen,
      phosphorTreasureChest,
    }),
  ]);
}
