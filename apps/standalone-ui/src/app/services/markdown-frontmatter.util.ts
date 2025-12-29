import { Entity } from '@/entity';
import { dump as stringifyYaml, load as parseYaml } from 'js-yaml';

const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

const STANDARD_ENTITY_KEYS = new Set([
  'id',
  'type',
  'name',
  'spaceId',
  'description',
  'image',
  'tags',
  'createdAt',
  'updatedAt',
]);

export interface ParsedFrontmatter<T = Record<string, unknown>> {
  data: T;
  content: string;
}

/**
 * Parse YAML frontmatter from a markdown string
 */
export function parseFrontmatter<T = Record<string, unknown>>(
  raw: string,
): ParsedFrontmatter<T> {
  const match = raw.match(FRONTMATTER_REGEX);

  if (!match) {
    return { data: {} as T, content: raw };
  }

  const [, frontmatter, content] = match;
  const data = (parseYaml(frontmatter) ?? {}) as T;

  return { data, content };
}

/**
 * Generate markdown string with YAML frontmatter
 */
export function toMarkdown(
  frontmatter: Record<string, unknown>,
  content: string,
): string {
  const yaml = stringifyYaml(frontmatter, { lineWidth: -1 });
  return `---\n${yaml}---\n${content}`;
}

/**
 * Convert Entity to frontmatter object for YAML serialization
 */
export function entityToFrontmatter(entity: Entity): Record<string, unknown> {
  const frontmatter: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(entity)) {
    if (key !== 'content' && value != null) {
      frontmatter[key] = value;
    }
  }

  return frontmatter;
}

/**
 * Convert parsed frontmatter data + content to Entity
 */
export function frontmatterToEntity(
  data: Record<string, unknown>,
  content: string,
): Entity {
  const entity = {
    ...data,
  } as unknown as Entity;

  // Add markdown content
  if (content.trim()) {
    entity.content = content;
  }

  return entity;
}

/**
 * Convert a string to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate an ID from entity type and name
 */
export function generateEntityId(type: string, name: string): string {
  const typeSlug = type.replace(/\./g, '-');
  const nameSlug = toKebabCase(name);
  return `${typeSlug}-${nameSlug}`;
}
