import { Entity } from './entity';

export interface BaseEntityFacetConfig<T extends Entity> {
  key: keyof T;
  type: string;
}

export interface EnumFacetConfig<
  T extends Entity,
> extends BaseEntityFacetConfig<T> {
  type: 'enum';
  sortType: 'count' | 'alphabetical';
}

export type EntityFacetConfig<T extends Entity> = EnumFacetConfig<T>;

export function createEntityFacetConfig<T extends Entity>(
  config: EntityFacetConfig<T>,
): EntityFacetConfig<T> {
  return config;
}
