import { EntityClassConfig, EntityClassPropertyConfig } from '@/entity';

// Class configs
export { ancestryClassConfig } from './ancestry.config';
export { careerClassConfig } from './career.config';
export { chapterClassConfig, chapterPropertyConfigs } from './chapter.config';
export { classClassConfig } from './class.config';
export {
  commonAbilityClassConfig,
  commonAbilityPropertyConfigs,
} from './common-ability.config';
export { complicationClassConfig } from './complication.config';
export { conditionClassConfig } from './condition.config';
export {
  cultureBenefitClassConfig,
  cultureBenefitPropertyConfigs,
} from './culture-benefit.config';
export {
  dynamicTerrainClassConfig,
  dynamicTerrainPropertyConfigs,
} from './dynamic-terrain.config';
export { keywordsClassConfig } from './keywords.config';
export { kitClassConfig } from './kit.config';
export { monsterFeatureClassConfig } from './monster-feature.config';
export { monsterSectionClassConfig } from './monster-section.config';
export { monsterClassConfig, monsterPropertyConfigs } from './monster.config';
export { motivationOrPitfallClassConfig } from './motivation-or-pitfall.config';
export { movementClassConfig } from './movement.config';
export { perkClassConfig, perkPropertyConfigs } from './perk.config';
export {
  retainerClassConfig,
  retainerPropertyConfigs,
} from './retainer.config';
export { skillClassConfig } from './skill.config';
export { titleClassConfig, titlePropertyConfigs } from './title.config';
export {
  treasureClassConfig,
  treasurePropertyConfigs,
} from './treasure.config';

// Import all configs for aggregation
import { ancestryClassConfig } from './ancestry.config';
import { careerClassConfig } from './career.config';
import { chapterClassConfig, chapterPropertyConfigs } from './chapter.config';
import { classClassConfig } from './class.config';
import {
  commonAbilityClassConfig,
  commonAbilityPropertyConfigs,
} from './common-ability.config';
import { complicationClassConfig } from './complication.config';
import { conditionClassConfig } from './condition.config';
import {
  cultureBenefitClassConfig,
  cultureBenefitPropertyConfigs,
} from './culture-benefit.config';
import {
  dynamicTerrainClassConfig,
  dynamicTerrainPropertyConfigs,
} from './dynamic-terrain.config';
import { keywordsClassConfig } from './keywords.config';
import { kitClassConfig } from './kit.config';
import { monsterFeatureClassConfig } from './monster-feature.config';
import { monsterSectionClassConfig } from './monster-section.config';
import { monsterClassConfig, monsterPropertyConfigs } from './monster.config';
import { motivationOrPitfallClassConfig } from './motivation-or-pitfall.config';
import { movementClassConfig } from './movement.config';
import { perkClassConfig, perkPropertyConfigs } from './perk.config';
import {
  retainerClassConfig,
  retainerPropertyConfigs,
} from './retainer.config';
import { skillClassConfig } from './skill.config';
import { titleClassConfig, titlePropertyConfigs } from './title.config';
import {
  treasureClassConfig,
  treasurePropertyConfigs,
} from './treasure.config';

/**
 * All DS entity class configurations
 */
export const allDsClassConfigs: EntityClassConfig[] = [
  ancestryClassConfig,
  careerClassConfig,
  chapterClassConfig,
  classClassConfig,
  commonAbilityClassConfig,
  complicationClassConfig,
  conditionClassConfig,
  cultureBenefitClassConfig,
  dynamicTerrainClassConfig,
  keywordsClassConfig,
  kitClassConfig,
  monsterClassConfig,
  monsterFeatureClassConfig,
  monsterSectionClassConfig,
  motivationOrPitfallClassConfig,
  movementClassConfig,
  perkClassConfig,
  retainerClassConfig,
  skillClassConfig,
  titleClassConfig,
  treasureClassConfig,
];

/**
 * All DS entity property configurations
 */
export const allDsPropertyConfigs: EntityClassPropertyConfig[] = [
  ...chapterPropertyConfigs,
  ...commonAbilityPropertyConfigs,
  ...cultureBenefitPropertyConfigs,
  ...dynamicTerrainPropertyConfigs,
  ...monsterPropertyConfigs,
  ...perkPropertyConfigs,
  ...retainerPropertyConfigs,
  ...titlePropertyConfigs,
  ...treasurePropertyConfigs,
];
