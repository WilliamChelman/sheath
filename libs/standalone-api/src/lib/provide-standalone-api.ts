import { EntityService } from '@/entity';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { FolderEntityService } from './services/folder-entity.service';

export function provideStandaloneApi(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: EntityService,
      useExisting: FolderEntityService,
    },
  ]);
}
