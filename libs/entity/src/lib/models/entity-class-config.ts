export interface EntityClassConfig {
  id: string;
  name: string;
  properties: string[];
  parentClass?: string;
}

export interface EntityClassPropertyConfig {
  id: string;
  name: string;
  description?: string;
  datatype?: EntityPropertyDataType;
  classId?: string;
  required?: boolean;
  default?: unknown;
  isMulti?: boolean;
  isFacet?: boolean;
}

export type EntityPropertyDataType = 'string' | 'number' | 'boolean';
