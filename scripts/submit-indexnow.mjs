import fs from 'node:fs/promises';
import path from 'node:path';

const host = 'choucisan.github.io';
const key = '4537669cc7f348dda4b60051171138f7';
const keyLocation = `https://${host}/${key}.txt`;
const sitemapPath = path.join(process.cwd(), 'dist', 'sitemap.xml');
const isDryRun = process.argv.includes('--dry-run');

const xml = await fs.readFile(sitemapPath, 'utf8').catch((error) => {
  if (error.code === 'ENOENT') {
    throw new Error('Missing dist/sitemap.xml. Run `npm run build` before `npm run indexnow`.');
  }
  throw error;
});

const urlList = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g), (match) => match[1])
  .map((url) => url.trim())
  .filter((url) => url.startsWith(`https://${host}/`));

if (urlList.length === 0) {
  throw new Error(`No URLs for ${host} found in ${sitemapPath}.`);
}

const payload = {
  host,
  key,
  keyLocation,
  urlList
};

if (isDryRun) {
  console.log(`Dry run: prepared ${urlList.length} URLs for IndexNow.`);
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

const response = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  },
  body: JSON.stringify(payload)
});

const responseText = await response.text();

console.log(`Submitted ${urlList.length} URLs to IndexNow.`);
console.log(`Status: ${response.status} ${response.statusText}`);
if (responseText) console.log(responseText);

if (!response.ok) {
  process.exitCode = 1;
}
