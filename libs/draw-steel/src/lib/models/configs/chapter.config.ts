import { EntityClassConfig, EntityClassPropertyConfig } from '@/entity';
import { DsTypes } from '../ds-types.model';
import { sourceProperty } from './source.property';

export const chapterClassConfig: EntityClassConfig = {
  id: DsTypes.chapter,
  name: 'Chapter',
  icon: 'phosphorBookOpen',
  properties: [sourceProperty.id, 'sheath.ds.chapterNum'],
};

export const chapterPropertyConfigs: EntityClassPropertyConfig[] = [
  {
    id: 'sheath.ds.chapterNum',
    name: 'Chapter Number',
    datatype: 'number',
  },
];
