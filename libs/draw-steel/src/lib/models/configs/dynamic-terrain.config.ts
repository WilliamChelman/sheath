import { EntityClassConfig, EntityClassPropertyConfig } from '@/entity';
import { DsTypes } from '../ds-types.model';
import { sourceProperty } from './source.property';

export const dynamicTerrainClassConfig: EntityClassConfig = {
  id: DsTypes.dynamicTerrain,
  name: 'Dynamic Terrain',
  icon: 'phosphorMountains',
  properties: [sourceProperty.id, 'sheath.ds.dynamicTerrainType'],
};

export const dynamicTerrainPropertyConfigs: EntityClassPropertyConfig[] = [
  {
    id: 'sheath.ds.dynamicTerrainType',
    name: 'Dynamic Terrain Type',
    description:
      'The type of dynamic terrain (e.g., environmental-hazard, fieldworks, mechanisms)',
    datatype: 'string',
  },
];
