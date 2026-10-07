import type { APIRoute, GetStaticPaths } from 'astro';
import { ogPages, renderCard, type OgPage } from '../../lib/og';

export const getStaticPaths = (async () => (await ogPages()).map((page) => ({ params: { slug: page.slug }, props: { page } }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderCard((props as { page: OgPage }).page);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
