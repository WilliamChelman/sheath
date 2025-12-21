import { EntityClassConfig, EntityClassPropertyConfig } from '@/entity';
import { DsTypes } from '../ds-types.model';
import { sourceProperty } from './source.property';

export const treasureClassConfig: EntityClassConfig = {
  id: DsTypes.treasure,
  name: 'Treasure',
  icon: 'phosphorTreasureChest',
  properties: [
    sourceProperty.id,
    'sheath.ds.echelon',
    'sheath.ds.treasureType',
  ],
  displayedProperties: ['sheath.ds.echelon', 'sheath.ds.treasureType'],
};

export const treasurePropertyConfigs: EntityClassPropertyConfig[] = [
  {
    id: 'sheath.ds.echelon',
    name: 'Echelon',
    description: 'The echelon tier of the treasure (e.g., 1st, 2nd, 3rd, 4th)',
    datatype: 'string',
  },
  {
    id: 'sheath.ds.treasureType',
    name: 'Treasure Type',
    description: 'The type of treasure (e.g., Consumable)',
    datatype: 'string',
  },
];
