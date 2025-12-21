import { EntityClassConfig } from '@/entity';
import { DsTypes } from '../ds-types.model';
import { sourceProperty } from './source.property';

export const classClassConfig: EntityClassConfig = {
  id: DsTypes.class,
  name: 'Class',
  properties: [sourceProperty.id],
};
