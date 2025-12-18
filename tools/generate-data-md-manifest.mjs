import { readdir, stat, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd());
const inputDir = path.join(repoRoot, 'external', 'data-md');
const outputFile = path.join(
  repoRoot,
  'apps',
  'web-app',
  'public',
  'data-md-manifest.json',
);

/**
 * @param {string} dirAbs
 * @returns {Promise<string[]>} absolute paths
 */
async function walk(dirAbs) {
  /** @type {string[]} */
  const results = [];
  const entries = await readdir(dirAbs, { withFileTypes: true });

  for (const entry of entries) {
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
      const st = await stat(abs);
      return {
        // Where the Angular build copies these to (see apps/web-app/project.json assets config)
        publicPath: toPosixPath(
          path.posix.join('data-md', toPosixPath(relFromInput)),
        ),
        sourcePath: toPosixPath(path.join('external', 'data-md', relFromInput)),
        bytes: st.size,
        mtimeMs: st.mtimeMs,
      };
    }),
  );

  files.sort((a, b) => a.publicPath.localeCompare(b.publicPath));

  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    inputDir: 'external/data-md',
    outputDir: 'apps/web-app/public',
    // Helpful for clients: fetch(`/data-md/...`) or use `data-md/...` as a relative URL.
    basePublicPath: 'data-md',
    count: files.length,
    files,
  };

  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(
    `Wrote ${files.length} entries to ${path.relative(repoRoot, outputFile)}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});


