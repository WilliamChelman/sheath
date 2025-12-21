import { Injectable } from '@angular/core';
import { EntityClassConfig } from '../models/entity-class-config';
import { EntityClassPropertyConfig } from '../models/entity-class-property-config';

@Injectable({ providedIn: 'root' })
export class DomainService {
  allClassConfigs: EntityClassConfig[] = [];
  allPropertyConfigs: EntityClassPropertyConfig[] = [];

  registerClassConfigs(configs: EntityClassConfig[]) {
    this.allClassConfigs = [...this.allClassConfigs, ...configs];
  }

  registerPropertyConfigs(configs: EntityClassPropertyConfig[]) {
    configs = configs.map((config) => ({
      ...config,
      isFacet: config.isFacet ?? true,
    }));
    this.allPropertyConfigs = [...this.allPropertyConfigs, ...configs];
  }
}
