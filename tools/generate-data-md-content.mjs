import matter from 'gray-matter';
import { marked } from 'marked';
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd());
const inputDir = path.join(repoRoot, 'external', 'data-md');
const outputFile = path.join(
  repoRoot,
  'apps',
  'web-app',
  'public',
  'data-md-content.json',
);

const ignoredFiles = [
  'README.md',
  'Adventures',
  '_Index.md',
  'Draw Steel Monsters - Unlinked.md',
  'Draw Steel Heroes - Unlinked.md',
];

const ignoredTypes = [
  'class/level',
  'feature/ability/role-advancement',
  'kit-ability/',
  'reference\\_table/',
  'index',
];

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
 * @param {string} p
 */
function toPosixPath(p) {
  return p.split(path.sep).join('/');
}

async function main() {
  // Ensure input exists (gives a clearer error than walk() recursion)
  await stat(inputDir);

  const mdAbsPaths = await walk(inputDir);

  const files = (
    await Promise.all(
      mdAbsPaths.map(async (abs) => {
        const relFromInput = path.relative(inputDir, abs);
        const raw = await readFile(abs, 'utf8');

        // gray-matter expects YAML frontmatter delimited by `---`
        // If there is no frontmatter, `data` will be {} and `content` is the whole file.
        const parsed = matter(raw);
        const markdown = parsed.content;
        const html = await marked.parse(markdown);

        const rawData = parsed.data ?? {};
        if (
          ignoredTypes.some((type) => (rawData.type ?? '').startsWith(type))
        ) {
          return undefined;
        }
        if (rawData.type?.endsWith('-level-feature')) {
          return undefined;
        }

        const frontmatter = transformMetadata(rawData);
        return {
          // Where the Angular build copies these to (see apps/web-app/project.json assets config)
          publicPath: toPosixPath(
            path.posix.join('data-md', toPosixPath(relFromInput)),
          ),
          frontmatter,
          html,
        };
      }),
    )
  ).filter(Boolean);

  files.sort((a, b) => a.publicPath.localeCompare(b.publicPath));

  const contentHash = createHash('sha256')
    .update(JSON.stringify(files))
    .digest('hex');

  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    contentHash,
    inputDir: 'external/data-md',
    outputDir: 'apps/web-app/public',
    basePublicPath: 'data-md',
    count: files.length,
    files,
  };

  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(
    `Wrote ${files.length} entries to ${path.relative(repoRoot, outputFile)}`,
  );
}

function transformMetadata(data) {
  if (data.type?.startsWith('title/')) {
    data.type = 'title';
  }
  if (data.type?.startsWith('feature/')) {
    data.feature_type = data.type.split('/')[1];
    data.type = 'feature';
  }

  if (data.type?.startsWith('treasure/')) {
    data.type = 'treasure';
    if (data.treasure_type === 'Treasure') {
      data.treasure_type = 'artifact';
    }
  }
  if (data.type?.startsWith('perk/')) {
    data.perk_type = data.type.split('/')[1];
    data.type = 'perk';
  }
  if (data.type?.startsWith('dynamic-terrain/')) {
    data.dynamic_terrain_type = data.type.split('/')[1];
    data.type = 'dynamic-terrain';
  }
  if (data.type?.startsWith('common-ability/')) {
    data.common_ability_type = data.type.split('/')[1];
    data.type = 'common-ability';
  }
  if (data.type?.startsWith('culture\\_benefit/')) {
    data.culture_benefit_type = data.type.split('/')[1];
    data.type = 'culture_benefit';
  }
  if (data.type?.startsWith('monster/feature')) {
    data.type = 'monster-feature';
  }
  if (data.type?.startsWith('motivation\\_or\\_pitfall')) {
    data.type = 'motivation_or_pitfall';
  }

  if (data.file_dpath?.startsWith('Retainers/')) {
    data.type = 'retainer';
  }

  if (data.type === 'monster') {
    const roles = data.roles?.[0]?.toLowerCase();
    if (roles) {
      delete data.roles;
      const org = monsterOrgs.find((o) => roles.includes(o));
      if (org) {
        data.organization = org;
      }
      const role = monsterRoles.find((r) => roles.includes(r));
      if (role) {
        data.role = role;
      }
    }
  }

  return data;
}

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

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
