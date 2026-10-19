import fs from 'node:fs/promises';
import path from 'node:path';
import { gzipSync, gunzipSync } from 'node:zlib';
import { encodePapersCsv, parsePapersCsv } from '../public/assets/cvpr2026/data.js';

const sourcePath = path.join(process.cwd(), 'src', 'data', 'cvpr2026meta.jsonl');
const compressedPath = path.join(process.cwd(), 'src', 'data', 'cvpr2026meta.csv.gz');
const outputDir = path.join(process.cwd(), 'public', 'assets', 'cvpr2026');
const outputPath = path.join(outputDir, 'cvpr2026meta.csv.gz');

const readOptional = async (filename, encoding) => fs.readFile(filename, encoding).catch((error) => {
  if (error.code === 'ENOENT') return null;
  throw error;
});

const writeIfChanged = async (filename, content) => {
  const previous = await readOptional(filename);
  if (!previous?.equals(content)) await fs.writeFile(filename, content);
};

const run = async () => {
  const raw = await readOptional(sourcePath, 'utf8');
  let papers;
  let compressed;
  if (raw !== null) {
    papers = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`Invalid JSONL at line ${index + 1}: ${error.message}`);
      }
    });
    compressed = gzipSync(Buffer.from(encodePapersCsv(papers), 'utf8'), { level: 9 });
    await writeIfChanged(compressedPath, compressed);
  } else {
    compressed = await fs.readFile(compressedPath);
    papers = parsePapersCsv(gunzipSync(compressed).toString('utf8'));
  }

  await fs.mkdir(outputDir, { recursive: true });
  await writeIfChanged(outputPath, compressed);
  await fs.rm(path.join(outputDir, 'cvpr2026meta.json'), { force: true });
  console.log(`[cvpr2026] Synced ${papers.length} papers as CSV.GZ (${(compressed.length / 1024 / 1024).toFixed(2)} MiB).`);
};

run().catch((error) => {
  console.error(`[cvpr2026] Sync failed: ${error.message}`);
  process.exitCode = 1;
});
