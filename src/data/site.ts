/**
 * Facts about Raleston used across the site: contact details, the founder,
 * and the navigation. Change them here and every page follows.
 */
export const SITE = {
  name: 'Raleston Consulting',
  url: 'https://ralestonconsulting.com',
  tagline: 'Architecting digital empires with ServiceNow',
  description:
    'Ottawa ServiceNow consultancy. Certified architects for ITSM, ITOM, ITAM, CMDB, SPM, integrations, App Engine and enterprise architecture.',
  email: 'info@ralestonconsulting.com',
  phone: '+1 (613) 981-1843',
  tel: '+16139811843',
  city: 'Ottawa',
  region: 'ON',
  regionName: 'Ontario',
  country: 'CA',
  countryName: 'Canada',
  founder: {
    name: 'Charles',
    role: 'Founder & Principal Architect',
    credential: 'Certified ServiceNow Technical Architect',
  },
  /** The client's own measured outcomes. The only numbers the site may claim. */
  stats: [
    { value: '40%', label: 'faster deployment' },
    { value: '60%', label: 'higher user adoption' },
  ],
} as const;

export interface NavLink {
  label: string;
  href: string;
  body?: string;
}
export interface NavGroup {
  id: string;
  label: string;
  eyebrow: string;
  columns: { title: string; links: NavLink[] }[];
}
