import { createHash } from 'node:crypto';
import { dump as stringifyYaml, load as parseYaml } from 'js-yaml';
import JSZip from 'jszip';
import {
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';

/**
 * @template T
 * @param {string} raw
 * @returns {{ data: T, content: string }}
 */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    return { data: /** @type {T} */ ({}), content: raw };
  }

  const [, frontmatter, content] = match;
  const data = /** @type {T} */ (parseYaml(frontmatter) ?? {});

  return { data, content };
}

/**
 * Compute SHA-256 hash of data
 * @param {unknown} data
 * @returns {string}
 */
function computeHash(data) {
  const json = JSON.stringify(data);
  return createHash('sha256').update(json).digest('hex');
}

/**
 * Convert snake_case to camelCase
 * @param {string} str
 * @returns {string}
 */
function toCamelCase(str) {
  // Handle escaped underscores (\_) first - remove the escape
  const cleaned = str.replace(/\\_/g, '_');
  return cleaned.replace(/[_\/\-]([a-z])/g, (_, letter) =>
    letter.toUpperCase(),
  );
}

/**
 * Convert a string to kebab-case
 * Handles PascalCase, camelCase, spaces, underscores
 * @param {string} str
 * @returns {string}
 */
function toKebabCase(str) {
  return (
    str
      // Handle escaped underscores
      .replace(/\\_/g, '_')
      // Insert hyphen before uppercase letters (for PascalCase/camelCase)
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      // Replace spaces, underscores with hyphens
      .replace(/[\s_]+/g, '-')
      // Convert to lowercase
      .toLowerCase()
      // Remove any non-alphanumeric chars except hyphens and dots
      .replace(/[^a-z0-9.-]/g, '')
      // Collapse multiple hyphens
      .replace(/-+/g, '-')
      // Trim hyphens from start/end
      .replace(/^-|-$/g, '')
  );
}

/**
 * Convert a file path to kebab-case (each segment)
 * @param {string} filePath
 * @returns {string}
 */
function toKebabCasePath(filePath) {
  return filePath.split(path.sep).map(toKebabCase).join(path.sep);
}

/**
 * Recursively convert object keys from snake_case to camelCase
 * @param {unknown} obj
 * @returns {unknown}
 */
function convertKeysToSheath(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToSheath);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        `sheath.ds.${toCamelCase(key)}`,
        convertKeysToSheath(value),
      ]),
    );
  }
  return obj;
}

const repoRoot = path.resolve(process.cwd());
const inputDir = path.join(repoRoot, 'external', 'data-md');
const outputDir = path.join(repoRoot, 'dist', 'data', 'data-md');

const ignoredFiles = [
  'README.md',
  'Adventures',
  '_Index.md',
  'Draw Steel Monsters - Unlinked.md',
  'Draw Steel Heroes - Unlinked.md',
  'Monsters.md',
  'Classes.md',
];

const ignoredTypes = [
  'class/level',
  'keywords',
  'feature/ability/role-advancement',
  'kit-ability/',
  'reference\\_table/',
  'index',
];

const monsterOrgs = ['minion', 'horde', 'platoon', 'elite', 'leader', 'solo'];

const monsterRoles = [
  'ambusher',
  'artillery',
  'brute',
  'controller',
  'defender',
  'harrier',
  'hexer',
  'mount',
  'support',
];

/**
 * Walk a directory and return all file paths (for zipping)
 * @param {string} dirAbs
 * @returns {Promise<string[]>} absolute paths
 */
async function walkDir(dirAbs) {
  /** @type {string[]} */
  const results = [];
  const entries = await readdir(dirAbs, { withFileTypes: true });

  for (const entry of entries) {
    const abs = path.join(dirAbs, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkDir(abs)));
    } else if (entry.isFile()) {
      results.push(abs);
    }
  }

  return results;
}

/**
 * @param {string} dirAbs
 * @returns {Promise<string[]>} absolute paths
 */
async function walk(dirAbs) {
  /** @type {string[]} */
  const results = [];
  const entries = await readdir(dirAbs, { withFileTypes: true });

  for (const entry of entries) {
    if (ignoredFiles.includes(entry.name)) {
      continue;
    }
    const abs = path.join(dirAbs, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walk(abs)));
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      results.push(abs);
    }
  }

  return results;
}

/**
 * Transform raw frontmatter data (matching generate-data-md-content.mjs logic)
 * @param {Record<string, unknown>} data
 * @returns {Record<string, unknown>}
 */
function transformMetadata(data) {
  const result = { ...data };
  const type = /** @type {string | undefined} */ (result.type);
  delete result.scc;
  delete result.scdc;

  if (type?.startsWith('title/')) {
    result.type = 'title';
  }
  if (type?.startsWith('feature/')) {
    result.feature_type = type.split('/')[1];
    result.type = 'feature';
  }
  if (type?.startsWith('treasure/')) {
    result.type = 'treasure';
    if (result.treasure_type === 'Treasure') {
      result.treasure_type = 'artifact';
    }
  }
  if (type?.startsWith('perk/')) {
    result.perk_type = type.split('/')[1];
    result.type = 'perk';
  }
  if (type?.startsWith('dynamic-terrain/')) {
    result.dynamic_terrain_type = type.split('/')[1];
    result.type = 'dynamic-terrain';
  }
  if (type?.startsWith('common-ability/')) {
    result.common_ability_type = type.split('/')[1];
    result.type = 'common-ability';
    if (result.class) {
      result.abilityClass = result.class;
      delete result.class;
    }
  }
  if (type?.startsWith('culture\\_benefit/')) {
    result.culture_benefit_type = type.split('/')[1];
    result.type = 'culture_benefit';
  }
  if (type?.startsWith('monster/feature')) {
    result.type = 'monster-feature';
  }
  if (type?.startsWith('motivation\\_or\\_pitfall')) {
    result.type = 'motivation_or_pitfall';
  }

  const fileDpath = /** @type {string | undefined} */ (result.file_dpath);
  if (fileDpath?.startsWith('Retainers/')) {
    result.type = 'retainer';
    if (result.roles) {
      const role = result.roles[0].split(' ')[0].toLowerCase();
      delete result.roles;
      if (role) {
        result.role = role;
      }
    }
  }

  if (result.type === 'monster') {
    const roles = /** @type {string[] | undefined} */ (result.roles);
    const rolesLower = roles?.[0]?.toLowerCase();
    if (rolesLower) {
      delete result.roles;
      const org = monsterOrgs.find((o) => rolesLower.includes(o));
      if (org) {
        result.organization = org;
      }
      const role = monsterRoles.find((r) => rolesLower.includes(r));
      if (role) {
        result.role = role;
      }
    }
  }

  return result;
}

