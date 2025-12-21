import { EntityClassConfig, EntityClassPropertyConfig } from '@/entity';
import { DsTypes } from '../ds-types.model';
import { sourceProperty } from './source.property';

export const commonAbilityClassConfig: EntityClassConfig = {
  id: DsTypes.commonAbility,
  name: 'Common Ability',
  icon: 'phosphorSword',
  properties: [
    sourceProperty.id,
    'sheath.ds.abilityClass',
    'sheath.ds.commonAbilityType',
  ],
};

export const commonAbilityPropertyConfigs: EntityClassPropertyConfig[] = [
  {
    id: 'sheath.ds.class', // TODO: change name in mapping
    name: 'Ability Class',
    description: 'The class of the ability (e.g., combat)',
    datatype: 'string',
  },
  {
    id: 'sheath.ds.commonAbilityType',
    name: 'Ability Type',
    description:
      'The type of common ability (e.g., main-action, move-action, maneuver)',
    datatype: 'string',
  },
];
