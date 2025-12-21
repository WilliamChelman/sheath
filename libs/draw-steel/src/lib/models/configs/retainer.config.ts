import { EntityClassConfig, EntityClassPropertyConfig } from '@/entity';
import { DsTypes } from '../ds-types.model';
import {
  creaturePropertyConfigs,
  creaturePropertyIds,
} from './creature.properties';
import { sourceProperty } from './source.property';

export const retainerClassConfig: EntityClassConfig = {
  id: DsTypes.retainer,
  name: 'Retainer',
  icon: 'phosphorUser',
  properties: [sourceProperty.id, ...creaturePropertyIds, 'sheath.ds.roles'],
  displayedProperties: ['sheath.ds.level', 'sheath.ds.size', 'sheath.ds.role'],
};

export const retainerPropertyConfigs: EntityClassPropertyConfig[] = [
  ...creaturePropertyConfigs,
  {
    id: 'sheath.ds.roles',
    name: 'Roles',
    description: 'Retainer roles (e.g., Defender Retainer)',
    datatype: 'string',
    isMulti: true,
  },
];
