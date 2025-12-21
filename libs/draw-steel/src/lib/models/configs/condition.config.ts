import { EntityClassConfig } from '@/entity';
import { DsTypes } from '../ds-types.model';
import { sourceProperty } from './source.property';

export const conditionClassConfig: EntityClassConfig = {
  id: DsTypes.condition,
  name: 'Condition',
  icon: 'phosphorHeart',
  properties: [sourceProperty.id],
};
