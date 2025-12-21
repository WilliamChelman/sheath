import { EntityClassConfig } from '@/entity';
import { DsTypes } from '../ds-types.model';
import { sourceProperty } from './source.property';

export const complicationClassConfig: EntityClassConfig = {
  id: DsTypes.complication,
  name: 'Complication',
  icon: 'phosphorWarning',
  properties: [sourceProperty.id],
};
