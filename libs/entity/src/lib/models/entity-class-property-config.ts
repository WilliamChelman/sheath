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
  isSortable?: boolean;
}

export type EntityPropertyDataType = 'string' | 'number' | 'boolean';
