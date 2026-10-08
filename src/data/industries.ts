import type { IconName } from '../components/ui/icons';

/**
 * The six industries from Raleston's site, each with ServiceNow use cases
 * specific to the sector (content/RESEARCH.md, section 9). These describe what
 * the platform does in the sector and what Raleston can deliver; they are not
 * claims about past clients.
 */
export interface Industry {
  slug: string;
  name: string;
  icon: IconName;
  /** Six or seven words, for the home page. */
  line: string;
  summary: string;
  uses: { title: string; text: string }[];
}

export const INDUSTRIES: Industry[] = [
  {
    slug: 'financial-services',
    name: 'Financial Services',
    line: 'Audit-ready change and risk evidence',
    icon: 'finance',
    summary: 'Banks, insurers and credit unions, where every change needs a record and every outage reaches customers.',
    uses: [
      { title: 'Regulated change control', text: 'Every change risk-assessed, approved and recorded in one place, so audit evidence is ready when it is asked for.' },
      { title: 'Technology risk evidence', text: 'Incident, change and asset records that help answer OSFI Guideline B-13 questions on technology operations and resilience.' },
      { title: 'Licence and asset positions', text: 'An accurate hardware and software inventory for regulators and publisher audits.' },
      { title: 'Customer-facing outages', text: 'Service maps that show which banking service an alert affects, and a major incident process ready to run.' },
    ],
  },
  {
    slug: 'healthcare',
    name: 'Healthcare',
    line: 'Clinical devices tracked, support every shift',
    icon: 'health',
    summary: 'Hospitals and health organisations, where IT keeps clinicians working around the clock.',
    uses: [
      { title: 'Clinical device tracking', text: 'Medical devices onboarded, maintained and moved with Clinical Device Management, part of Healthcare and Life Sciences Service Management.' },
      { title: 'Support across every shift', text: 'Self-service and chat that work for staff at 3 a.m. as well as 3 p.m.' },
      { title: 'Mapped clinical systems', text: 'The servers and integrations behind clinical applications known before anything changes.' },
      { title: 'Shared workstations', text: 'Hardware asset management for the devices that move between wards and sites.' },
    ],
  },
  {
    slug: 'government',
    name: 'Government & Public Sector',
    line: 'Services that follow policy',
    icon: 'government',
    summary: 'National, regional and local government, where services follow policy and data stays where the law says it must.',
    uses: [
      { title: 'Data residency', text: 'Instance plans that keep data in the right country, on ServiceNow’s in-country hosting where it is offered.' },
      { title: 'Accessible services', text: 'Portals for staff and residents built to WCAG accessibility standards.' },
      { title: 'Traceable decisions', text: 'Approvals and records that show who decided what, and when.' },
      { title: 'Services for residents', text: 'Public Sector Digital Services for requests from the people you serve.' },
    ],
  },
  {
    slug: 'technology',
    name: 'Technology & Startups',
    line: 'Scale fast without rework',
    icon: 'tech',
    summary: 'Software and technology companies growing fast, where the platform has to scale without rework.',
    uses: [
      { title: 'A clean start', text: 'Out-of-the-box first, the Common Service Data Model from day one, and scoped apps for custom work.' },
      { title: 'SaaS spend under control', text: 'SaaS License Management that finds and reclaims unused seats.' },
      { title: 'Connected developer tools', text: 'Jira, GitHub and Slack connected through Integration Hub spokes or MCP.' },
      { title: 'Build where developers work', text: 'Build Agent and the ServiceNow SDK for teams that code in their own tools.' },
    ],
  },
  {
    slug: 'manufacturing',
    name: 'Manufacturing',
    line: 'Plant equipment and IT, as one',
    icon: 'manufacturing',
    summary: 'Manufacturers, where plant equipment and the IT that runs it have to work as one.',
    uses: [
      { title: 'Plant asset maintenance', text: 'Work orders and maintenance schedules for non-IT equipment with Enterprise Asset Management.' },
      { title: 'Operational technology visibility', text: 'OT assets discovered and mapped into the CMDB with Operational Technology Management.' },
      { title: 'One incident process', text: 'IT and OT incidents handled the same way when a production system fails.' },
      { title: 'Spares and stockrooms', text: 'Parts and stock tracked alongside the assets they keep running.' },
    ],
  },
  {
    slug: 'energy',
    name: 'Energy & Utilities',
    line: 'Infrastructure online, crews in place',
    icon: 'energy',
    summary: 'Utilities and energy providers, where infrastructure has to stay online and crews need to be in the right place.',
    uses: [
      { title: 'Field service and outages', text: 'Work orders linked to assets, crews scheduled and SLAs tracked with Field Service Management.' },
      { title: 'Plants and substations', text: 'Operational Technology Management for the systems behind generation and distribution.' },
      { title: 'Operations alerts', text: 'Event correlation and major incident handling for the IT that runs operations.' },
      { title: 'Assets in the field', text: 'Enterprise Asset Management for physical infrastructure.' },
    ],
  },
];
