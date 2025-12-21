import { EntityClassConfig } from '@/entity';
import { DsTypes } from '../ds-types.model';
import { sourceProperty } from './source.property';

export const kitClassConfig: EntityClassConfig = {
  id: DsTypes.kit,
  name: 'Kit',
  icon: 'phosphorSword',
  properties: [sourceProperty.id],
};