/**
 * Convert raw frontmatter to EntityFrontmatter format
 * @param {Record<string, unknown>} rawData
 * @param {string} relativePathWithoutExt - kebab-cased relative path without .md extension, used as id
 * @returns {Record<string, unknown>}
 */
function toEntityFrontmatter(rawData, relativePathWithoutExt) {
  const transformed = transformMetadata(rawData);

  // Map known fields to Entity fields
  // Use the relative path as the id
  const id = relativePathWithoutExt.replaceAll('/', '-');
  const name = transformed.item_name ?? path.basename(relativePathWithoutExt);

  const type = transformed.type
    ? `sheath.ds.${toCamelCase(transformed.type)}`
    : 'sheath.core.unknown';

  // Remove fields that are mapped to standard Entity fields
  const {
    item_id,
    item_name,
    item_index,
    file_basename,
    file_dpath,
    type: _,
    ...rest
  } = transformed;

  // Build entity frontmatter with standard fields first
  const now = new Date().toISOString();
  const entityFrontmatter = {
    id,
    type,
    name,
    createdAt: now,
    updatedAt: now,
  };

  // Convert remaining fields to camelCase and merge
  const camelCaseRest = /** @type {Record<string, unknown>} */ (
    convertKeysToSheath(rest)
  );

  // Remove 'type' from rest since it's already set
  delete camelCaseRest.type;

  return { ...entityFrontmatter, ...camelCaseRest };
}

/**
 * @param {Record<string, unknown>} frontmatter
 * @param {string} content
 * @returns {string}
 */
function toMarkdown(frontmatter, content) {
  const yaml = stringifyYaml(frontmatter, { lineWidth: -1 });
  return `---\n${yaml}---\n${content}`;
}

async function main() {
  // Ensure input exists
  await stat(inputDir);

  // Clean up existing output
  const zipPath = `${outputDir}.zip`;
  const jsonPath = path.join(path.dirname(outputDir), 'data-md.json');
  await rm(outputDir, { recursive: true, force: true });
  await rm(zipPath, { force: true });
  await rm(jsonPath, { force: true });

  const mdAbsPaths = await walk(inputDir);
  let processedCount = 0;
  let skippedCount = 0;

  /** @type {Array<{ frontmatter: Record<string, unknown>, content: string }>} */
  const allEntities = [];

  for (const absPath of mdAbsPaths) {
    const relFromInput = path.relative(inputDir, absPath);
    const raw = await readFile(absPath, 'utf8');
    const { data: rawData, content } = parseFrontmatter(raw);

    // Check if type should be ignored
    const type = /** @type {string | undefined} */ (rawData.type);
    if (ignoredTypes.some((t) => (type ?? '').startsWith(t))) {
      skippedCount++;
      continue;
    }
    if (type?.endsWith('-level-feature')) {
      skippedCount++;
      continue;
    }

    // Convert relative path to kebab-case
    const kebabRelPath = toKebabCasePath(relFromInput);
    // Get the relative path without .md extension for use as id
    const relPathWithoutExt = kebabRelPath.replace(/\.md$/, '');

    // Convert to EntityFrontmatter format with relative path as id
    const entityFrontmatter = toEntityFrontmatter(rawData, relPathWithoutExt);

    // Build output path (kebab-cased)
    const outputPath = path.join(outputDir, kebabRelPath);
    const outputDirPath = path.dirname(outputPath);

    // Ensure output directory exists
    await mkdir(outputDirPath, { recursive: true });

    // Write converted file
    const outputContent = toMarkdown(entityFrontmatter, content);
    await writeFile(outputPath, outputContent, 'utf8');

    // Collect entity data for JSON output
    allEntities.push({ ...entityFrontmatter, content });

    processedCount++;
  }

  console.log(
    `Converted ${processedCount} files to ${path.relative(repoRoot, outputDir)}`,
  );
  if (skippedCount > 0) {
    console.log(`Skipped ${skippedCount} files (ignored types)`);
  }

  // Write JSON file with all entities and a hash of the dataset
  const hash = computeHash(allEntities);
  const output = { hash, entities: allEntities };
  await writeFile(jsonPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(`Created ${path.relative(repoRoot, jsonPath)}`);

  // Create zip file
  const zipRelPath = path.relative(repoRoot, zipPath);

  const zip = new JSZip();
  const outputDirName = path.basename(outputDir);

  // Walk the output directory and add all files to zip
  const outputFiles = await walkDir(outputDir);
  for (const filePath of outputFiles) {
    const relPath = path.relative(outputDir, filePath);
    const zipEntryPath = path.join(outputDirName, relPath);
    const content = await readFile(filePath);
    zip.file(zipEntryPath, content);
  }

  // Generate and write the zip file
  const zipContent = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
  await writeFile(zipPath, zipContent);

  console.log(`Created ${zipRelPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
