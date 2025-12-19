/**
 * Discrete values for the type property in compendium frontmatter
 */
export type CompendiumType =
  | 'ancestry'
  | 'career'
  | 'chapter'
  | 'class'
  | 'common-ability'
  | 'complication'
  | 'condition'
  | 'culture_benefit'
  | 'dynamic-terrain'
  | 'feature'
  | 'keywords'
  | 'kit'
  | 'monster'
  | 'motivation_or_pitfall'
  | 'movement'
  | 'perk'
  | 'retainer'
  | 'skill'
  | 'title'
  | 'treasure';

/**
 * Base interface for all compendium frontmatter
 */
export interface CompendiumFrontmatterBase {
  readonly title?: string;
  readonly type?: CompendiumType | string;
  readonly file_basename?: string;
  readonly file_dpath?: string;
  readonly item_id?: string;
  readonly item_index?: string | number;
  readonly item_name?: string;
  readonly source?: string;
  readonly scc?: readonly string[];
  readonly scdc?: readonly string[];
}

/**
 * Specific frontmatter for monster entries
 */
export interface CompendiumMonsterFrontmatter extends CompendiumFrontmatterBase {
  readonly type: 'monster';
  readonly agility?: number | string;
  readonly ancestry?: string | readonly string[];
  readonly ev?: string | number;
  readonly free_strike?: number | string;
  readonly intuition?: number | string;
  readonly might?: number | string;
  readonly presence?: number | string;
  readonly reason?: number | string;
  readonly organization?: string;
  readonly role?: string;
  readonly size?: string | number;
  readonly speed?: string | number;
  readonly stability?: string | number;
  readonly stamina?: string | number;
  readonly level?: number | string;
}

/**
 * Specific frontmatter for feature and ability entries
 */
export interface CompendiumAbilityFrontmatter extends CompendiumFrontmatterBase {
  readonly type: 'common-ability' | 'feature';
  readonly ability_type?: string;
  readonly action_type?: string;
  readonly class?: string;
  readonly cost?: string;
  readonly cost_amount?: string | number;
  readonly cost_resource?: string;
  readonly distance?: string;
  readonly feature_type?: string;
  readonly flavor?: string;
  readonly keywords?: string | readonly string[];
  readonly level?: string | number;
  readonly subclass?: string;
  readonly target?: string;
}

/**
 * Specific frontmatter for chapter entries
 */
export interface CompendiumChapterFrontmatter extends CompendiumFrontmatterBase {
  readonly type: 'chapter';
  readonly chapter_num?: string | number;
}

/**
 * Specific frontmatter for culture benefit entries
 */
export interface CompendiumCultureBenefitFrontmatter extends CompendiumFrontmatterBase {
  readonly type: 'culture_benefit';
  readonly culture_benefit_type?: string;
}

/**
 * Specific frontmatter for title and treasure entries
 */
export interface CompendiumTreasureFrontmatter extends CompendiumFrontmatterBase {
  readonly type: 'treasure';
  readonly echelon?: string | number;
  readonly treasure_type?: string;
}

export interface CompendiumTitleFrontmatter extends CompendiumFrontmatterBase {
  readonly type: 'perk' | 'title' | 'treasure';
  readonly echelon?: string | number;
}

export interface CompendiumPerkFrontmatter extends CompendiumFrontmatterBase {
  readonly type: 'perk';
}

/**
 * Data model for compendium content from data-md-content.json
 */
export type CompendiumFrontmatter =
  | CompendiumMonsterFrontmatter
  | CompendiumAbilityFrontmatter
  | CompendiumChapterFrontmatter
  | CompendiumCultureBenefitFrontmatter
  | CompendiumTreasureFrontmatter
  | CompendiumTitleFrontmatter
  | CompendiumPerkFrontmatter
  | (CompendiumFrontmatterBase & { readonly [key: string]: unknown });

export interface CompendiumEntry {
  readonly publicPath: string;
  readonly sourcePath: string;
  readonly bytes: number;
  readonly mtimeMs: number;
  readonly frontmatter: CompendiumFrontmatter;
  readonly markdown: string;
  readonly html: string;
  readonly htmlAttr: string;
}

export interface CompendiumData {
  readonly version: number;
  readonly generatedAt: string;
  readonly contentHash: string;
  readonly inputDir: string;
  readonly outputDir: string;
  readonly basePublicPath: string;
  readonly count: number;
  readonly files: readonly CompendiumEntry[];
}

/**
 * Search result item with computed ID
 */
export interface CompendiumSearchResult {
  readonly id: string;
  readonly entry: CompendiumEntry;
  readonly displayName: string;
  readonly category: string;
}

/**
 * Available facet keys for filtering
 */
export type FacetKey =
  | 'type'
  | 'class'
  | 'level'
  | 'role'
  | 'organization'
  | 'source'
  | 'echelon'
  | 'action_type'
  | 'ancestry'
  | 'size'
  | 'feature_type'
  | 'subclass'
  | 'target'
  | 'common_ability_type'
  | 'treasure_type'
  | 'perk_type'
  | 'chapter_num'
  | 'culture_benefit_type'
  | 'dynamic_terrain_type';

/**
 * A single facet option with count
 */
export interface FacetOption {
  readonly value: string;
  readonly label: string;
  readonly count: number;
}

/**
 * A group of facet options for a specific key
 */
export interface FacetGroup {
  readonly key: FacetKey;
  readonly label: string;
  readonly options: readonly FacetOption[];
}

/**
 * Active filter state
 */
export type ActiveFilters = Partial<Record<FacetKey, readonly string[]>>;
