/**
 * Site copy shared by the sections and the navigation, so a name changed
 * here changes everywhere. Industries live in src/webgl/scenes/city/districts.ts
 * (they are tied to the 3D districts) and are re-exported below.
 */
export { DISTRICTS as INDUSTRIES } from '../webgl/scenes/city/districts';

/**
 * Each practice area is one building on the campus model.
 * `place` names the building the visitor is looking at, `tag` is the short
 * caption on its 3D label, `body` says what the practice does.
 */
export const EXPERTISE = [
  {
    name: 'App Engine',
    short: 'App Engine',
    place: 'The workshop',
    tag: 'Custom apps, built to order',
    body: 'Custom applications on the platform, from quick low-code tools to full pro-code builds.',
  },
  {
    name: 'ITSM',
    short: 'ITSM',
    place: 'The service centre',
    tag: 'Service desk and change',
    body: 'Service desk, incident, problem and change, designed around how your support teams work.',
  },
  {
    name: 'ITAM',
    short: 'ITAM',
    place: 'The asset warehouse',
    tag: 'Every asset accounted for',
    body: 'Hardware and software tracked from purchase to retirement, so licences and spend stay under control.',
  },
  {
    name: 'ITOM',
    short: 'ITOM',
    place: 'The operations centre',
    tag: 'Problems caught early',
    body: 'Discovery, service mapping and event management, so issues surface before your users notice them.',
  },
  {
    name: 'Integration',
    short: 'Integration',
    place: 'The bridges',
    tag: 'Systems that share data',
    body: 'HR, Finance, ITSM and custom apps connected, so data is entered once and stays consistent.',
  },
  {
    name: 'Enterprise Architecture',
    short: 'Ent. Arch.',
    place: 'The studio',
    tag: 'Structure that scales',
    body: 'Roadmaps, standards and data models that keep the platform clean as it grows.',
  },
] as const;

export const SERVICES = [
  { key: 'advisory', title: 'Advisory & Strategy', body: 'A roadmap and priorities that reduce complexity and maximize ROI.' },
  { key: 'implementation', title: 'Implementation', body: 'Architecture, configuration, testing and deployment, delivered in usable stages.' },
  { key: 'integration', title: 'Integration', body: 'HR, Finance, ITSM and custom apps connected to eliminate silos.' },
  { key: 'support', title: 'Support & Optimization', body: 'Monitoring, upgrades and performance tuning as the platform grows.' },
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
