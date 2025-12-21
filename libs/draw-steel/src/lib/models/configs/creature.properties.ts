import { EntityClassPropertyConfig } from '@/entity';

/**
 * Common property IDs shared between monsters and retainers.
 * Use with spread operator in EntityClassConfig.properties array.
 */
export const creaturePropertyIds = [
  'sheath.ds.level',
  'sheath.ds.ev',
  'sheath.ds.size',
  'sheath.ds.speed',
  'sheath.ds.stamina',
  'sheath.ds.stability',
  'sheath.ds.freeStrike',
  'sheath.ds.might',
  'sheath.ds.agility',
  'sheath.ds.reason',
  'sheath.ds.intuition',
  'sheath.ds.presence',
  'sheath.ds.ancestry',
  'sheath.ds.role',
] as const;

/**
 * Common property configs shared between monsters and retainers.
 */
export const creaturePropertyConfigs: EntityClassPropertyConfig[] = [
  {
    id: 'sheath.ds.level',
    name: 'Level',
    description: 'The creature level',
    datatype: 'number',
    isSortable: true,
  },
  {
    id: 'sheath.ds.ev',
    name: 'EV',
    description: 'Encounter Value',
    datatype: 'string',
    isSortable: true,
  },
  {
    id: 'sheath.ds.size',
    name: 'Size',
    description: 'The creature size (e.g., 1S, 1M, 2)',
    datatype: 'string',
  },
  {
    id: 'sheath.ds.speed',
    name: 'Speed',
    description: 'Movement speed in squares',
    datatype: 'number',
    isFacet: false,
  },
  {
    id: 'sheath.ds.stamina',
    name: 'Stamina',
    description: 'Health/stamina points',
    datatype: 'string',
    isFacet: false,
  },
  {
    id: 'sheath.ds.stability',
    name: 'Stability',
    description: 'Resistance to forced movement',
    datatype: 'number',
    isFacet: false,
  },
  {
    id: 'sheath.ds.freeStrike',
    name: 'Free Strike',
    description: 'Free strike damage value',
    datatype: 'number',
    isFacet: false,
  },
  {
    id: 'sheath.ds.might',
    name: 'Might',
    description: 'Might characteristic',
    datatype: 'number',
    isFacet: false,
  },
  {
    id: 'sheath.ds.agility',
    name: 'Agility',
    description: 'Agility characteristic',
    datatype: 'number',
    isFacet: false,
  },
  {
    id: 'sheath.ds.reason',
    name: 'Reason',
    description: 'Reason characteristic',
    datatype: 'number',
    isFacet: false,
  },
  {
    id: 'sheath.ds.intuition',
    name: 'Intuition',
    description: 'Intuition characteristic',
    datatype: 'number',
    isFacet: false,
  },
  {
    id: 'sheath.ds.presence',
    name: 'Presence',
    description: 'Presence characteristic',
    datatype: 'number',
    isFacet: false,
  },
  {
    id: 'sheath.ds.ancestry',
    name: 'Ancestry',
    description: 'Creature ancestry/keywords (e.g., Humanoid, Beast)',
    datatype: 'string',
    isMulti: true,
  },
  {
    id: 'sheath.ds.role',
    name: 'Role',
    description: 'Creature role (e.g., ambusher, brute, defender)',
    datatype: 'string',
  },
];
