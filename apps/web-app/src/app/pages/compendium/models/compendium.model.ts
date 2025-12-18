/**
 * Data model for compendium content from data-md-content.json
 */

export interface CompendiumFrontmatter {
  readonly title?: string;
  readonly type?: string;
  readonly file_basename?: string;
  readonly file_dpath?: string;
  readonly item_id?: string;
  readonly item_index?: string;
  readonly item_name?: string;
  readonly source?: string;
  readonly scc?: readonly string[];
  readonly scdc?: readonly string[];
  readonly [key: string]: unknown;
}

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

