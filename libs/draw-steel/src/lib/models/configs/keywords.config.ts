import { EntityClassConfig } from '@/entity';
import { DsTypes } from '../ds-types.model';
import { sourceProperty } from './source.property';

export const keywordsClassConfig: EntityClassConfig = {
  id: DsTypes.keywords,
  name: 'Keywords',
  icon: 'phosphorHash',
  properties: [sourceProperty.id],
};
