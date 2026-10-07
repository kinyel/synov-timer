import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { posts } from '../lib/blog';
import { SITE } from '../data/site';

export async function GET(context: APIContext) {
  const items = (await posts()).filter((p) => !p.data.draft);
  return rss({
    title: `${SITE.name} blog`,
    description: 'Practical ServiceNow notes from Raleston’s architects.',
    site: context.site ?? SITE.url,
    items: items.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/blog/${p.id}/`,
      categories: [p.data.category, ...p.data.tags],
      author: `${SITE.email} (${p.data.author})`,
    })),
    customData: '<language>en-ca</language>',
  });
}
