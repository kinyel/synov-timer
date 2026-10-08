/**
 * Every Raleston service, written in the same structure (brief section 6A):
 * in plain English, why it matters, what Raleston delivers, how AI helps, what
 * you get, the technical detail, a diagram, FAQs and related services.
 *
 * Facts come from content/RESEARCH.md. Anything Raleston's own site does not
 * state is marked there as "proposed: confirm with client". The only numbers
 * claimed are the client's own: up to 40% faster deployment and up to 60%
 * higher user adoption. Durations are labelled "typical".
 */
import type { IconName } from '../components/ui/icons';

export type Accent = 'core' | 'ai' | 'data';

export type Diagram =
  | { kind: 'flow'; steps: string[]; caption: string }
  | { kind: 'hub'; center: string; left: string[]; right: string[]; caption: string }
  | { kind: 'layers'; layers: { label: string; sub: string }[]; caption: string }
  | { kind: 'cycle'; stages: string[]; caption: string }
  | { kind: 'map'; service: string; apps: string[]; infra: string[]; caption: string };

export interface Faq {
  q: string;
  /** May contain <abbr> and <a> markup. */
  a: string;
}

export interface Service {
  slug: string;
  kind: 'platform' | 'delivery';
  /** Full name, and the short form used in lists and the navigation. */
  name: string;
  short: string;
  /** One line for menus and cards. */
  blurb: string;
  /** The building on the home page, where there is one. */
  place?: string;
  icon: IconName;
  accent: Accent;
  seo: { title: string; description: string };
  headline: string;
  lead: string;
  plain: string;
  why: string[];
  delivers: string[];
  ai: { text: string; points: string[] };
  outcomes: string[];
  technical: string[];
  diagram: Diagram;
  faqs: Faq[];
  related: string[];
  /** Delivery services only. */
  steps?: { name: string; text: string }[];
  duration?: string;
  who?: { raleston: string; you: string };
}

