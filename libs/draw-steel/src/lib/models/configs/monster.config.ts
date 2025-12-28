import { EntityClassConfig, EntityClassPropertyConfig } from '@/entity';
import { DsTypes } from '../ds-types.model';
import {
  creaturePropertyConfigs,
  creaturePropertyIds,
} from './creature.properties';
import { sourceProperty } from './source.property';

export const monsterClassConfig: EntityClassConfig = {
  id: DsTypes.monster,
  name: 'Monster',
  icon: 'phosphorPawPrint',
  properties: [
    sourceProperty.id,
    ...creaturePropertyIds,
    'sheath.ds.organization',
  ],
  displayedProperties: [
    'sheath.ds.level',
    'sheath.ds.ev',
    'sheath.ds.size',
    'sheath.ds.organization',
    'sheath.ds.role',
  ],
};

export const monsterPropertyConfigs: EntityClassPropertyConfig[] = [
  ...creaturePropertyConfigs,
  {
    id: 'sheath.ds.organization',
    name: 'Organization',
    description:
      'Monster organization type (e.g., minion, standard, elite, solo)',
    datatype: 'string',
    aliases: ['org'],
  },
];
