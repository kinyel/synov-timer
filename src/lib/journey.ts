/**
 * The hero journey: one employee request, followed through a ServiceNow
 * platform Raleston designs. Each step says what happens and which ServiceNow
 * capability does it (names checked in content/RESEARCH.md, section 8).
 * `body` may contain <abbr> markup.
 */
export type Badge = 'ai' | 'data' | 'outcome';

export interface JourneyStep {
  /** One word, shown on the route and in the counter row. */
  name: string;
  /** The capability caption next to the node on the route. */
  caption: string;
  title: string;
  body: string;
  /** Which ServiceNow capabilities make it happen. */
  how: string;
  badges: Badge[];
}

export const BADGE_LABEL: Record<Badge, string> = { ai: 'AI', data: 'Data', outcome: 'Outcome' };

export const JOURNEY: JourneyStep[] = [
  {
    name: 'Asked',
    caption: 'Otto · Virtual Agent',
    title: 'Someone asks for help.',
    body: 'In the portal, Teams or Slack. ServiceNow Otto (formerly Now Assist) answers, or opens the right request.',
    how: 'ServiceNow Otto, Virtual Agent',
    badges: ['ai'],
  },
  {
    name: 'Routed',
    caption: 'AI agents · Assignment rules',
    title: 'It reaches the right team.',
    body: 'AI agents set the category and the group. Nobody asks the employee to repeat themselves.',
    how: 'AI agents, Predictive Intelligence, assignment rules',
    badges: ['ai'],
  },
  {
    name: 'Matched',
    caption: 'CMDB · Asset records',
    title: 'The CMDB knows what is involved.',
    body: 'The laptop, its licences and the service it supports are already linked.',
    how: 'CMDB and asset records',
    badges: ['data'],
  },
  {
    name: 'Diagnosed',
    caption: 'Event Management · MCP',
    title: 'Diagnosed before an engineer looks.',
    body: 'Alerts are correlated into one, and AI agents pull context from your other tools through <abbr title="Model Context Protocol">MCP</abbr>.',
    how: 'Event Management, Service Mapping, MCP',
    badges: ['data', 'ai'],
  },
  {
    name: 'Resolved',
    caption: 'Knowledge · Reporting',
    title: 'Fixed, and written up for next time.',
    body: 'Otto drafts the notes and a knowledge article, so the next person can help themselves.',
    how: 'ServiceNow Otto, Knowledge, Platform Analytics',
    badges: ['outcome'],
  },
];
