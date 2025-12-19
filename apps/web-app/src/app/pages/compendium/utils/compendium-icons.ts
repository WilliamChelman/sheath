/**
 * Icon mapping for compendium entry types using @ng-icons/game-icons
 */
import type { CompendiumType } from '../models/compendium.model';

// Icons imported from @ng-icons/game-icons
import {
  gameDna2,
  gameBlacksmith,
  gameOpenBook,
  gameSwordsEmblem,
  gamePunchBlast,
  gameWolfTrap,
  gameHeartBeats,
  gameCampfire,
  gameMountainRoad,
  gameUpgrade,
  gameThreeFriends,
  gameBackpack,
  gameMinotaur,
  gameCompass,
  gameRun,
  gameSparkles,
  gamePerson,
  gameCog,
  gameCrownedHeart,
  gameOpenTreasureChest,
} from '@ng-icons/game-icons';

/**
 * Mapping from CompendiumType to icon name
 */
export const COMPENDIUM_TYPE_ICONS: Record<CompendiumType, string> = {
  ancestry: 'gameDna2',
  career: 'gameBlacksmith',
  chapter: 'gameOpenBook',
  class: 'gameSwordsEmblem',
  'common-ability': 'gamePunchBlast',
  complication: 'gameWolfTrap',
  condition: 'gameHeartBeats',
  culture_benefit: 'gameCampfire',
  'dynamic-terrain': 'gameMountainRoad',
  feature: 'gameUpgrade',
  keywords: 'gameThreeFriends',
  kit: 'gameBackpack',
  monster: 'gameMinotaur',
  motivation_or_pitfall: 'gameCompass',
  movement: 'gameRun',
  perk: 'gameSparkles',
  retainer: 'gamePerson',
  skill: 'gameCog',
  title: 'gameCrownedHeart',
  treasure: 'gameOpenTreasureChest',
};

/**
 * Default icon for unknown types
 */
export const DEFAULT_COMPENDIUM_ICON = 'gameOpenBook';

/**
 * All icons that need to be registered with ng-icons
 */
export const COMPENDIUM_ICONS = {
  gameDna2,
  gameBlacksmith,
  gameOpenBook,
  gameSwordsEmblem,
  gamePunchBlast,
  gameWolfTrap,
  gameHeartBeats,
  gameCampfire,
  gameMountainRoad,
  gameUpgrade,
  gameThreeFriends,
  gameBackpack,
  gameMinotaur,
  gameCompass,
  gameRun,
  gameSparkles,
  gamePerson,
  gameCog,
  gameCrownedHeart,
  gameOpenTreasureChest,
};

/**
 * Get the icon name for a given compendium type
 */
export function getCompendiumTypeIcon(type: string | undefined): string {
  if (!type) return DEFAULT_COMPENDIUM_ICON;
  return (
    COMPENDIUM_TYPE_ICONS[type as CompendiumType] ?? DEFAULT_COMPENDIUM_ICON
  );
}
