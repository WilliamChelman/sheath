import { EntityClassConfig } from '@/entity';
import { DsTypes } from '../ds-types.model';
import { sourceProperty } from './source.property';

export const monsterFeatureClassConfig: EntityClassConfig = {
  id: DsTypes.monsterFeature,
  name: 'Monster Feature',
  icon: 'phosphorStar',
  properties: [sourceProperty.id],
};
