/**
 * Site copy shared by the sections and the navigation, so a name changed
 * here changes everywhere. Industries live in src/webgl/scenes/city/districts.ts
 * (they are tied to the 3D districts) and are re-exported below.
 */
export { DISTRICTS as INDUSTRIES } from '../webgl/scenes/city/districts';

export const EXPERTISE = [
  { name: 'App Engine', short: 'App Engine', body: 'Custom applications built on the platform, from low-code to pro-code.' },
  { name: 'ITSM', short: 'ITSM', body: 'Service desk, incident, problem and change, designed to scale.' },
  { name: 'ITAM', short: 'ITAM', body: 'Hardware and software assets tracked across their whole lifecycle.' },
  { name: 'ITOM', short: 'ITOM', body: 'Discovery, service mapping and event management, end to end.' },
  { name: 'Integration', short: 'Integration', body: 'HR, Finance, ITSM and custom apps connected to eliminate silos.' },
  { name: 'Enterprise Architecture', short: 'Ent. Arch.', body: 'Roadmaps and structure that keep the platform clean as it grows.' },
] as const;

export const SERVICES = [
  { key: 'advisory', title: 'Advisory & Strategy', body: 'Roadmaps and alignment that reduce complexity and maximize ROI.' },
  { key: 'implementation', title: 'Implementation', body: 'Architecture, configuration, testing, deployment.' },
  { key: 'integration', title: 'Integration', body: 'HR, Finance, ITSM and custom apps connected to eliminate silos.' },
  { key: 'support', title: 'Support & Optimization', body: 'Monitoring, upgrades, performance tuning.' },
] as const;

export const CONTACT = {
  email: 'info@ralestonconsulting.com',
  phone: '+1 (613) 981-1843',
  tel: '+16139811843',
  city: 'Ottawa, Canada',
} as const;

/**
 * Where each item sits inside its pinned section, as scroll progress 0..1,
 * so nav links can land exactly on that card. Mirrors the choreography in
 * src/scripts/scroll.ts.
 */
export const progressFor = {
  expertise: (i: number) => ((i + 0.35) / 6) * 0.72,
  services: (i: number) => 0.06 + (i / 3) * 0.88,
  industries: (i: number) => 0.1 + ((i + 0.55) / 6) * 0.76,
};
