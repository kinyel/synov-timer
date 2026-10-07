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
  /** One small supporting fact. Neutral facts only; no invented numbers. */
  fact: string;
  badges: Badge[];
}

export const BADGE_LABEL: Record<Badge, string> = { ai: 'AI', data: 'Data', outcome: 'Outcome' };

export const JOURNEY: JourneyStep[] = [
  {
    name: 'Asked',
    caption: 'Otto · Virtual Agent',
    title: 'Someone asks for help in their own words.',
    body: 'An employee types “my VPN keeps dropping” into the portal, Teams or Slack. ServiceNow Otto (formerly Now Assist) works out what they need, answers from the knowledge base when it can, and opens the right request when it can’t.',
    how: 'ServiceNow Otto, Virtual Agent and AI Search, on ITSM',
    fact: 'Works in the portal, Teams, Slack, email and voice',
    badges: ['ai'],
  },
  {
    name: 'Routed',
    caption: 'AI agents · Assignment rules',
    title: 'It reaches the right team with the context attached.',
    body: 'AI agents and Predictive Intelligence set the category, the affected item and the assignment group. Assignment rules send it to the right team, and an Otto summary means nobody asks the employee to repeat themselves.',
    how: 'AI agents for ITSM, Predictive Intelligence, assignment rules',
    fact: 'Category, affected item and group set automatically',
    badges: ['ai'],
  },
  {
    name: 'Matched',
    caption: 'CMDB · Asset records',
    title: 'The CMDB already knows what is involved.',
    body: 'The request links to the employee’s laptop, its software licences and the business service it supports, because the <abbr title="Configuration Management Database">CMDB</abbr> holds those records and how they connect. Nobody has to go looking.',
    how: 'CMDB and the Common Service Data Model, with hardware and software asset records',
    fact: 'One record per device: the reconciliation engine blocks duplicates',
    badges: ['data'],
  },
  {
    name: 'Diagnosed',
    caption: 'Event Management · MCP',
    title: 'Most of the diagnosis is done before an engineer picks it up.',
    body: '<abbr title="IT Operations Management">ITOM</abbr> has already correlated the monitoring alerts behind the problem into one and mapped them to the affected service. Through <abbr title="Model Context Protocol">MCP</abbr>, AI agents can pull context from the other tools you run, within the permissions AI Control Tower enforces.',
    how: 'Event Management, Service Mapping, the MCP client and AI Control Tower',
    fact: 'Many alerts, correlated into one',
    badges: ['data', 'ai'],
  },
  {
    name: 'Resolved',
    caption: 'Knowledge · Reporting',
    title: 'Fixed, written up and ready for next time.',
    body: 'The engineer applies the fix. Otto drafts the resolution notes and a knowledge article, so the next person with the same problem can solve it themselves, and the service dashboards reflect it straight away.',
    how: 'ServiceNow Otto for ITSM, Knowledge Management, Platform Analytics',
    fact: 'Resolution notes and a knowledge article, drafted for review',
    badges: ['outcome'],
  },
];
