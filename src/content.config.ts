import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Content collections. Entries marked `draft: true` are visible in
 * development and preview builds (PUBLIC_SHOW_DRAFTS=true) and are left out
 * of production. See README › "Adding content".
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.enum(['CMDB', 'ITSM', 'ITOM', 'ITAM', 'AI', 'Architecture', 'Integrations']),
    tags: z.array(z.string()).default([]),
    author: z.string().default('Charles'),
    draft: z.boolean().default(false),
  }),
});

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    clientType: z.string(),
    industry: z.string(),
    challenge: z.string(),
    approach: z.array(z.string()),
    modules: z.array(z.string()),
    results: z.array(z.string()),
    quote: z.object({ text: z.string(), by: z.string() }).optional(),
    draft: z.boolean().default(false),
  }),
});

const roles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/roles' }),
  schema: z.object({
    title: z.string(),
    location: z.string(),
    type: z.string(),
    summary: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, caseStudies, roles };
