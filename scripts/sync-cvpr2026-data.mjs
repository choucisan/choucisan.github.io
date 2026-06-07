import fs from 'node:fs/promises';
import path from 'node:path';

const sourcePath = path.join(process.cwd(), 'src', 'data', 'cvpr2026meta.jsonl');
const outputPath = path.join(process.cwd(), 'public', 'assets', 'cvpr2026', 'cvpr2026meta.json');

const run = async () => {
  const raw = await fs.readFile(sourcePath, 'utf8');
  const papers = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`Invalid JSONL at line ${index + 1}: ${error.message}`);
      }
    });

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(papers, null, 2)}\n`);
  console.log(`[cvpr2026] Synced ${papers.length} papers to visualization site.`);
};

run().catch((error) => {
  console.error(`[cvpr2026] Sync failed: ${error.message}`);
  process.exitCode = 1;
});
