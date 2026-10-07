import { getCollection, type CollectionEntry } from 'astro:content';
import { visible } from './drafts';

export type Post = CollectionEntry<'blog'>;

/** Visible posts, newest first. */
export async function posts(): Promise<Post[]> {
  return (await getCollection('blog')).filter(visible).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Minutes to read, at about 220 words a minute. */
export const readingTime = (post: Post) => Math.max(1, Math.round((post.body ?? '').split(/\s+/).filter(Boolean).length / 220));

export const formatDate = (d: Date) => d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

/** Related posts: same category first, then shared tags. */
export function related(post: Post, all: Post[], n = 3): Post[] {
  const score = (p: Post) => (p.data.category === post.data.category ? 2 : 0) + p.data.tags.filter((t) => post.data.tags.includes(t)).length;
  return all
    .filter((p) => p.id !== post.id)
    .map((p) => ({ p, s: score(p) }))
    .sort((a, b) => b.s - a.s || b.p.data.date.getTime() - a.p.data.date.getTime())
    .slice(0, n)
    .map((x) => x.p);
}
