import matter from 'gray-matter';
import { marked } from 'marked';
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

  const files = await Promise.all(
    mdAbsPaths.map(async (abs) => {
      const relFromInput = path.relative(inputDir, abs);
      const raw = await readFile(abs, 'utf8');

      // gray-matter expects YAML frontmatter delimited by `---`
      // If there is no frontmatter, `data` will be {} and `content` is the whole file.
      const parsed = matter(raw);
      const markdown = parsed.content;
      const html = await marked.parse(markdown);

      return {
        // Where the Angular build copies these to (see apps/web-app/project.json assets config)
        publicPath: toPosixPath(
          path.posix.join('data-md', toPosixPath(relFromInput)),
        ),
        frontmatter: parsed.data ?? {},
        html,
      };
    }),
  );

  files.sort((a, b) => a.publicPath.localeCompare(b.publicPath));

  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
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

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
