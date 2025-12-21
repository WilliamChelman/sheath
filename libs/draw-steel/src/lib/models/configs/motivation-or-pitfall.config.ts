import { EntityClassConfig } from '@/entity';
import { DsTypes } from '../ds-types.model';
import { sourceProperty } from './source.property';

export const motivationOrPitfallClassConfig: EntityClassConfig = {
  id: DsTypes.motivationOrPitfall,
  name: 'Motivation or Pitfall',
  icon: 'phosphorLightbulb',
  properties: [sourceProperty.id],
};
