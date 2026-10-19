import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const sourceDir = process.argv[2];
const outputPath = fileURLToPath(new URL('../src/data/lab-safety.csv.gz', import.meta.url));

const encodeCell = (value) => `"${String(value).replaceAll('"', '""')}"`;

const run = async () => {
  if (!sourceDir) {
    throw new Error('Usage: node scripts/import-lab-safety-data.mjs /path/to/bupt-lab-safety-main/data');
  }

  const filenames = (await fs.readdir(sourceDir)).filter((filename) => filename.endsWith('.json')).sort();
  const questions = new Map();
  let originalCount = 0;

  for (const filename of filenames) {
    const records = JSON.parse(await fs.readFile(path.join(sourceDir, filename), 'utf8'));
    for (const record of records) {
      originalCount += 1;
      if (!record.qtext || !['单选题', '多选题'].includes(record.qtype)
        || !record.opts || !Array.isArray(record.ans) || !record.ans.length
        || record.ans.some((answer) => !Object.hasOwn(record.opts, answer))) {
        throw new Error(`Invalid question in ${filename}: ${record.qtext}`);
      }
      const existing = questions.get(record.qtext);
      if (existing) {
        const signature = (question) => JSON.stringify([
          question.qtype,
          Object.entries(question.opts).sort(([first], [second]) => first.localeCompare(second)),
          [...question.ans].sort()
        ]);
        if (signature(existing) !== signature(record)) {
          throw new Error(`Conflicting duplicate question: ${record.qtext}`);
        }
        existing.source_files.add(filename);
      } else {
        questions.set(record.qtext, { ...record, source_files: new Set([filename]) });
      }
    }
  }

  if (!questions.size) throw new Error('No questions found in the source directory.');

  const rows = [['id', 'qtext', 'qtype', 'opts', 'ans', 'source_files', 'qurl']];
  for (const [index, question] of [...questions.values()].entries()) {
    rows.push([
      index + 1,
      question.qtext,
      question.qtype,
      JSON.stringify(question.opts),
      JSON.stringify(question.ans),
      JSON.stringify([...question.source_files]),
      question.qurl ?? ''
    ]);
  }

  const csv = `${rows.map((row) => row.map(encodeCell).join(',')).join('\r\n')}\r\n`;
  await fs.writeFile(outputPath, gzipSync(Buffer.from(csv, 'utf8'), { level: 9 }));
  console.log(`[lab-safety] ${originalCount} records → ${questions.size} unique questions from ${filenames.length} files.`);
  console.log(`[lab-safety] Saved ${outputPath}`);
};

run().catch((error) => {
  console.error(`[lab-safety] ${error.message}`);
  process.exitCode = 1;
});
