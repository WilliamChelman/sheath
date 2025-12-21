export interface EntityClassConfig {
  id: string;
  name: string;
  properties: string[];
  displayedProperties?: string[];
  parentClass?: string;
  icon?: string;
}
