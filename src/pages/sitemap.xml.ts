// sitemap.xml:首页、扩展列表,以及每个扩展的详情页。扩展来自构建时读取的签名索引,所以这里自动生成,不手写。
import type { APIRoute } from 'astro';
import { URLS } from '../data/site';
import { extensionPath, getExtensions } from '../data/extensions';

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://loog.dev');
  const paths = ['/', URLS.extensions, ...(await getExtensions()).map((e) => extensionPath(e.id))];
  const urls = paths.map((p) => `  <url><loc>${new URL(p, base).href}</loc></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