export const SERVICES: Service[] = [
  {
    slug: 'itsm',
    blurb: 'Requests, incidents, changes and knowledge',
    kind: 'platform',
    name: 'IT Service Management',
    short: 'ITSM',
    place: 'The Service Centre',
    icon: 'itsm',
    accent: 'core',
    seo: {
      title: 'ServiceNow ITSM implementation and redesign | Raleston Consulting',
      description:
        'ServiceNow ITSM done properly: incident, problem, change and request management, a catalog people use, and ServiceNow Otto built in.',
    },
    headline: 'IT Service Management on ServiceNow',
    lead: 'How IT takes requests and fixes problems for everyone else. We design it around the way your teams actually work, then build it so it stays easy to upgrade.',
    plain:
      'IT Service Management (ITSM) is the system your IT team uses to take requests, fix what breaks and change things safely. On ServiceNow that means one place for incidents, requests, problems, changes and knowledge, with a portal and chat so employees can help themselves. Done well, people stop emailing IT and start getting answers.',
    why: [
      'Requests arrive by email and nobody can see where they are.',
      'Tickets bounce between teams before anyone owns them.',
      'The same incidents come back because nobody fixes the cause.',
      'Changes go in without anyone knowing what they will affect.',
      'An old, heavily customised instance makes every upgrade painful.',
    ],
    delivers: [
      'Process design for incident, problem, change and request, aligned to ITIL 4 and to your teams',
      'A service catalog and employee portal that people use instead of email',
      'Assignment, approval and escalation rules that route work to the right team',
      'SLA design, so commitments are measured the same way everywhere',
      'A major incident process, with roles and communications agreed in advance',
      'Change risk and CAB approvals that scale with the risk, not the paperwork',
      'Migration from legacy tools, or re-implementation back toward out-of-the-box',
    ],
    ai: {
      text: 'ServiceNow Otto (formerly Now Assist) and AI agents take routine work off your agents’ plates.',
      points: [
        'Summaries of incidents, chats and changes, so nobody reads a whole thread',
        'Resolution notes and knowledge articles drafted from the fix',
        'AI agents that set the category, the affected item and the assignment group',
        'Answers in the portal, Teams or Slack before a ticket is needed',
      ],
    },
    outcomes: [
      'Requests you can track from start to finish',
      'Fewer repeat incidents, because problems get a real owner',
      'Safer changes, with impact visible before approval',
      'A platform you can upgrade twice a year without fear',
    ],
    technical: [
      'Incident, Problem, Change and Request Management, Service Catalog, Knowledge Management and SLAs, configured close to out-of-the-box',
      'Service Operations Workspace for agents; Employee Center or EmployeeWorks for employees',
      'Change approval policies and CAB Workbench, with risk informed by CMDB relationships',
      'Assignment rules, Predictive Intelligence and Advanced Work Assignment for routing',
      'ServiceNow Otto for ITSM and AI agents, set up with guardrails and measured adoption',
      'Integrations with identity, monitoring and chat tools through Integration Hub',
    ],
    diagram: {
      kind: 'flow',
      steps: ['Asked in the portal, Teams or Slack', 'Triaged by AI agents', 'Routed to the right team', 'Fixed, with change control if needed', 'Written up as knowledge'],
      caption: 'One request, end to end, on a well-designed ITSM process.',
    },
    faqs: [
      {
        q: 'Can you fix an ITSM implementation that already exists?',
        a: 'Yes. We start by reviewing the instance: customisations, data quality and how work really flows. Then we agree what to keep, what to return to out-of-the-box and what to redesign, and we change it in stages so your service desk never stops.',
      },
      {
        q: 'Do you follow ITIL?',
        a: 'We use ITIL 4 as a shared vocabulary, not a rulebook. Processes are designed around your teams, and named the way ServiceNow expects, so upgrades stay simple.',
      },
      {
        q: 'How long does an ITSM implementation take?',
        a: 'It depends on scope. A first release of core ITSM (incident, request, catalog and knowledge) typically takes 8 to 16 weeks. We confirm a plan after a short discovery.',
      },
      {
        q: 'Will ServiceNow Otto work with our existing ITSM?',
        a: 'Usually, as long as your instance is on a supported release and your knowledge base is in reasonable shape. We check both first, because AI answers are only as good as the articles behind them.',
      },
    ],
    related: ['cmdb', 'itom', 'implementation'],
  },
  {
    slug: 'itom',
    blurb: 'Discovery, service maps and alerts that matter',
    kind: 'platform',
    name: 'IT Operations Management',
    short: 'ITOM',
    place: 'The Operations Centre',
    icon: 'itom',
    accent: 'data',
    seo: {
      title: 'ServiceNow ITOM: Discovery, Service Mapping and AIOps | Raleston',
      description:
        'Know what you run and catch problems before users do: ServiceNow Discovery, Service Mapping, Event Management and AIOps, from certified architects.',
    },
    headline: 'IT Operations Management on ServiceNow',
    lead: 'Know exactly what is running, what depends on what, and which alert matters, before your users notice anything.',
    plain:
      'IT Operations Management (ITOM) gives you visibility and control of your infrastructure and cloud. Discovery finds your servers, devices and cloud resources and records them in the CMDB. Service Mapping shows which of them support each business service. Event Management turns a flood of monitoring alerts into the few that matter, and opens incidents automatically.',
    why: [
      'Nobody can say for certain what is running, or where.',
      'Monitoring tools send thousands of alerts, and the important one gets lost.',
      'Users report outages before IT knows about them.',
      'Changes break dependencies that nobody had mapped.',
      'MID Servers and credentials were set up ad hoc, and nobody owns them.',
    ],
    delivers: [
      'Discovery rollout, including MID Server architecture and credential design',
      'Service Mapping for the business services that matter most',
      'Integrations with your monitoring tools, so alerts arrive in one place',
      'Event correlation and alert rules that cut noise without hiding problems',
      'Cloud discovery across your providers',
      'Runbooks and training for the team that will own it',
    ],
    ai: {
      text: 'AI helps operations teams act on signals faster, with the context already gathered.',
      points: [
        'Alert and incident summaries for whoever picks the problem up',
        'AIOps anomaly detection with Health Log Analytics and Metric Intelligence',
        'Through MCP, AI agents can pull context from the other tools you run, under AI Control Tower governance',
      ],
    },
    outcomes: [
      'An accurate, automatically updated picture of your estate',
      'Fewer, clearer alerts, each tied to a business service',
      'Faster diagnosis, because impact is known up front',
      'A CMDB that stays current without manual updates',
    ],
    technical: [
      'Discovery (agentless, through MID Servers on your network), with credential and schedule design',
      'Service Mapping: top-down, tag-based or traffic-based, depending on the service',
      'Event Management connectors, alert rules, correlation and suppression',
      'ITOM AIOps: Health Log Analytics and Metric Intelligence',
      'Service Graph Connectors for cloud, endpoint and security sources',
      'CSDM-aligned service and application models, so maps feed ITSM impact analysis',
    ],
    diagram: {
      kind: 'map',
      service: 'Remote access',
      apps: ['VPN gateway', 'Identity service'],
      infra: ['Firewall cluster', 'Linux servers', 'Cloud load balancer'],
      caption: 'Service Mapping ties infrastructure to the business service it supports, so an alert shows its impact straight away.',
    },
    faqs: [
      {
        q: 'Do we need ITOM if we already have monitoring tools?',
        a: 'Usually yes, and they work together. Your monitoring tools keep watching; ITOM collects their alerts, removes duplicates, links each alert to the service it affects and opens an incident when it should. It also keeps the CMDB current through Discovery.',
      },
      {
        q: 'What is a MID Server?',
        a: 'A small application installed inside your network. It lets ServiceNow, which runs in the cloud, reach systems behind your firewall safely, for Discovery, Service Mapping and integrations. We design how many you need, where they sit and how their credentials are managed.',
      },
      {
        q: 'Where should we start with ITOM?',
        a: 'With Discovery for the infrastructure behind one or two important services, then Service Mapping for those services. Value shows early, and the CMDB improves as you go.',
      },
    ],
    related: ['cmdb', 'itsm', 'integrations'],
  },
  {
    slug: 'itam',
    blurb: 'Hardware, software and licences, end to end',
    kind: 'platform',
    name: 'IT Asset Management',
    short: 'ITAM',
    place: 'The Asset Warehouse',
    icon: 'itam',
    accent: 'data',
    seo: {
      title: 'ServiceNow ITAM: hardware and software assets | Raleston',
      description:
        'Know what you own, what it costs and whether it is used. ServiceNow Hardware, Software and Enterprise Asset Management, designed by certified architects.',
    },
    headline: 'IT Asset Management on ServiceNow',
    lead: 'Know what you own, what it costs and whether anyone uses it, from the day you buy it to the day it leaves.',
    plain:
      'IT Asset Management (ITAM) tracks the things your organisation pays for. Hardware Asset Management (HAM) follows laptops, servers and devices from purchase to disposal. Software Asset Management (SAM) compares the licences you own with what is installed and used, so you can reclaim waste and face vendor audits calmly. Enterprise Asset Management (EAM) does the same for physical assets that are not IT.',
    why: [
      'Paying for licences nobody uses.',
      'Audit letters from software publishers, and no clear answer.',
      'Devices nobody can account for, which are also security blind spots.',
      'Spreadsheets that are out of date the day they are saved.',
      'Refresh cycles missed because nobody knows what is due.',
    ],
    delivers: [
      'HAM and SAM implementation, connected to the CMDB, procurement and the service catalog',
      'Import and reconciliation of your software entitlements',
      'Publisher pack set-up for the vendors you spend most with',
      'Reclamation workflows that recover unused licences automatically',
      'Audit readiness: licence positions you can defend',
      'Lifecycle automation for requests, refreshes, stockrooms and disposal',
      'SaaS licence management for subscriptions outside your data centre',
    ],
    ai: {
      text: 'AI does the tedious matching work and keeps asset data clean.',
      points: [
        'AI agents that help process asset requests and normalise hardware records',
        'Otto summaries of asset and licence records for faster decisions',
        'Usage-based reclamation that suggests what to recover',
      ],
    },
    outcomes: [
      'One accurate record of what you own and where it is',
      'Licence spend that follows real usage',
      'Prepared, calm answers when an auditor asks',
      'Assets retired securely and on time',
    ],
    technical: [
      'Hardware Asset Management with the CMDB as the source of truth for hardware, and the Hardware Asset Workspace',
      'Software Asset Management: normalisation against ServiceNow’s software content library, reconciliation into licence positions, reclamation rules',
      'Publisher packs (for example Microsoft, Oracle, IBM, Adobe, SAP, VMware and Citrix) where licensed',
      'SaaS License Management with direct integrations, and Cloud Cost Management',
      'Enterprise Asset Management for non-IT physical assets',
      'Procurement, catalog and Discovery integration, so records stay current',
    ],
    diagram: {
      kind: 'cycle',
      stages: ['Plan', 'Buy', 'Deploy', 'Track', 'Reclaim', 'Retire'],
      caption: 'Every asset follows one lifecycle, with the CMDB keeping its record current at each step.',
    },
    faqs: [
      {
        q: 'What is the difference between HAM and SAM?',
        a: 'HAM looks after physical things: laptops, servers, phones and network gear. SAM looks after software rights: what you are entitled to, what is installed and what is actually used. Most organisations need both, and both depend on a clean CMDB.',
      },
      {
        q: 'Can SAM help with a vendor audit?',
        a: 'Yes. With entitlements imported and reconciled against discovered installs, SAM shows your licence position per product. We help set that up before an audit, so you are not building it under pressure.',
      },
      {
        q: 'Do we need Discovery for ITAM?',
        a: 'For hardware and software you want tracked automatically, yes, or another trusted source brought in through a Service Graph Connector. Manual records go stale quickly.',
      },
    ],
    related: ['cmdb', 'itom', 'itsm'],
  },
  {
    slug: 'cmdb',
    blurb: 'The data every other practice relies on',
    kind: 'platform',
    name: 'Configuration Management Database',
    short: 'CMDB',
    place: 'The foundation',
    icon: 'cmdb',
    accent: 'data',
    seo: {
      title: 'ServiceNow CMDB health checks and CSDM alignment | Raleston',
      description:
        'Fix a CMDB nobody trusts: health assessments, CSDM alignment, de-duplication, data ownership and Discovery-led population, by certified ServiceNow architects.',
    },
    headline: 'A CMDB your teams can trust',
    lead: 'The CMDB is the foundation every other part of ServiceNow stands on. Fixing broken ones is what our founder is known for.',
    plain:
      'The Configuration Management Database (CMDB) is ServiceNow’s map of your technology: every server, application, device and business service, and how they depend on each other. ITSM uses it to know what a change will affect. ITOM fills it and ties alerts to services. ITAM links what you own to what is running. When the CMDB is wrong, all of them give wrong answers.',
    why: [
      'Duplicate records, so nobody knows which one is real.',
      'Stale data that was never retired.',
      'No owner for each type of record.',
      'Custom tables that ignore the standard model and slow down upgrades.',
      'A CMDB nobody trusts, so teams keep their own spreadsheets.',
    ],
    delivers: [
      'A CMDB health assessment with a scored baseline',
      'A plan to align with the Common Service Data Model (CSDM)',
      'Data governance: owners, certification and retirement policies',
      'De-duplication and clean-up with identification and reconciliation rules',
      'Discovery-led population, so records update themselves',
      'Health dashboards your team can keep watching',
    ],
    ai: {
      text: 'Clean configuration data is what makes AI useful.',
      points: [
        'AI agents read the CMDB to set the affected item on incidents',
        'Otto explains impact using service relationships',
        'Bad data makes AI confidently wrong, so a healthy CMDB comes first',
      ],
    },
    outcomes: [
      'One record for each real thing',
      'Impact analysis you can rely on before a change',
      'Faster routing, because the affected service is known',
      'Simpler upgrades, because the model follows the standard',
    ],
    technical: [
      'Identification and Reconciliation Engine (IRE) rules per class, and source precedence',
      'CMDB Health dashboard: completeness, correctness (duplicate, orphan and stale records) and compliance',
      'CSDM 5 alignment across Foundation, Design & Planning, Build & Integration, Service Delivery and Service Consumption',
      'CMDB Data Manager policies to retire, archive or delete stale records',
      'Service Graph Connectors in place of custom import sets',
      'CMDB Workspace and data certification for class owners',
    ],
    diagram: {
      kind: 'hub',
      center: 'CMDB',
      left: ['Discovery', 'Service Graph Connectors', 'Trusted imports'],
      right: ['ITSM', 'ITOM', 'ITAM', 'SPM'],
      caption: 'Data comes in through the reconciliation engine on the left; every practice on the right relies on it.',
    },
    faqs: [
      {
        q: 'Can you fix an existing CMDB?',
        a: 'Yes, it is what we are known for. We measure its health first, then fix the causes (identification rules, import sources and ownership) before cleaning the data, so the problems do not come back.',
      },
      {
        q: 'What is CSDM, and do we need it?',
        a: 'The Common Service Data Model is ServiceNow’s standard way to describe services, applications and infrastructure in the CMDB. Following it makes ServiceNow features work as designed and keeps upgrades simple. You do not have to adopt every part at once; we plan it in stages.',
      },
      {
        q: 'How do you keep the CMDB clean after the project?',
        a: 'With automation and ownership. Discovery and certified connectors keep data current, reconciliation rules stop duplicates, each class has an owner, and health dashboards show drift early.',
      },
    ],
    related: ['itom', 'itam', 'itsm'],
  },
  {
    slug: 'spm',
    blurb: 'Demand, portfolios, projects and resources',
    kind: 'platform',
    name: 'Strategic Portfolio Management',
    short: 'SPM',
    icon: 'spm',
    accent: 'core',
    seo: {
      title: 'ServiceNow SPM (formerly ITBM) implementation | Raleston Consulting',
      description:
        'Connect strategy to delivery with ServiceNow Strategic Portfolio Management: demand, portfolios, projects, agile work and resources, by certified architects.',
    },
    headline: 'Strategic Portfolio Management on ServiceNow',
    lead: 'Decide which work gets money and people, and see whether it delivers the strategy.',
    plain:
      'Strategic Portfolio Management (SPM, formerly IT Business Management) brings ideas, demand, projects, agile work and resources into one place. Leaders see what is being worked on and why. Teams see how their work connects to goals. Funding follows priorities instead of whoever asks loudest.',
    why: [
      'Projects approved with no clear link to strategy.',
      'People booked on three things at once.',
      'Status reported in slide decks that are already out of date.',
      'No single view of what the business is asking for.',
    ],
    delivers: [
      'An SPM rollout matched to how you plan and fund work',
      'Demand-to-delivery process design, from idea to outcome',
      'Portfolio and roadmap set-up for leaders',
      'Resource management that shows real capacity',
      'Agile and project delivery in the same model',
      'Reporting that shows progress against goals',
    ],
    ai: {
      text: 'AI helps planners see risk early and spend less time compiling status.',
      points: ['AI agents that surface risks and suggest reprioritisation', 'Otto summaries of demands and project status', 'Plain-language questions over portfolio data'],
    },
    outcomes: ['Investment that follows strategy', 'Realistic plans, based on actual capacity', 'Status that is current without chasing people'],
    technical: [
      'Strategic Planning, Demand Management and Project Portfolio Management',
      'Resource Management and Scenario Planning',
      'Agile development, with SAFe support where you use it',
      'Integration with Jira or Azure DevOps when teams plan elsewhere',
      'Alignment to business capabilities and applications through Enterprise Architecture',
    ],
    diagram: {
      kind: 'flow',
      steps: ['Idea', 'Demand', 'Portfolio decision', 'Project or agile work', 'Outcome tracked'],
      caption: 'One front door for new work, one place to decide, one view of progress.',
    },
    faqs: [
      { q: 'Is SPM the same as ITBM?', a: 'Yes. ServiceNow renamed IT Business Management to Strategic Portfolio Management in 2022 and broadened it beyond IT.' },
      {
        q: 'Our teams use Jira. Can SPM still work?',
        a: 'Yes. Teams can keep planning in Jira while demand, portfolio and funding decisions live in SPM, with an integration keeping the two in step.',
      },
      { q: 'Where should SPM start?', a: 'Usually with demand management: one front door for new work and a clear way to decide. Portfolios, resources and roadmaps follow.' },
    ],
    related: ['enterprise-architecture', 'advisory-and-strategy', 'integrations'],
  },
  {
    slug: 'integrations',
    blurb: 'Systems that share data, reliably',
    kind: 'platform',
    name: 'Integrations',
    short: 'Integrations',
    icon: 'integrations',
    accent: 'data',
    seo: {
      title: 'ServiceNow integrations: Integration Hub and REST APIs | Raleston',
      description:
        'Connect ServiceNow to HR, finance, identity, monitoring and network tools so data is entered once. Secure, monitored and documented integrations.',
    },
    headline: 'ServiceNow integrations that stay reliable',
    lead: 'Connect ServiceNow to the rest of your systems, so data is entered once and stays the same everywhere.',
    plain:
      'Integrations connect ServiceNow to the other systems you run: HR, finance, identity, monitoring, network and developer tools. Instead of people retyping data, systems exchange it securely and on schedule. Done well, integrations are monitored and documented, so they never fail silently.',
    why: [
      'Brittle custom scripts that break on upgrade.',
      'Credentials hard-coded and shared by email.',
      'Integrations that fail silently until someone complains.',
      'The same data typed into three systems, three different ways.',
    ],
    delivers: [
      'Integration architecture: the right pattern for each system',
      'Integration Hub spokes, REST APIs and Service Graph Connectors, chosen case by case',
      'MID Server design for systems behind your firewall',
      'Error handling, retries and alerts, so failures are visible',
      'Credential management through connections and aliases',
      'Documentation and runbooks for the team that owns them',
    ],
    ai: {
      text: 'AI agents use integrations too, which is why governance matters.',
      points: [
        'MCP Client: ServiceNow AI agents call tools in your other systems',
        'MCP Server: outside agents, such as Claude or Copilot, run governed ServiceNow actions',
        'AI Control Tower keeps every connection identity-verified and auditable',
      ],
    },
    outcomes: ['Data entered once', 'Integrations you can see, monitor and fix', 'Upgrades that do not break connections'],
    technical: [
      'Integration Hub (part of Workflow Data Fabric): spokes, the Spoke Generator for OpenAPI specs, custom spokes and REST API Trigger',
      'Scripted REST APIs and the Table API, secured with OAuth',
      'MID Server placement, clustering and credential design',
      'Service Graph Connectors for CMDB data, through the Identification and Reconciliation Engine',
      'Stream Connect for Apache Kafka and Remote Tables for high-volume or external data',
      'MCP Client and the MCP Server Console, under AI Control Tower',
    ],
    diagram: {
      kind: 'hub',
      center: 'ServiceNow',
      left: ['HR', 'Finance', 'Identity'],
      right: ['Monitoring', 'Network (DDI)', 'Developer tools'],
      caption: 'Each connection uses the right pattern: a spoke, an API, a connector or a MID Server.',
    },
    faqs: [
      {
        q: 'Should we use Integration Hub or custom code?',
        a: 'Prebuilt spokes where they exist, because ServiceNow maintains them. Custom spokes or scripted APIs where they do not. We avoid one-off scripts that only one person understands.',
      },
      {
        q: 'How do you integrate with systems behind our firewall?',
        a: 'Through a MID Server: a small application inside your network that ServiceNow reaches securely. We design where it runs and how its credentials are stored.',
      },
      {
        q: 'Can you integrate TCPWave with ServiceNow?',
        a: 'TCPWave documents an integration that lets ServiceNow workflows allocate IP addresses and create DNS records through its API. See <a href="/solutions/tcpwave/">our TCPWave page</a> for the details.',
      },
    ],
    related: ['integration-delivery', 'cmdb', 'itom'],
  },
  {
    slug: 'app-engine',
    blurb: 'Custom apps, kept upgrade-safe',
    kind: 'platform',
    name: 'App Engine and custom applications',
    short: 'App Engine',
    icon: 'appEngine',
    accent: 'core',
    seo: {
      title: 'ServiceNow App Engine and scoped app development | Raleston',
      description:
        'Replace spreadsheets and email approvals with apps on ServiceNow. Low-code and pro-code App Engine builds, kept upgrade-safe in scoped applications.',
    },
    headline: 'Custom applications on ServiceNow',
    lead: 'When nothing out of the box fits, build it on the platform you already own, and keep it upgrade-safe.',
    plain:
      'App Engine is ServiceNow’s set of tools for building your own applications, from quick low-code apps in App Engine Studio to full pro-code builds in ServiceNow Studio. Typical uses are processes that run on spreadsheets, email approvals or old databases. Each app lives in its own scope, so it stays isolated and safe to upgrade.',
    why: [
      'Important processes running on spreadsheets and inboxes.',
      'Approvals that live in email threads nobody can audit.',
      'Citizen-built apps with no governance.',
      'Customisations in the global scope that break on every upgrade.',
    ],
    delivers: [
      'App design: data model, roles and workflow before any build',
      'Low-code builds in App Engine Studio, and pro-code where it is needed',
      'Flows, subflows and decision tables in Workflow Studio',
      'Workspaces and portal pages in UI Builder',
      'Governance for citizen developers with App Engine Management Center',
      'Testing with the Automated Test Framework, and release management',
    ],
    ai: {
      text: 'AI speeds up building, while architects keep it sound.',
      points: [
        'ServiceNow Otto for Creator generates code, flows and playbooks from plain language',
        'Build Agent works inside ServiceNow Studio and common AI coding tools',
        'Tests generated for the Automated Test Framework',
      ],
    },
    outcomes: ['Processes moved off spreadsheets and email', 'Apps that survive upgrades', 'Faster delivery without losing control'],
    technical: [
      'Scoped applications with their own tables, roles and access controls',
      'App Engine Studio templates, Workflow Studio and UI Builder',
      'ServiceNow Studio and the ServiceNow SDK for pro-code teams',
      'App Engine Management Center for pipelines and deployment approvals',
      'Automated Test Framework coverage before every release',
    ],
    diagram: {
      kind: 'layers',
      layers: [
        { label: 'People', sub: 'Portal, workspace and mobile' },
        { label: 'Experience', sub: 'Pages and workspaces in UI Builder' },
        { label: 'Logic', sub: 'Flows and decisions in Workflow Studio' },
        { label: 'Data', sub: 'Tables inside a scoped app' },
        { label: 'Platform', sub: 'Security, roles and upgrades' },
      ],
      caption: 'A scoped app keeps every layer in its own namespace, separate from the core platform.',
    },
    faqs: [
      {
        q: 'Low-code or pro-code?',
        a: 'Both, depending on the app. Low-code is faster for request and approval apps; pro-code fits complex logic and integrations. Many apps use a mix, built to the same standards.',
      },
      {
        q: 'What is a scoped application?',
        a: 'An app with its own namespace, tables and permissions, separate from ServiceNow’s core. It can be upgraded, moved and maintained without touching anything else.',
      },
      {
        q: 'Can our own people build apps?',
        a: 'Yes, with guardrails. We set up templates, review gates and App Engine Management Center, so citizen developers move quickly without creating risk.',
      },
    ],
    related: ['integrations', 'enterprise-architecture', 'implementation'],
  },
  {
    slug: 'enterprise-architecture',
    blurb: 'Capability maps and platform design',
    kind: 'platform',
    name: 'Enterprise Architecture',
    short: 'Enterprise Architecture',
    icon: 'architecture',
    accent: 'core',
    seo: {
      title: 'ServiceNow Enterprise Architecture and platform design | Raleston',
      description:
        'Two kinds of architecture: ServiceNow’s Enterprise Architecture product for application portfolios, and the platform architecture that keeps your instance clean.',
    },
    headline: 'Enterprise Architecture, in both senses',
    lead: 'Map your applications to what the business needs. And architect the platform itself, before anything is configured.',
    plain:
      'Enterprise Architecture means two things here. First, ServiceNow’s Enterprise Architecture product (formerly Application Portfolio Management), which maps applications, data and processes to business capabilities so you can cut duplication and plan retirements. Second, the architecture of your ServiceNow platform itself: instance strategy, standards and governance, designed before anything is configured.',
    why: [
      'Too many applications doing the same job.',
      'Technology running past its supported life.',
      'No shared map of what the business does and which systems support it.',
      'A ServiceNow instance that grew without a design, and now resists change.',
    ],
    delivers: [
      'Business capability maps linked to applications',
      'Application rationalisation: keep, invest, replace or retire',
      'Technology lifecycle tracking for obsolescence risk',
      'Platform architecture: instance strategy, standards and a design authority',
      'A technical debt review, and a plan to pay it down',
    ],
    ai: {
      text: 'AI keeps the map current and turns it into pictures people understand.',
      points: [
        'Suggested relationships between applications and capabilities',
        'Diagrams generated from text prompts in the Enterprise Architecture Workspace',
        'Otto summaries for portfolio reviews',
      ],
    },
    outcomes: ['Fewer overlapping applications', 'Clear retirement and investment plans', 'A platform that stays coherent as it grows'],
    technical: [
      'Enterprise Architecture Workspace, business capability maps and application portfolio assessments',
      'Technology Portfolio Management for lifecycle and obsolescence',
      'CSDM Design & Planning domain: business capabilities, business applications and information objects',
      'Platform governance: pipeline and update standards, coding standards and design reviews',
      'Instance strategy: single or multiple instances, and domain separation where needed',
    ],
    diagram: {
      kind: 'layers',
      layers: [
        { label: 'Business capabilities', sub: 'What the business does' },
        { label: 'Applications', sub: 'What supports each capability' },
        { label: 'Technology', sub: 'What each application runs on' },
        { label: 'Lifecycle', sub: 'When each piece needs attention' },
      ],
      caption: 'One model from business capability down to technology, kept in the same CMDB.',
    },
    faqs: [
      {
        q: 'What happened to Application Portfolio Management?',
        a: 'ServiceNow renamed it Enterprise Architecture in the Xanadu release (2024), keeping its capabilities and broadening the scope beyond applications.',
      },
      {
        q: 'What does architect-led mean for our platform?',
        a: 'A certified architect designs the solution before anything is configured: the data model, the integrations, and what stays out-of-the-box. That design is what keeps the platform clean and upgradeable.',
      },
      {
        q: 'Do we need a separate EA tool?',
        a: 'Not necessarily. If you already run ServiceNow, its Enterprise Architecture product uses the same CMDB and data model, which saves building a second inventory.',
      },
    ],
    related: ['spm', 'cmdb', 'advisory-and-strategy'],
  },

  // ── Delivery services (the four stages of the staircase) ──────────────────
  {
    slug: 'advisory-and-strategy',
    blurb: 'Health checks, roadmaps and business cases',
    kind: 'delivery',
    name: 'Advisory & Strategy',
    short: 'Advisory & Strategy',
    icon: 'advisory',
    accent: 'core',
    seo: {
      title: 'ServiceNow advisory, health checks and roadmaps | Raleston',
      description:
        'A clear ServiceNow roadmap, aligned to your business goals: platform health checks, licence reviews, staged roadmaps and business cases from certified architects.',
    },
    headline: 'Advisory and strategy',
    lead: 'A clear ServiceNow roadmap, aligned to your business goals, so every investment drives measurable impact.',
    plain:
      'Advisory and strategy is where we look at your platform and your plans together. We review how your instance is built and used, what you own and what you use, and where the value is. You leave with a roadmap and a business case your leadership can act on.',
    why: ['Licences bought but not used.', 'A platform that grew without a plan.', 'Competing priorities and no agreed order.', 'Upgrades that keep getting postponed.'],
    steps: [
      { name: 'Assess', text: 'An instance health check: customisations, upgrade readiness, CMDB health and data quality.' },
      { name: 'Review', text: 'Licences and modules: what you own, what you use and what you could use.' },
      { name: 'Prioritise', text: 'Workshops with your leaders and process owners to agree what matters most.' },
      { name: 'Plan', text: 'A roadmap in stages, with a business case for each.' },
    ],
    delivers: ['A platform health report with ranked findings', 'A licence and module usage review', 'A staged roadmap with dependencies', 'A business case for each stage'],
    duration: 'Typically 2 to 6 weeks',
    who: {
      raleston: 'A certified ServiceNow architect leads; specialists join for specific modules.',
      you: 'Your platform owner, IT leadership and the owners of key processes.',
    },
    ai: {
      text: 'AI readiness is part of the review.',
      points: [
        'Knowledge base and data quality, which decide how good AI answers will be',
        'Which Otto skills and AI agents fit your processes',
        'Governance with AI Control Tower before anything goes live',
      ],
    },
    outcomes: ['An agreed order of work', 'Spend tied to outcomes', 'Fewer surprises at upgrade time'],
    technical: [
      'Instance scan and customisation review',
      'Upgrade readiness for the next family release',
      'CMDB Health and CSDM alignment check',
      'Licence entitlements compared with actual usage',
    ],
    diagram: { kind: 'flow', steps: ['Assess', 'Review', 'Prioritise', 'Plan'], caption: 'Four steps from where you are to a plan you can fund.' },
    faqs: [
      {
        q: 'What do we get at the end?',
        a: 'A health report with ranked findings, a licence and module review, a staged roadmap and a business case for each stage. You can deliver it with us or on your own.',
      },
      {
        q: 'Do you only review ServiceNow?',
        a: 'We focus on ServiceNow and the systems connected to it, because that is where we can give specific, practical advice.',
      },
    ],
    related: ['implementation', 'enterprise-architecture', 'support-and-optimization'],
  },
  {
    slug: 'implementation',
    blurb: 'From discovery workshops to go-live',
    kind: 'delivery',
    name: 'Implementation',
    short: 'Implementation',
    icon: 'implementation',
    accent: 'core',
    seo: {
      title: 'ServiceNow implementation by certified architects | Raleston',
      description:
        'End-to-end ServiceNow implementations tailored to your workflows: discovery, design, build, testing, go-live and hypercare, delivered in usable stages.',
    },
    headline: 'Implementation',
    lead: 'End-to-end ServiceNow implementations tailored to your workflows: architecture, configuration, testing and deployment.',
    plain:
      'Implementation is where the design becomes a working platform. We run discovery workshops, design the solution, build it in short stages, test it with your people and support you through go-live and after. Each release is usable on its own, so value arrives early.',
    why: [
      'Big-bang projects that take a year to show anything.',
      'Builds that drift from out-of-the-box and get expensive to upgrade.',
      'Go-lives with no plan for the weeks after.',
    ],
    steps: [
      { name: 'Discover', text: 'Workshops with the people who do the work, to understand how it really flows.' },
      { name: 'Design', text: 'A solution design: data model, processes, integrations and what stays out-of-the-box.' },
      { name: 'Build', text: 'Configuration in short sprints, with demos as we go.' },
      { name: 'Test', text: 'Automated tests where they pay off, and user acceptance testing with your team.' },
      { name: 'Go live', text: 'A planned cutover, with training and communications ready.' },
      { name: 'Hypercare', text: 'Close support in the first weeks, then handover to your team or ours.' },
    ],
    delivers: [
      'A solution design document',
      'Configured and tested modules',
      'Automated tests and test evidence',
      'Training material and admin documentation',
      'A cutover plan and hypercare',
    ],
    duration: 'Typically 8 to 16 weeks per release, depending on scope',
    who: { raleston: 'A certified architect, with consultants and developers.', you: 'A sponsor, process owners, subject experts and testers.' },
    ai: {
      text: 'AI goes into the plan, not on top of it.',
      points: ['Otto and AI agents switched on where they fit the process', 'Knowledge set up so AI answers have good material', 'Guardrails and measurement from day one'],
    },
    outcomes: [
      'Clients see up to 40% faster deployment and up to 60% higher user adoption with this approach',
      'Value in each release, not only at the end',
      'A build that stays close to out-of-the-box',
    ],
    technical: [
      'ServiceNow pipelines or update sets, with clear standards',
      'Automated Test Framework suites',
      'An instance clone and data strategy for testing',
      'Upgrade-safe configuration first; custom code only where it is justified',
    ],
    diagram: {
      kind: 'flow',
      steps: ['Discover', 'Design', 'Build', 'Test', 'Go live', 'Hypercare'],
      caption: 'Each release goes through every step, so something usable ships every time.',
    },
    faqs: [
      {
        q: 'How do you keep implementations on track?',
        a: 'Short stages with demos, a design agreed before building, and decisions written down. Problems surface in weeks, not at the end.',
      },
      {
        q: 'Can you take over an implementation that is in trouble?',
        a: 'Yes. We review the design and the build, agree what to keep, and replan in stages. The first step is usually a short assessment.',
      },
    ],
    related: ['advisory-and-strategy', 'support-and-optimization', 'itsm'],
  },
  {
    slug: 'integration-delivery',
    blurb: 'Connections designed, built and monitored',
    kind: 'delivery',
    name: 'Integration',
    short: 'Integration',
    icon: 'integrationDelivery',
    accent: 'data',
    seo: {
      title: 'ServiceNow integration projects, delivered | Raleston Consulting',
      description:
        'From HR and Finance to ITSM and custom applications: integration projects that are designed, built, tested, monitored and documented.',
    },
    headline: 'Integration delivery',
    lead: 'From HR and Finance to ITSM and custom applications, integrations that create unified workflows and remove silos.',
    plain:
      'Integration delivery is how we connect ServiceNow to your other systems in practice. We inventory the systems and their owners, pick the right pattern for each connection, build it with proper error handling, and hand it over with monitoring and documentation.',
    why: [
      'Projects stall waiting on another team’s system.',
      'Nobody knows which integration owns which data.',
      'Failures are found by users, not by monitoring.',
    ],
    steps: [
      { name: 'Inventory', text: 'Systems, data owners, volumes and security rules.' },
      { name: 'Choose the pattern', text: 'A spoke, a REST API, a Service Graph Connector or a MID Server, for each connection.' },
      { name: 'Build', text: 'Connections with retries, error handling and alerts.' },
      { name: 'Prove', text: 'Tests with real data volumes and failure cases.' },
      { name: 'Hand over', text: 'Runbooks, monitoring and documentation for the owners.' },
    ],
    delivers: ['An integration inventory and design', 'Built and tested integrations', 'Monitoring and alerting for failures', 'Runbooks and documentation'],
    duration: 'Typically 2 to 6 weeks per integration',
    who: { raleston: 'An integration lead and developers, with an architect overseeing the design.', you: 'The owners of each connected system, and your security team.' },
    ai: {
      text: 'AI agents need integrations too.',
      points: ['MCP connections designed with permissions and audit from the start', 'AI Control Tower governance for every agent that touches ServiceNow'],
    },
    outcomes: ['Reliable data flows', 'Faster onboarding of new systems', 'Integrations your team can support'],
    technical: ['Integration Hub spokes and custom spokes', 'Scripted REST APIs with OAuth', 'MID Server clusters', 'Service Graph Connectors through the reconciliation engine'],
    diagram: {
      kind: 'flow',
      steps: ['Inventory', 'Pattern', 'Build', 'Prove', 'Hand over'],
      caption: 'Every connection is designed, proven and documented before it is handed over.',
    },
    faqs: [
      {
        q: 'Which systems do you integrate most often?',
        a: 'Identity, HR, finance, monitoring, network and developer tools. The patterns are similar; what changes is security and data ownership, which we settle early.',
      },
      {
        q: 'Who owns an integration after go-live?',
        a: 'We agree an owner for each one before we build it, and hand over runbooks and monitoring so that owner can support it. If you prefer, our support team can own it with you.',
      },
    ],
    related: ['integrations', 'implementation', 'cmdb'],
  },
  {
    slug: 'support-and-optimization',
    blurb: 'Upgrades, tuning and steady improvement',
    kind: 'delivery',
    name: 'Support & Optimization',
    short: 'Support & Optimization',
    icon: 'support',
    accent: 'core',
    seo: {
      title: 'ServiceNow support, upgrades and optimization | Raleston',
      description:
        'Proactive monitoring, twice-yearly upgrade planning, performance tuning and technical debt clean-up, so your ServiceNow platform keeps delivering after go-live.',
    },
    headline: 'Support and optimization',
    lead: 'Digital transformation does not end at go-live. Proactive monitoring, upgrades and performance tuning keep the platform growing with your business.',
    plain:
      'Support and optimization keeps your platform healthy after go-live. We handle support requests, plan and test each twice-yearly ServiceNow family release upgrade, tune performance, clean up technical debt and keep a backlog of improvements moving.',
    why: [
      'Upgrades skipped until the instance falls out of support.',
      'Small fixes waiting months behind big projects.',
      'Performance that slowly degrades.',
      'Nobody checking whether the platform still fits the business.',
    ],
    steps: [
      { name: 'Monitor', text: 'Instance health, performance and failed jobs, watched continuously.' },
      { name: 'Support', text: 'Requests and fixes handled against agreed service levels.' },
      { name: 'Upgrade', text: 'Each family release planned, tested and applied, twice a year.' },
      { name: 'Improve', text: 'A prioritised backlog of enhancements and technical debt clean-up.' },
    ],
    delivers: [
      'Managed support with agreed response targets',
      'Upgrade planning and regression testing for each release',
      'Performance tuning',
      'Technical debt clean-up',
      'A prioritised enhancement backlog',
      'Monthly reporting',
    ],
    duration: 'Ongoing; each upgrade typically takes 4 to 8 weeks to plan, test and apply',
    who: { raleston: 'A named support lead, with an architect overseeing.', you: 'Your platform owner.' },
    ai: {
      text: 'Your AI features stay current as ServiceNow releases them.',
      points: ['New Otto skills and AI agents assessed each release', 'Usage and value tracked over time'],
    },
    outcomes: ['A platform on a supported, current release', 'Steady improvement instead of big rescues', 'Fewer surprises'],
    technical: [
      'Release notes reviewed against your configuration',
      'Automated regression tests',
      'Instance scan findings resolved',
      'Upgrade skipped records reviewed and resolved',
    ],
    diagram: { kind: 'cycle', stages: ['Monitor', 'Support', 'Upgrade', 'Improve'], caption: 'A steady loop, so the platform improves between upgrades as well as at them.' },
    faqs: [
      {
        q: 'How often does ServiceNow upgrade?',
        a: 'ServiceNow ships two family releases a year, named alphabetically (recent ones are Zurich and Australia). Staying on a supported release keeps you secure and gives you new features.',
      },
      { q: 'Can you support an instance you did not build?', a: 'Yes. We start with a short review, so we know what we are supporting, and then take it on.' },
    ],
    related: ['implementation', 'advisory-and-strategy', 'cmdb'],
  },
];

export const PLATFORM = SERVICES.filter((s) => s.kind === 'platform');
export const DELIVERY = SERVICES.filter((s) => s.kind === 'delivery');
export const serviceBySlug = (slug: string) => SERVICES.find((s) => s.slug === slug);
