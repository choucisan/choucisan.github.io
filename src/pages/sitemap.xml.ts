import { getCollection } from 'astro:content';

const staticRoutes = ['/', '/about/', '/blogs/', '/collections/', '/publications/', '/workshops/'];

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export async function GET({ site }: { site: URL }) {
  const [blogs, collections, publications, workshops] = await Promise.all([
    getCollection('blogs', (item) => !item.data.draft),
    getCollection('collections', (item) => !item.data.draft),
    getCollection('publications', (item) => !item.data.draft),
    getCollection('workshops', (item) => !item.data.draft)
  ]);

  const entries = [
    ...staticRoutes.map((path) => ({ path })),
    ...blogs.map((item) => ({ path: `/blogs/${item.id}/`, lastmod: item.data.pubDate })),
    ...collections.map((item) => ({ path: `/collections/${item.id}/`, lastmod: item.data.pubDate })),
    ...publications.map((item) => ({ path: `/publications/${item.id}/`, lastmod: item.data.pubDate })),
    ...workshops.map((item) => ({ path: `/workshops/${item.id}/`, lastmod: item.data.pubDate }))
  ];

  const urls = entries
    .map(({ path, lastmod }) => {
      const loc = escapeXml(new URL(path, site).toString());
      const lastmodTag = lastmod ? `\n    <lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : '';
      return `  <url>\n    <loc>${loc}</loc>${lastmodTag}\n  </url>`;
    })
    .join('\n');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
}
