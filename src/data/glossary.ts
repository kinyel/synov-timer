/**
 * The terms used across the site, defined in plain language (from
 * content/RESEARCH.md). Shown on /glossary/ and used for <abbr> titles.
 */
export interface Term {
  term: string;
  /** Expansion for acronyms. */
  full?: string;
  definition: string;
  /** A service page that covers it. */
  link?: string;
}

export const GLOSSARY: Term[] = [
  { term: 'A2A', full: 'Agent2Agent', definition: 'An open protocol that lets AI agents from different systems work together on a task as peers. ServiceNow supports it as part of Action Fabric.' },
  { term: 'Action Fabric', definition: 'ServiceNow’s framework for connecting AI agents across your systems. It has three parts: the MCP Server Console, the MCP Client and A2A.', link: '/services/integrations/' },
  { term: 'Advanced Work Assignment', definition: 'ServiceNow’s way of offering work to agents based on their group, availability, capacity and skills.', link: '/services/itsm/' },
  { term: 'AI agents', definition: 'Software that can plan and carry out multi-step tasks, such as triaging an incident, within limits you set. Built and managed in AI Agent Studio, coordinated by the AI Agent Orchestrator.' },
  { term: 'AI Control Tower', definition: 'ServiceNow’s governance console for AI. It discovers, approves, monitors and audits AI agents and their connections, including MCP traffic.' },
  { term: 'AI Skill Kit', definition: 'The tool for building custom generative AI skills in ServiceNow, with your own prompts and an approved model. Formerly the Now Assist Skill Kit.' },
  { term: 'AIOps', full: 'AI for IT operations', definition: 'Machine learning applied to monitoring data to spot anomalies and correlate alerts. In ServiceNow ITOM it includes Health Log Analytics and Metric Intelligence.', link: '/services/itom/' },
  { term: 'App Engine', definition: 'ServiceNow’s tools for building your own applications on the platform, from low-code in App Engine Studio to pro-code in ServiceNow Studio.', link: '/services/app-engine/' },
  { term: 'CAB', full: 'Change Advisory Board', definition: 'The group that reviews higher-risk changes before they go ahead. ServiceNow supports it with change approval policies and CAB Workbench.', link: '/services/itsm/' },
  { term: 'CI', full: 'Configuration item', definition: 'Anything recorded in the CMDB: a server, an application, a laptop, a business service.', link: '/services/cmdb/' },
  { term: 'CMDB', full: 'Configuration Management Database', definition: 'ServiceNow’s map of your technology and how each part depends on the others. ITSM, ITOM and ITAM all rely on it.', link: '/services/cmdb/' },
  { term: 'CSDM', full: 'Common Service Data Model', definition: 'ServiceNow’s standard model for describing services, applications and infrastructure in the CMDB. Version 5 has seven domains.', link: '/services/cmdb/' },
  { term: 'DDI', full: 'DNS, DHCP and IP address management', definition: 'The network services that give devices addresses and names. TCPWave is a DDI vendor with a ServiceNow integration.', link: '/solutions/tcpwave/' },
  { term: 'Discovery', definition: 'The ITOM capability that finds servers, devices and cloud resources on your network and records them in the CMDB.', link: '/services/itom/' },
  { term: 'EAM', full: 'Enterprise Asset Management', definition: 'Lifecycle management for physical assets that are not IT, such as plant equipment and vehicles.', link: '/services/itam/' },
  { term: 'EmployeeWorks', definition: 'ServiceNow’s AI front door for employees, combining ServiceNow Otto with the employee portal. Generally available since February 2026.' },
  { term: 'Enterprise Architecture', definition: 'ServiceNow’s product for mapping applications, data and processes to business capabilities. Formerly Application Portfolio Management.', link: '/services/enterprise-architecture/' },
  { term: 'Event Management', definition: 'The ITOM capability that collects alerts from monitoring tools, removes duplicates, correlates them and opens incidents.', link: '/services/itom/' },
  { term: 'Family release', definition: 'ServiceNow’s twice-yearly platform release, named alphabetically. Zurich and Australia are recent ones.', link: '/services/support-and-optimization/' },
  { term: 'HAM', full: 'Hardware Asset Management', definition: 'Tracking hardware from purchase to disposal, with the CMDB as the source of truth.', link: '/services/itam/' },
  { term: 'Integration Hub', definition: 'ServiceNow’s integration tools: prebuilt spokes, custom spokes and API triggers. Now part of Workflow Data Fabric.', link: '/services/integrations/' },
  { term: 'IRE', full: 'Identification and Reconciliation Engine', definition: 'The CMDB rules that recognise existing records, so the same server is not created twice, and decide which source wins for each field.', link: '/services/cmdb/' },
  { term: 'ITAM', full: 'IT Asset Management', definition: 'Managing what you own and pay for: hardware, software and other assets, through their whole lifecycle.', link: '/services/itam/' },
  { term: 'ITIL 4', definition: 'A widely used framework of IT service management practices. We use it as a shared vocabulary, not a rulebook.' },
  { term: 'ITOM', full: 'IT Operations Management', definition: 'Visibility and control of infrastructure and cloud: Discovery, Service Mapping, Event Management and AIOps.', link: '/services/itom/' },
  { term: 'ITSM', full: 'IT Service Management', definition: 'How IT takes requests, fixes problems and changes things safely: incidents, problems, changes, requests, knowledge and SLAs.', link: '/services/itsm/' },
  { term: 'MCP', full: 'Model Context Protocol', definition: 'An open standard that lets AI agents discover and use tools in other systems. ServiceNow supports it both ways: as an MCP server and as an MCP client.', link: '/services/integrations/' },
  { term: 'MID Server', full: 'Management, Instrumentation and Discovery Server', definition: 'A small application inside your network that lets ServiceNow reach systems behind your firewall for Discovery and integrations.', link: '/services/itom/' },
  { term: 'Predictive Intelligence', definition: 'ServiceNow’s classic machine learning, which predicts values such as category and assignment group from past records.', link: '/services/itsm/' },
  { term: 'SAM', full: 'Software Asset Management', definition: 'Comparing the software licences you own with what is installed and used, to reclaim waste and prepare for audits.', link: '/services/itam/' },
  { term: 'Scoped application', definition: 'A ServiceNow app with its own namespace, tables and permissions, kept separate from the core platform so it stays upgrade-safe.', link: '/services/app-engine/' },
  { term: 'Service Catalog', definition: 'The list of things employees can request, each with its own form, approvals and fulfilment steps.', link: '/services/itsm/' },
  { term: 'Service Graph Connector', definition: 'A certified import that brings third-party data into the CMDB through the reconciliation engine, without duplicates.', link: '/services/cmdb/' },
  { term: 'Service Mapping', definition: 'The ITOM capability that shows which infrastructure supports each business service.', link: '/services/itom/' },
  { term: 'ServiceNow Otto', definition: 'ServiceNow’s unified AI experience, combining Now Assist, Moveworks and AI Experience. It is replacing the Now Assist name.' },
  { term: 'SLA', full: 'Service level agreement', definition: 'A commitment, such as a response or resolution time, that ServiceNow measures on each record.', link: '/services/itsm/' },
  { term: 'SPM', full: 'Strategic Portfolio Management', definition: 'Demand, portfolios, projects, agile work and resources in one place, so spend follows strategy. Formerly IT Business Management (ITBM).', link: '/services/spm/' },
  { term: 'Spoke', definition: 'A packaged Integration Hub integration with a specific system, containing ready-made actions and flows.', link: '/services/integrations/' },
  { term: 'Virtual Agent', definition: 'ServiceNow’s conversational interface, used in the portal, Teams and Slack, now powered by ServiceNow Otto.' },
  { term: 'Workflow Studio', definition: 'The ServiceNow builder for flows, subflows, actions, decision tables and playbooks. Flow Designer opens inside it.', link: '/services/app-engine/' },
];

/** Expansion text for an acronym, for <abbr title>. */
export const expand = (term: string) => GLOSSARY.find((t) => t.term === term)?.full;
