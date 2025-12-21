import { EntityClassConfig, EntityClassPropertyConfig } from '@/entity';
import { DsTypes } from '../ds-types.model';
import { sourceProperty } from './source.property';

export const cultureBenefitClassConfig: EntityClassConfig = {
  id: DsTypes.cultureBenefit,
  name: 'Culture Benefit',
  icon: 'phosphorGlobeSimple',
  properties: [sourceProperty.id, 'sheath.ds.cultureBenefitType'],
};

export const cultureBenefitPropertyConfigs: EntityClassPropertyConfig[] = [
  {
    id: 'sheath.ds.cultureBenefitType',
    name: 'Culture Benefit Type',
    description: 'The type of culture benefit (e.g., upbringing, organization)',
    datatype: 'string',
  },
];
