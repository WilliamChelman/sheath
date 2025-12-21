import { EntityClassConfig } from '@/entity';
import { DsTypes } from '../ds-types.model';
import { sourceProperty } from './source.property';

export const skillClassConfig: EntityClassConfig = {
  id: DsTypes.skill,
  name: 'Skill',
  icon: 'phosphorGraduationCap',
  properties: [sourceProperty.id],
};
