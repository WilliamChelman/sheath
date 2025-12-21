import { EntityClassConfig } from '@/entity';
import { DsTypes } from '../ds-types.model';
import { sourceProperty } from './source.property';

export const monsterSectionClassConfig: EntityClassConfig = {
  id: DsTypes.monsterSection,
  name: 'Monster Section',
  properties: [sourceProperty.id],
};
