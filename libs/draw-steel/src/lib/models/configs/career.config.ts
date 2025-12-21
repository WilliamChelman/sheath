import { EntityClassConfig } from '@/entity';
import { DsTypes } from '../ds-types.model';
import { sourceProperty } from './source.property';

export const careerClassConfig: EntityClassConfig = {
  id: DsTypes.career,
  name: 'Career',
  properties: [sourceProperty.id],
};
