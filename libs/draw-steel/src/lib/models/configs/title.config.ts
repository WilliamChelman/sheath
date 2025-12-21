import { EntityClassConfig, EntityClassPropertyConfig } from '@/entity';
import { DsTypes } from '../ds-types.model';
import { sourceProperty } from './source.property';

export const titleClassConfig: EntityClassConfig = {
  id: DsTypes.title,
  name: 'Title',
  icon: 'phosphorTrophy',
  properties: [sourceProperty.id, 'sheath.ds.echelon'],
};

export const titlePropertyConfigs: EntityClassPropertyConfig[] = [
  {
    id: 'sheath.ds.echelon',
    name: 'Echelon',
    description: 'The echelon tier of the title (e.g., 1st, 2nd, 3rd, 4th)',
    datatype: 'string',
  },
];
