/**
 * Line icons on a 24 × 24 grid, drawn with a 1.6 stroke and round ends so they
 * match each other. Used through Icon.astro.
 */
export const ICONS = {
  // Services
  itsm: '<path d="M4.5 14v-2a7.5 7.5 0 0 1 15 0v2"/><rect x="3" y="13.5" width="4" height="6" rx="1.6"/><rect x="17" y="13.5" width="4" height="6" rx="1.6"/><path d="M19 19.5c0 1.4-1.6 2-4 2h-2"/>',
  itom: '<path d="M2.5 12.5h4l2.2-5.5 4.6 11 2.4-5.5h5.8"/><circle cx="12" cy="12" r="10" opacity=".35"/>',
  itam: '<path d="M12 2.8 20.5 7.5v9L12 21.2 3.5 16.5v-9z"/><path d="M3.8 7.6 12 12.2l8.2-4.6M12 12.2v9"/><path d="M7.5 10.2v3.2M9.6 11.4v3.2" opacity=".6"/>',
  cmdb: '<ellipse cx="12" cy="5.5" rx="7.5" ry="2.8"/><path d="M4.5 5.5v6c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-6"/><path d="M4.5 11.5v6c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-6"/>',
  spm: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.2"/><path d="m15 9 5.5-5.5M17.5 3.5v3h3"/>',
  integrations: '<circle cx="5.5" cy="12" r="2.6"/><circle cx="18.5" cy="5.5" r="2.6"/><circle cx="18.5" cy="18.5" r="2.6"/><path d="M8 11 16 6.5M8 13l8 4.5"/>',
  appEngine: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.8"/><path d="M17 13.5v7M13.5 17h7"/>',
  architecture: '<path d="M12 3 21 8l-9 5-9-5z"/><path d="m3 12.2 9 5 9-5"/><path d="m3 16.2 9 5 9-5" opacity=".55"/>',
  advisory: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8z"/>',
  implementation: '<path d="M4 20h16M6 20V9l6-5 6 5v11"/><path d="M10 20v-5h4v5"/><path d="M9.5 10.5h5" opacity=".6"/>',
  integrationDelivery: '<path d="M9.5 14.5 14.5 9.5"/><path d="M11 6.5 12.6 5a4.2 4.2 0 0 1 6 6L17 12.6"/><path d="M13 17.5 11.4 19a4.2 4.2 0 0 1-6-6L7 11.4"/>',
  support: '<path d="M12 3 19.5 6v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z"/><path d="m8.8 12.2 2.2 2.2 4.4-4.6"/>',
  // AI, data, partners
  ai: '<path d="M12 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5z"/><path d="M18.5 15.5c.3 1.6 1.1 2.4 2.7 2.7-1.6.3-2.4 1.1-2.7 2.7-.3-1.6-1.1-2.4-2.7-2.7 1.6-.3 2.4-1.1 2.7-2.7z"/>',
  network: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z"/>',
  // Industries (no domes or spires)
  finance: '<path d="M3.5 9.5 12 4.5l8.5 5"/><path d="M5.5 10v7.5M9.8 10v7.5M14.2 10v7.5M18.5 10v7.5"/><path d="M3.5 20h17"/>',
  health: '<path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"/><path d="M8 12.5h2.2l1.2-2.2 1.8 4 1.2-1.8H16"/>',
  government: '<path d="M3.5 20h17M5 20V8.5h14V20"/><path d="M8.5 20v-7.5M12 20v-7.5M15.5 20v-7.5"/><path d="M4 8.5 12 4l8 4.5"/>',
  tech: '<rect x="6.5" y="6.5" width="11" height="11" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9.5 3v3.5M14.5 3v3.5M9.5 17.5V21M14.5 17.5V21M3 9.5h3.5M3 14.5h3.5M17.5 9.5H21M17.5 14.5H21"/>',
  manufacturing: '<path d="M3.5 20.5V11l5 3.2V11l5 3.2V6.5h7v14z"/><path d="M15.5 10h3M15.5 13.5h3M7 17.5h2M11.5 17.5h2" opacity=".6"/>',
  energy: '<path d="M13.5 2.5 5.5 13.5h6l-1 8 8-11h-6z"/>',
  // Interface
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowUpRight: '<path d="M7 17 17 7M9 7h8v8"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.8 6.5 8.2 6.2 8.2-6.2"/>',
  phone: '<path d="M6.6 3.5h2.7l1.5 4.3-2 1.4a12 12 0 0 0 6 6l1.4-2 4.3 1.5v2.7A2.1 2.1 0 0 1 18.3 20 15.6 15.6 0 0 1 4 5.7a2.1 2.1 0 0 1 2.6-2.2z"/>',
  pin: '<path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.4"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>',
  quote: '<path d="M9.5 7C6.5 8 5 10.4 5 13.5V17h4.5v-4.5H7.2c.2-1.8 1.1-3 2.8-3.7zM18.5 7c-3 1-4.5 3.4-4.5 6.5V17h4.5v-4.5h-2.3c.2-1.8 1.1-3 2.8-3.7z"/>',
  book: '<path d="M4.5 5.5A2 2 0 0 1 6.5 3.5h13v14h-13a2 2 0 0 0-2 2z"/><path d="M4.5 19.5a2 2 0 0 0 2 2h13v-4"/>',
  people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19.5c.6-3.4 3-5.3 6-5.3s5.4 1.9 6 5.3"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14.2c2.3.2 3.7 1.7 4.1 4.3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
} as const;

export type IconName = keyof typeof ICONS;
