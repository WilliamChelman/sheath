import { EntityClassConfig, EntityClassPropertyConfig } from '@/entity';
import { DsTypes } from '../ds-types.model';
import { sourceProperty } from './source.property';

export const perkClassConfig: EntityClassConfig = {
  id: DsTypes.perk,
  name: 'Perk',
  icon: 'phosphorFlask',
  properties: [sourceProperty.id, 'sheath.ds.perkType'],
};

export const perkPropertyConfigs: EntityClassPropertyConfig[] = [
  {
    id: 'sheath.ds.perkType',
    name: 'Perk Type',
    description:
      'The type of perk (e.g., exploration, intrigue, lore, crafting)',
    datatype: 'string',
  },
];
