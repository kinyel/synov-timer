import type { APIRoute } from 'astro';
import { SHOW_DRAFTS } from '../lib/drafts';

/** A drafts preview build asks not to be crawled at all. */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('/sitemap-index.xml', site).toString();
  const body = SHOW_DRAFTS ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${sitemap}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
