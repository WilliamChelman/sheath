import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd());

const outputFile = path.join(
  repoRoot,
  'apps',
  'web-app',
  'public',
  'config.json',
);

async function main() {
  const config = {
    buildDate: new Date().toISOString(),
    version: '1.0.0',
  };

  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(config, null, 2)}\n`, 'utf8');

  console.log(`Wrote config file to ${path.relative(repoRoot, outputFile)}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
