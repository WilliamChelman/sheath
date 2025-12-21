import { EntityClassConfig } from '@/entity';
import { DsTypes } from '../ds-types.model';
import { sourceProperty } from './source.property';

export const movementClassConfig: EntityClassConfig = {
  id: DsTypes.movement,
  name: 'Movement',
  icon: 'phosphorSneakerMove',
  properties: [sourceProperty.id],
};
