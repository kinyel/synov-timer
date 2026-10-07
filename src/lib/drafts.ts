/** Drafts show in development and in preview builds with PUBLIC_SHOW_DRAFTS=true; never in production. */
export const SHOW_DRAFTS = import.meta.env.DEV || import.meta.env.PUBLIC_SHOW_DRAFTS === 'true';
export const visible = <T extends { data: { draft?: boolean } }>(entry: T) => SHOW_DRAFTS || !entry.data.draft;
