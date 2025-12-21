import { EntityClassConfig } from '@/entity';
import { DsTypes } from '../ds-types.model';
import { sourceProperty } from './source.property';

export const ancestryClassConfig: EntityClassConfig = {
  id: DsTypes.ancestry,
  name: 'Ancestry',
  properties: [sourceProperty.id],
};
