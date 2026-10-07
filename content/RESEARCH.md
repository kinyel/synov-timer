# Research notes for the v4 site copy

Compiled 6 October 2026 for the Raleston Consulting redesign. Every term was checked against official sources first: servicenow.com product pages, ServiceNow product documentation, the ServiceNow Newsroom, Community articles written by ServiceNow staff, and tcpwave.com. Anything from elsewhere is marked. Sources are listed at the end of each entry; the full list is in section 11.

**Labels**

| Label | Meaning |
|---|---|
| **[site]** | Stated on the current ralestonconsulting.com (Home or About). Safe to say. |
| **[proposed: confirm with client]** | Inferred. The copy can describe it as something Raleston can do, but Charles must confirm it before launch. |
| **[ServiceNow claim]** | ServiceNow's own marketing statement. Never presented as a Raleston result. |

**Numbers.** The only outcome numbers the site may use are the client's own: "up to 40% faster deployment" and "up to 60% higher user adoption" **[site]**. The durations in section 7 are typical ranges for Charles to confirm, not results.

---

## 1. Names to get right (as of October 2026)

ServiceNow renamed several products this year. The site should use the current name, and give the old name once wherever buyers still know it.

| The brief says | Current name | When | Use on the site |
|---|---|---|---|
| Now Assist | **ServiceNow Otto.** ServiceNow: "Otto is replacing the Now Assist name in our product and content." Otto combines Now Assist, Moveworks and AI Experience. Licences and entitlements are unchanged. | Announced 5 May 2026 (Knowledge 2026); the rename has been rolling out since August 2026 | "ServiceNow Otto (formerly Now Assist)" on first use per page, then "Otto". **Needs your approval.** |
| Now Assist for ITSM | ServiceNow Otto for ITSM (the name on the current ITSM product page) | 2026 | Same |
| Now Assist for Creator | ServiceNow Otto for Creator (includes Build Agent) | August 2026 Store release | Same |
| Now Assist Skill Kit ("Skills") | **AI Skill Kit** | 2026 | "custom AI skills, built with the AI Skill Kit" |
| MCP support | **Action Fabric**, which has three parts: the MCP Server Console (outside agents call ServiceNow), the MCP Client (ServiceNow agents call other tools) and A2A (agent to agent). The MCP Server is generally available. | 5 May 2026 | "MCP (Model Context Protocol)"; name Action Fabric on the AI and service pages |
| AI governance | **AI Control Tower.** AI Gateway, inside it, governs MCP traffic. | Launched 2025, expanded 2026 | Same |
| Employee portal | Employee Center, and now **ServiceNow EmployeeWorks** (Otto plus Employee Slate Advanced), generally available since February 2026 | 2026 | "the employee portal" in plain copy; EmployeeWorks in technical expanders |
| Application Portfolio Management | **Enterprise Architecture** | Xanadu release (2024) | "Enterprise Architecture (formerly Application Portfolio Management)" in the expander |
| ITBM | **Strategic Portfolio Management (SPM)** | 2022 | SPM |
| IntegrationHub | **Integration Hub**, now part of **Workflow Data Fabric** | 2025 | Integration Hub |
| Flow Designer | Flows are built in **Workflow Studio**; Flow Designer opens inside it | Washington DC release (2024) | "Workflow Studio (Flow Designer)" |
| Studio / ServiceNow IDE | **ServiceNow Studio** (the IDE was merged into it) | September 2026 Store release | ServiceNow Studio |
| Release names | Zurich (Q4 2025), **Australia** (GA 5 May 2026), **Brazil** (Early Availability 24 September 2026, GA expected November 2026), then Canada. With Australia, names switched from cities to countries. | | "twice-yearly family releases" in general copy; name Brazil only on the Support page |

**Unverified, do not use:** a third-party claim that AI stopped being a separate SKU on 9 April 2026. ServiceNow's own 5 May 2026 release still says the MCP Server is "included in every Now Assist and AI Native SKU".

**Please confirm (client facts)**
- **Partner status.** The brief's eyebrow says "ServiceNow consulting partner". If Raleston is not enrolled in the ServiceNow Partner Program, the eyebrow should say "ServiceNow consultancy" instead.
- **Certifications.** The site names no partner tier and no certifications beyond Charles's: "certified ServiceNow Technical Architect" **[site]**.

Sources: [Otto quick start guide](https://www.servicenow.com/community/servicenow-otto-articles/otto-now-assist-quick-start-guide/ta-p/2685044) · [Otto has arrived (25 Aug 2026)](https://www.servicenow.com/community/developer-blog/servicenow-otto-has-arrived-what-s-changing-in-community-and/ba-p/3591256) · [Otto press release](https://newsroom.servicenow.com/press-releases/details/2026/ServiceNow-Otto-creates-the-unified-AI-experience-for-the-enterprise/default.aspx) · [Action Fabric press release](https://newsroom.servicenow.com/press-releases/details/2026/ServiceNow-opens-its-full-system-of-action-to-every-AI-Agent-in-the-enterprise/default.aspx) · [AI Skill Kit FAQ](https://www.servicenow.com/community/servicenow-otto-articles/ai-skill-kit-now-assist-skill-kit-nask-faq/ta-p/3007953) · [EmployeeWorks getting started](https://www.servicenow.com/community/sn-employeeworks-articles/getting-started-with-servicenow-employeeworks/ta-p/3556833) · [EA docs (formerly APM)](https://www.servicenow.com/docs/r/yokohama/application-portfolio-management/application-portfolio-management-landing-page.html) · [ITBM is now SPM](https://www.servicenow.com/workflow/product-insights/itbm-is-now-strategic-portfolio-management.html) · [Integration Hub](https://www.servicenow.com/products/integration-hub.html) · [Workflow Studio in Washington DC](https://www.servicenow.com/community/upgrades-and-patching-articles/washington-dc-upgrade-workflow-studio-flow-designer-information/ta-p/2846383) · [Otto for Creator, Brazil EA](https://www.servicenow.com/community/servicenow-otto-for-creator/what-s-new-in-servicenow-otto-for-creator-brazil-ea-release/ta-p/3596068) · Release dates: [Brazil key dates](https://nowben.com/servicenow-brazil-release-key-dates-and-preview-information/), [Australia timeline](https://craigtalbert.medium.com/the-servicenow-australia-release-availability-timeline-and-major-changes-7ab99389672a) (both third-party; ServiceNow's release notes are behind login)

---

## 2. The foundation: CMDB (Azure)

### CMDB (Configuration Management Database)

**Plain English.** The CMDB is the platform's map of your technology: every server, laptop, application, cloud resource and business service, and how they depend on each other. Each item is a configuration item (CI). When the map is right, ServiceNow can tell you what a change will break, which service an outage hits and who owns the fix. When it is wrong, every module built on it gives wrong answers.

**ServiceNow products and features**
- **CSDM (Common Service Data Model):** ServiceNow's standard model for how CIs, applications and services relate. CSDM 5 has seven domains: Foundation, Ideation & Strategy, Design & Planning, Build & Integration, Service Delivery, Service Consumption and Manage Portfolios. It adds models for SBOM, AI systems, operational technology, value streams, teams and life cycle stages.
- **Identification and Reconciliation Engine (IRE):** matches incoming data against identification rules, so the same server is not created twice. Reconciliation decides which data source wins for each field.
- **CMDB Health dashboard**, with three scorecards:
  - **Completeness:** required and recommended fields filled
  - **Correctness:** duplicate, orphan and stale CIs
  - **Compliance:** CIs pass Desired State audits
- **CMDB Workspace** and **CMDB Data Manager** (policies to retire, archive or delete stale CIs).
- **Data sources:** Discovery, Service Mapping, Service Graph Connectors and imports.

**Why the other practices depend on it**
- ITSM uses it for impact, change risk and routing.
- ITOM fills it (Discovery, Service Mapping) and uses it to tie alerts to services.
- ITAM links asset records to CIs. ServiceNow's HAM page: HAM "uses the CMDB as a single source of truth for hardware assets."
- AI features read it to set the affected CI on an incident and to explain impact. Bad CMDB data makes AI answers wrong.

**Common problems**
- Duplicates from imports that bypass the IRE.
- Stale CIs nobody retires.
- No owner for each class of data.
- Custom tables and fields that ignore CSDM, which slows upgrades and blocks out-of-the-box features.
- A CMDB nobody trusts, so teams keep spreadsheets instead.

**What a partner delivers**
- Fixing broken CMDBs and realigning architectures: Charles "is known for fixing broken CMDBs, realigning architectures" **[site]**
- CMDB health assessment with a scored baseline **[proposed: confirm with client]**
- CSDM alignment plan and migration **[proposed: confirm with client]**
- Data governance: class owners, data certification, retirement policies **[proposed: confirm with client]**
- De-duplication and clean-up with IRE rules and reconciliation **[proposed: confirm with client]**
- Discovery-led population **[proposed: confirm with client]**

Sources: [CSDM 5 white paper](https://www.servicenow.com/community/s/cgfwn76974/attachments/cgfwn76974/common-service-data-model-kb/744/3/CSDM%205%20w%20links.pdf) · [CMDB Health: completeness, compliance, correctness](https://www.servicenow.com/community/cmdb-forum/cmdb-health-dashboard-completeness-compliance-amp-correctness/m-p/3488492) · [Correctness KPI (KB2612771)](https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB2612771) · [Duplicate CIs](https://www.servicenow.com/community/in-other-news/duplicate-configuration-items-in-the-servicenow-cmdb/ba-p/2271418) · [HAM](https://www.servicenow.com/products/hardware-asset-management.html)

### Service Graph Connectors

**Plain English.** Prebuilt, certified imports that bring data from other tools (cloud platforms, endpoint management, security scanners) into the CMDB properly. The data goes through the IRE, lands in the right classes and doesn't create duplicates.

**Details**
- Available from the ServiceNow Store.
- ServiceNow Community: "Service Graph Connectors provide stand-alone and shareable Service Graph imports from 3rd parties."
- OT Certified Service Graph Connectors exist for operational technology security providers.

**Common problems.** Homemade import sets that skip the IRE and create duplicates.

**What a partner delivers.** Connector selection and set-up, source precedence rules, and retiring old custom imports **[proposed: confirm with client]**.

Sources: [Integration Hub spokes and Service Graph Connectors](https://www.servicenow.com/community/workflow-data-fabric-blog/integration-hub-spokes-and-how-to-build-them/ba-p/2788254) · [ITOM](https://www.servicenow.com/products/it-operations-management.html)

---

## 3. The three buildings

### ITSM: IT Service Management (the Service Centre)

**Plain English.** How IT takes requests and fixes problems for employees:
- **Incidents:** something broke
- **Requests:** I need something
- **Problems:** why does it keep breaking?
- **Changes:** updating systems safely
- Plus knowledge articles, a service catalog, service level agreements (SLAs), an employee portal and chat.

**ServiceNow products and features**
- ITSM: incident, problem, change and request management; service catalog; knowledge management; SLAs; major incident management; Service Operations Workspace; CAB Workbench and change approval policies.
- Channels, according to ServiceNow's ITSM page: "EmployeeWorks, voice, chat, portal, Teams, Slack, email, and desktop."
- **ServiceNow Otto for ITSM (formerly Now Assist for ITSM):**
  - summaries of incidents, chats and change requests
  - generated resolution notes and knowledge articles
  - suggested replies in agent chat
- **AI agents for ITSM.** ServiceNow: they "automatically assign category, subcategory, and configuration items (CIs) while linking to related major incidents or problems."
- **Predictive Intelligence:** classic machine learning that predicts category, priority and assignment group from past tickets.
- **Advanced Work Assignment:** offers work to agents by group, availability, capacity and skills.
- Virtual Agent (conversational chat) and AI Search (answers from knowledge and the catalog).

**Common problems**
- Requests arrive by email and nobody can see their status.
- Tickets bounce between groups.
- The same incidents come back because nobody fixes the root cause.
- Risky changes and slow approvals.
- Little visibility of SLAs.
- Old, heavily customised implementations that are hard to upgrade.

**What a partner delivers**
- From the current site **[site]**:
  - "Automate ticket routing, approvals, and escalations"
  - "Use AI to detect patterns and prevent repeat issues"
  - "Streamline workflows to improve SLAs and user experience"
  - "implement ITSM with a focus on speed, clarity, and long-term maintainability"
- **[proposed: confirm with client]**:
  - ITIL 4-aligned process design
  - service catalog and portal design
  - SLA design
  - a major incident process
  - change risk and CAB automation
  - migration from legacy tools
  - re-implementation back towards out-of-the-box

Sources: [ITSM](https://www.servicenow.com/products/itsm.html) · [AI agents: triage and categorize incidents](https://www.servicenow.com/ai/use-cases/triage-and-categorize-itsm-incidents.html) · [Predictive Intelligence or Now Assist?](https://www.servicenow.com/community/developer-articles/servicenow-predictive-intelligence-or-now-assist-yes/ta-p/3485149) · [Advanced Work Assignment FAQ](https://www.servicenow.com/community/agent-chat-routing-and-sidebar/advanced-work-assignment-awa-faqs/ta-p/2306792)

### ITOM: IT Operations Management (the Operations Centre)

**Plain English.** Knowing what is running and catching problems before users do.
- **Discovery** finds servers, network devices, cloud resources and containers, and fills the CMDB.
- **Service Mapping** shows which infrastructure supports which business service.
- **Event Management** turns floods of monitoring alerts into a few actionable ones and opens incidents automatically.
- **AIOps** spots anomalies early.

**ServiceNow products and features**
- **Discovery:** agentless, using a MID Server inside your network; event-driven discovery for cloud.
- **Service Mapping:** builds on discovered infrastructure to find every CI that supports a service.
- **Event Management:** "aggregates and correlates events from a variety of monitoring tools, suppresses duplicates, and highlights actionable alerts."
- **ITOM AIOps:** Health Log Analytics, Metric Intelligence, and the AIOps Configuration Center (2026).
- **Service Graph Connectors.**
- ServiceNow describes "dynamic service maps with CSDM embedded" and a "unified service graph" **[ServiceNow claim]**.
- Named a Leader in the IDC MarketScape for AIOps 2026 **[ServiceNow claim]**.

**Common problems**
- Nobody knows exactly what exists.
- Thousands of alerts a day, so the important one gets missed.
- Users report outages before IT knows.
- Changes break dependencies nobody mapped.
- MID Servers and credentials set up ad hoc.

**What a partner delivers**
- ITOM appears in the module list and in Charles's expertise **[site]**.
- **[proposed: confirm with client]**:
  - Discovery rollout, including MID Server architecture and credential design
  - Service Mapping for critical services
  - monitoring tool integrations
  - correlation and alert rules
  - cloud discovery

Sources: [ITOM](https://www.servicenow.com/products/it-operations-management.html) · [Discovery](https://www.servicenow.com/products/discovery.html) · [Service Mapping resources](https://www.servicenow.com/community/itom-articles/itom-service-mapping-knowledge-amp-troubleshooting-resources/ta-p/2625467) · [AIOps Configuration Center](https://www.servicenow.com/community/itom-blog/introducing-the-servicenow-itom-aiops-configuration-center/ba-p/3474804) · [ITOM AIOps data sheet](https://www.servicenow.com/content/dam/servicenow-assets/public/en-us/doc-type/resource-center/data-sheet/ds-itom-health.pdf)

### ITAM: IT Asset Management, including HAM, SAM and EAM (the Asset Warehouse)

**Plain English.** Knowing what you own, what it costs and whether you use it.
- **HAM (Hardware Asset Management):** tracks hardware from purchase to disposal.
- **SAM (Software Asset Management):** compares licences owned with what is installed and used, reclaims unused ones and keeps you ready for vendor audits. It also covers SaaS subscriptions.
- **EAM (Enterprise Asset Management):** covers physical assets that aren't IT.

**ServiceNow products and features**
- **HAM:** the CMDB as the single source of truth for hardware; lifecycle workflows from procurement to retirement; Hardware Asset Workspace. AI agents "process requests and normalize hardware to keep the CMDB clean" **[ServiceNow claim]**.
- **SAM:**
  - normalisation against ServiceNow's software content library
  - reconciliation of entitlements into licence positions
  - reclamation rules by usage hours or last-used date
  - publisher packs for Microsoft, Oracle, IBM, Adobe, SAP, VMware and Citrix
- **SaaS License Management:** direct integrations that reclaim or downgrade unused seats.
- **Cloud Cost Management.**
- **Enterprise Asset Management:** the full lifecycle of non-IT physical assets.
- ITAM connects to the service catalog, the CMDB and procurement.
- A Leader in the Forrester Wave for SAM, Q1 2025 **[ServiceNow claim]**.

**Common problems**
- Paying for licences nobody uses.
- Audit penalties.
- Unknown devices that become security blind spots.
- Lost hardware, missed refresh cycles and asset spreadsheets.

**What a partner delivers**
- HAM, SAM and EAM are named modules **[site]**.
- **[proposed: confirm with client]**:
  - HAM and SAM implementation
  - entitlement import and reconciliation
  - publisher pack set-up
  - reclamation workflows
  - audit readiness
  - lifecycle automation
  - SaaS licence management

Sources: [HAM](https://www.servicenow.com/products/hardware-asset-management.html) · [SAM](https://www.servicenow.com/products/software-asset-management.html) · [SaaS License Management](https://www.servicenow.com/products/saas-license-management.html) · [SAM publisher packs](https://www.servicenow.com/standard/resource-center/data-sheet/ds-sam-publisher-packs.html) · [EAM data sheet](https://www.servicenow.com/standard/resource-center/data-sheet/ds-enterprise-asset-management.html)

---

## 4. Capability grid (no 3D)

### SPM: Strategic Portfolio Management (formerly ITBM)

**Plain English.** One place to decide which projects get money and people, and to track whether they deliver the strategy. Ideas and demands come in, get scored and approved, become projects or agile work, and report progress against goals.

**ServiceNow products and features**
- Strategic Planning
- Demand Management
- Project Portfolio Management
- Resource Management
- Scenario Planning
- Agile development and SAFe support
- AI agents that "surface risks and reprioritize work" **[ServiceNow claim]**

**Common problems**
- Projects approved with no link to strategy.
- People booked twice.
- Status reported in slide decks.
- No single view of demand.

**What a partner delivers**
- SPM is a named module **[site]**.
- **[proposed: confirm with client]**: SPM rollout, demand-to-delivery process design, portfolio roadmapping.

Sources: [SPM](https://www.servicenow.com/products/strategic-portfolio-management.html) · [ITBM is now SPM](https://www.servicenow.com/workflow/product-insights/itbm-is-now-strategic-portfolio-management.html)

### Enterprise Architecture (two meanings; the site explains both)

**1. ServiceNow's Enterprise Architecture product** (formerly Application Portfolio Management, renamed in Xanadu)
- ServiceNow: it "maps applications, data, and processes to business capabilities in a shared model."
- Technology Portfolio Management handles technology lifecycle and obsolescence risk.
- The Enterprise Architecture Workspace is the main interface.
- AI can turn "text prompts into enterprise-ready diagrams" **[ServiceNow claim]**.
- Used to rationalise applications and plan retirements.

**2. Raleston's platform architecture discipline**
- Instance strategy, governance, standards, control of technical debt, and design before configuration.
- On the site **[site]**:
  - "Architectural Integrity: implementation should be built on solid architectural foundations"
  - Charles is known for "realigning architectures"

**Common problems**
- Application sprawl and overlapping tools.
- Unsupported technology versions.
- No capability map.
- On the platform itself: unmanaged customisations and painful upgrades.

**What a partner delivers**
- EA is a named module **[site]**.
- **[proposed: confirm with client]**: capability mapping, application rationalisation, Technology Portfolio Management set-up, platform governance and standards.

Sources: [Enterprise Architecture](https://www.servicenow.com/products/enterprise-architecture.html) · [EA (formerly APM) toolkit](https://www.servicenow.com/community/enterprise-architecture-articles/enterprise-architecture-formerly-application-portfolio/ta-p/2382292)

### App Engine and scoped applications

**Plain English.** Build your own apps on ServiceNow when nothing out of the box fits, and replace processes that run on spreadsheets and email. A scoped application keeps custom work in its own namespace, so it stays isolated and safe to upgrade.

**ServiceNow products and features**
- **App Engine Studio:** a low-code builder with templates, available with App Engine.
- **Workflow Studio:** flows, subflows, actions, decision tables and playbooks.
- **UI Builder:** workspaces and pages.
- **ServiceNow Studio:** the pro-code IDE.
- **ServiceNow SDK.**
- **Creator Studio:** no-code request apps.
- **App Engine Management Center:** governance for low-code. Since May 2026 it is "available to all ServiceNow customers at no additional cost".
- **AI:** ServiceNow Otto for Creator (code from comments, flow and playbook generation, app generation from a description, test generation) and **Build Agent**. Since May 2026 Build Agent also works inside Cursor, Windsurf, Claude Code and GitHub Copilot.

**Common problems**
- Shadow IT in spreadsheets and email approvals.
- Ungoverned citizen development.
- Customisations in the global scope that break on upgrade.

**What a partner delivers**
- Custom Applications and Scoped Applications are named **[site]**.
- **[proposed: confirm with client]**: app design and build (low-code and pro-code), App Engine governance set-up, migrating spreadsheet processes.

Sources: [App Engine Studio](https://www.servicenow.com/products/app-engine-studio.html) · [Creator Studio](https://www.servicenow.com/products/creator-studio.html) · [Build Agent press release (6 May 2026)](https://newsroom.servicenow.com/press-releases/details/2026/ServiceNow-Build-Agent-now-works-inside-every-major-AI-coding-tool-governed-by-default/default.aspx) · [Otto for Creator, Brazil EA](https://www.servicenow.com/community/servicenow-otto-for-creator/what-s-new-in-servicenow-otto-for-creator-brazil-ea-release/ta-p/3596068)

### Integrations (Azure)

**Plain English.** Connecting ServiceNow to HR, Finance, identity, monitoring and network tools, so data is entered once and stays consistent everywhere.

**ServiceNow products and features**
- **Integration Hub** (part of Workflow Data Fabric):
  - "hundreds" of prebuilt spokes
  - a Spoke Generator that builds spokes from OpenAPI specs
  - custom spokes
  - REST API Trigger
  - Stream Connect for Apache Kafka
  - Remote Tables
  - Integration Hub Import
  - a Connections dashboard for credentials
- **REST and SOAP APIs.**
- **MID Server:** reaches systems behind your firewall.
- **Service Graph Connectors:** bring CMDB data in.
- **MCP Client:** lets AI agents reach other tools.

**Common problems**
- Brittle scripts and hard-coded credentials.
- Integrations that fail silently.
- Duplicate data and no owner.

**What a partner delivers**
- **[site]**: "From HR and Finance to ITSM and custom applications ... secure and reliable connections."
- **[proposed: confirm with client]**: integration architecture, MID Server design, error handling and monitoring, documentation.

Sources: [Integration Hub](https://www.servicenow.com/products/integration-hub.html) · [Spokes and how to build them](https://www.servicenow.com/community/workflow-data-fabric-blog/integration-hub-spokes-and-how-to-build-them/ba-p/2788254) · [Integration best practices (MID Server)](https://www.servicenow.com/community/workflow-data-fabric-forum/integration-best-practices-for-the-modern-servicenow-platform/m-p/3571997)

---

## 5. AI in the work (Violet)

### ServiceNow Otto (formerly Now Assist)

**Plain English.** Generative AI built into ServiceNow's workflows.
- It reads and writes the same records your teams use.
- It summarises, drafts and answers inside the tools people already have, instead of in a separate chatbot.

**Products and features**
- **Since May 2026, Otto is the unified experience.** It combines Now Assist, Moveworks and AI Experience:
  - conversational requests
  - enterprise search
  - AI voice agents
  - AI Data Explorer
- **For ITSM:** summaries, resolution notes, knowledge article drafts, suggested replies.
- **Guardrails:** Now Assist Guardian; Data Privacy masks personal data; AI Control Tower governs.

**Common problems**
- A thin or outdated knowledge base gives poor answers.
- Unclear value.
- Licences bought but not switched on.
- Data quality problems.

**What a partner delivers** **[proposed: confirm with client]**
- readiness assessment (knowledge base and data quality)
- enabling and tuning Otto skills
- guardrails and governance
- measuring value

The site's line about "AI to detect patterns and prevent repeat issues" **[site]** supports this.

Sources: [Otto press release](https://newsroom.servicenow.com/press-releases/details/2026/ServiceNow-Otto-creates-the-unified-AI-experience-for-the-enterprise/default.aspx) · [Otto quick start](https://www.servicenow.com/community/servicenow-otto-articles/otto-now-assist-quick-start-guide/ta-p/2685044) · [ITSM](https://www.servicenow.com/products/itsm.html)

### Skills: the AI Skill Kit (formerly Now Assist Skill Kit)

**Plain English.** Otto works through individual skills, such as "summarise this incident". The AI Skill Kit lets a team build its own skills, with its own prompts and an approved model, for tasks specific to the company.

**Details** (from the FAQ, updated August 2026)
- **Prompts:** versioned, with inputs from records or tools; skills can be chained together.
- **Models:** ServiceNow-managed models or your own (bring your own LLM).
- **Deployment:** UI actions, flow actions, Virtual Agent topics, the Otto panel and context menus.
- **Requirements:**
  - a Now Assist (Otto) licence
  - the Xanadu release or later
  - the `sn_skill_builder.admin` role
  - not available on personal developer instances
- **Testing** consumes "Assists" (usage credits).

**What a partner delivers** **[proposed: confirm with client]**: skill design, prompt engineering, testing, rollout and governance.

Sources: [AI Skill Kit FAQ](https://www.servicenow.com/community/servicenow-otto-articles/ai-skill-kit-now-assist-skill-kit-nask-faq/ta-p/3007953) · [Creating a custom skill](https://www.servicenow.com/community/developer-blog/creating-a-custom-skill-with-now-assist-skill-kit-part-1/ba-p/3448719)

### AI agents

**Plain English.** Agents go a step further than summaries. They plan and carry out multi-step tasks, such as triaging an incident, within limits you set.

**Products**
- **AI Agent Studio:** build agents in natural language. It was rebuilt in the September 2026 release.
- **AI Agent Orchestrator:** coordinates teams of agents.
- **Out-of-the-box agents:** for example, ITSM incident triage.
- Available since March 2025.

**What a partner delivers** **[proposed: confirm with client]**: use-case selection, agent design, guardrails, testing.

Sources: [AI Agents](https://www.servicenow.com/products/ai-agents.html) · [AI Agent Orchestrator press release](https://www.servicenow.com/company/media/press-room/ai-agents-studio.html) · [Reimagined AI Agent Studio (Sept 2026)](https://www.servicenow.com/community/servicenow-otto-articles/reimagined-ai-agent-studio-september-2026-release/ta-p/3591309)

### MCP (Model Context Protocol), Action Fabric and AI Control Tower

**Plain English.** MCP is an open standard that lets AI agents discover and use tools in other systems. ServiceNow's explainer calls it "HTTP for AI agents". Anthropic created it, and it is now governed by the Agentic AI Foundation under the Linux Foundation.

**ServiceNow's support: Action Fabric** (Knowledge 2026, 5 May 2026)
- **MCP Server Console** (generally available):
  - Outside agents, such as Claude, Microsoft Copilot or your own, can run governed ServiceNow work: "flows, playbooks, approvals, catalogs".
  - It includes AI Control Tower governance, consumption metering, managed OAuth, audit trails, session management and role-based tool packages.
  - "Included in every Now Assist and AI Native SKU, with additional features available 2H 2026."
  - Anthropic is the first design partner.
- **MCP Client:**
  - ServiceNow AI agents call tools on other MCP servers, for example Jira, GitHub or monitoring tools.
  - Requires AI Agent Studio on Zurich or later.
  - Remote servers only.
  - Authentication: none, API key, or OAuth 2.1.
- **A2A:** ServiceNow agents work with outside agents as peers.
- **AI Control Tower:** every action is "identity-verified, permission-scoped, and fully auditable". AI Gateway is the part that governs MCP traffic.

**Common problems**
- Teams connect AI tools to production data with no scoping or audit.
- Community MCP servers vary widely in security.

**What a partner delivers** **[proposed: confirm with client]**
- connecting AI agents to ServiceNow safely
- choosing which actions they may take
- setting up AI Control Tower governance

Sources: [Action Fabric press release](https://newsroom.servicenow.com/press-releases/details/2026/ServiceNow-opens-its-full-system-of-action-to-every-AI-Agent-in-the-enterprise/default.aspx) · [Action Fabric explained](https://www.servicenow.com/community/servicenow-otto-articles/action-fabric-mcp-server-mcp-client-and-a2a-explained/ta-p/3557794) · [Enable MCP and A2A](https://www.servicenow.com/community/now-assist-articles/enable-mcp-and-a2a-for-your-agentic-workflows-with-faqs-updated/ta-p/3373907) · [MCP Server Console FAQ](https://www.servicenow.com/community/servicenow-otto-articles/mcp-server-console-faq/ta-p/3550125) · [Anthropic: MCP donated to the Agentic AI Foundation](https://anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation)

---

## 6. TCPWave

**Plain English.** TCPWave sells DDI software: DNS (names), DHCP (handing out addresses) and IPAM (IP address management). Its ServiceNow integration lets a ServiceNow workflow carry out network tasks automatically, instead of someone doing them by hand after a ticket is approved.

**What TCPWave documents**
- ServiceNow workflow activities on change requests (Workflows and Script Includes) call the TCPWave IPAM REST API over HTTPS, with mutual SSL certificate authentication.
- **Automated tasks:**
  - create and delete networks
  - allocate the next free IP address
  - create and delete DNS A and CNAME records
  - create and delete DHCP scopes
  - manage static objects
- **Benefits TCPWave names:** automated workflows, visibility of the network inside ServiceNow, and customisable workflows.

**Not in TCPWave's material.** It says nothing about CMDB sync, MID Server, spokes or a Store app. The brief's line "keeps network data aligned with the CMDB" is therefore **[proposed: confirm with client]**. The integration guide is dated February 2021, so the current version should also be confirmed.

**Raleston's part.** Still needed from the client: the LinkedIn TCPWave content and what Raleston actually delivered. The page ships with marked placeholders.

Sources: [TCPWave ServiceNow integration](https://tcpwave.com/servicenow_integration/) · [Integration guide (PDF, Feb 2021)](https://tcpwave.com/Guides/ServiceNow%20Integration.pdf) · [TCPWave IPAM](https://www.tcpwave.com/ipam)

---

## 7. The four delivery services

These quote or paraphrase the current site **[site]**. Every duration and role is **[proposed: confirm with client]**, labelled "typical".

| Service | What happens | What you get | Typical duration | Who is involved |
|---|---|---|---|---|
| **Advisory & Strategy** | **[site]** "define a clear ServiceNow roadmap", "initial assessments", "reduce complexity and maximize ROI". Platform health check (customisations, upgrade readiness, CMDB health), licence and module review ("maximize the ServiceNow subscriptions you already own" **[site]**), roadmap, business case. | Health report with ranked findings, licence usage view, roadmap, business case | 2 to 6 weeks | Raleston architect; your platform owner, IT leadership, process owners |
| **Implementation** | **[site]** "architecture, configuration, testing, and deployment". Discovery workshops, design, build in sprints, testing, user acceptance testing (UAT), go-live, hypercare. | Solution design, configured modules, test evidence, training material, admin documentation, hypercare | 8 to 16 weeks per module release | Raleston architect and consultants; your sponsor, process owners, subject experts, testers |
| **Integration** | **[site]** "HR and Finance to ITSM and custom applications". Inventory of systems and data owners, choice of pattern (spoke, REST, Service Graph Connector, MID Server), build, error handling, monitoring, documentation. | Working, monitored integrations with runbooks | 2 to 6 weeks per integration | Raleston integration lead; owners of the connected systems, security |
| **Support & Optimization** | **[site]** "proactive monitoring, upgrades, and performance tuning". Managed support, planning for the twice-yearly family releases (next: Brazil, GA expected November 2026), performance tuning, clean-up of technical debt, an enhancement backlog. | Stable platform on a current release, prioritised backlog, monthly reporting | Ongoing; about 4 to 8 weeks per release upgrade | Raleston support team; your platform owner |

---

## 8. Hero journey: checked wording for the five steps

The brief's meaning stays the same. Changes are only for accuracy. Each step names the capability that does the work.

| # | Step | Copy (draft) | What makes it happen | Accent | Small fact |
|---|---|---|---|---|---|
| 01 | **Asked** | An employee asks for help in the portal, Teams or Slack, in their own words. ServiceNow Otto (formerly Now Assist) works out what they need, answers from the knowledge base, or opens the right request. | Otto, Virtual Agent, AI Search, ITSM | Violet | Channels: portal, Teams, Slack, email and voice |
| 02 | **Routed** | AI agents and Predictive Intelligence set the category, the affected item and the assignment group. Assignment rules send it to the right team with a summary attached. | AI agents for ITSM, Predictive Intelligence, assignment rules or Advanced Work Assignment, Otto summaries | Violet | Category, CI and group set automatically |
| 03 | **Matched** | The CMDB already knows which laptop, which licence and which business service are involved, so nobody has to go looking. | CMDB, CSDM, HAM, SAM | Azure | One record per device: the IRE blocks duplicates |
| 04 | **Diagnosed** | ITOM has already grouped the alerts behind it into one. Through MCP, AI agents can pull context from the other tools you run, within the permissions you set. | Event Management, Service Mapping, MCP Client, AI Control Tower | Violet + Azure | Many alerts, correlated into one |
| 05 | **Resolved** | Fixed and closed. Otto drafts the resolution notes and a knowledge article, so the next person can help themselves, and the service reports update. | Otto for ITSM, Knowledge Management, Platform Analytics | Gold | Raleston delivery: up to 40% faster deployment, up to 60% higher user adoption **[site]** |

**Why step 02 changed.** "Skills" means two different things in ServiceNow:
- generative AI skills in Otto
- agent skills in Advanced Work Assignment

Generative skills don't route tickets. Routing is done by AI agents, Predictive Intelligence and assignment rules. Otto adds the summary.

---

## 9. Industries (3 to 4 use cases each)

Industry list **[site]**. Charles's experience covers "healthcare, retail, enterprise, and government" **[site]**. Each use case below is **[proposed: confirm with client]** unless marked otherwise.

### Financial Services
1. **Regulated change control.** Every change is risk-assessed, approved through CAB Workbench and change approval policies, and recorded, so auditors find the evidence in one place.
2. **Evidence for OSFI Guideline B-13** (technology and cyber risk). It applies to federally regulated financial institutions and has been in effect since 1 January 2024. Its domains include technology operations and resilience, which covers change, incident and technology asset management. ServiceNow records can supply evidence; the site must not claim compliance.
3. **An accurate asset and software inventory** for regulators and publisher audits (CMDB, HAM, SAM).
4. **Major incidents on customer-facing services**, with Service Mapping showing which payment or banking service is affected.

### Healthcare
1. **Clinical device tracking.** Clinical Device Management is part of Healthcare and Life Sciences Service Management. It covers device onboarding, maintenance, risk scores and moves between locations, and ServiceNow says it runs on an HL7 FHIR data model.
2. **Round-the-clock IT support for clinical staff** through the portal and chat, with self-service that works across shifts.
3. **Service maps for clinical systems**, so the servers and integrations an electronic health record depends on are known before anything changes.
4. **Lifecycle of shared workstations and devices** (HAM).

### Government & Public Sector
1. **Canadian data residency.** ServiceNow runs data centres in Canada. In December 2025 it announced CA$110 million for "Canadian-hosted, AI-ready" public sector infrastructure, a Canada Centre of Excellence and about 100 jobs. Raleston plans instance strategy around this.
2. **Accessible portals** for staff and citizens, built to WCAG.
3. **Policy-driven approvals and records**, with every decision traceable.
4. **Public Sector Digital Services** for citizen-facing services.

### Technology & Startups
1. **A clean start:**
   - out-of-the-box first
   - CSDM from day one
   - scoped apps for custom work, so growth doesn't create rework
2. **Control of SaaS spend:** SaaS License Management reclaims unused seats.
3. **Connecting the developer toolchain** (Jira, GitHub, Slack) through spokes or MCP.
4. **Build Agent and the ServiceNow SDK** for teams that build in their own tools (Cursor, Claude Code, GitHub Copilot, Windsurf).

### Manufacturing
1. **Plant asset maintenance with EAM:** work orders and maintenance schedules for non-IT equipment.
2. **Visibility of operational technology (OT).** Operational Technology Management discovers and maps OT assets into the CMDB, through Discovery for OT and OT security connectors. It also covers OT incident management and OT vulnerability response.
3. **One incident process across IT and OT** when a plant system fails.
4. **Spares and stockrooms** (HAM and EAM).

### Energy & Utilities
1. **Field service and outage response.** Field Service Management links work orders to assets, schedules crews (Crew Operations, Dynamic Scheduling) and tracks SLAs.
2. **Operational Technology Management for plants and substations.** ServiceNow names energy and utilities as primary users.
3. **Event correlation and major incident handling** for operations IT (ITOM).
4. **EAM for physical infrastructure.**

Sources: [OSFI B-13 announcement](https://www.osfi-bsif.gc.ca/en/news/osfi-releases-new-guideline-technology-cyber-risk-balancing-innovation-risk-management) · [Clinical Device Management](https://www.servicenow.com/products/clinical-device-management.html) · [ServiceNow Canada investment (8 Dec 2025)](https://newsroom.servicenow.com/press-releases/details/2025/ServiceNow-Makes-Major-Multi-Year-Investment-to-Enable-AI-Adoption-at-Scale-Across-Canadas-Public-Sector/default.aspx) · [Public Sector Digital Services](https://www.servicenow.com/products/public-sector-digital-services.html) · [OT Management](https://www.servicenow.com/products/operational-technology-management.html) · [OT data sheet](https://www.servicenow.com/standard/resource-center/data-sheet/ds-operational-technology-management.html) · [Field Service Management](https://www.servicenow.com/products/field-service-management.html) · [Field Service Crew Operations](https://www.servicenow.com/products/field-service-operations.html) · [Energy and utilities](https://www.servicenow.com/solutions/industry/energy-utilities.html) · [Industries](https://www.servicenow.com/industries.html)

---

## 10. FAQ answer notes (the old site had questions only)

1. **What does Raleston specialise in?**
   - ServiceNow architecture and delivery across ITSM, ITOM, ITAM (HAM, SAM, EAM), CMDB, SPM, Enterprise Architecture, integrations and custom applications, through four services **[site]**.
2. **How does Raleston make implementations succeed?**
   - A certified architect leads every engagement **[site]**.
   - Design comes before configuration, and out-of-the-box comes first.
   - Work is delivered in usable increments, with testing, UAT and hypercare **[proposed]**.
3. **Do you offer post-implementation support?**
   - Yes: monitoring, upgrades and performance tuning **[site]**.
4. **Which industries?**
   - The six listed industries **[site]**.
   - Charles's background covers healthcare, retail, enterprise and government **[site]**.
5. **How do we get started?**
   - A conversation with an architect, then a health check or scoping workshop **[proposed]**.
6. **Can you fix an existing CMDB?**
   - Yes; Charles is known for it **[site]**.
   - Approach: health baseline, IRE rules, CSDM alignment, ownership **[proposed]**.
7. **Do you work with Now Assist (now ServiceNow Otto)?**
   - Readiness, enablement, custom skills, governance **[proposed]**.
8. **Can you connect Claude, Copilot or our own agents to ServiceNow?**
   - Yes, through the MCP Server and AI Control Tower **[proposed]**.
9. **Do you handle upgrades?**
   - Yes: twice-yearly family releases, with regression testing and clean-up of technical debt **[site: "upgrades"; detail proposed]**.
10. **Can you help us get more from licences we already own?**
    - "We help you implement and maximize the ServiceNow subscriptions you already own" **[site]**.

---

## 11. All sources

**ServiceNow product pages**
- https://www.servicenow.com/products/itsm.html
- https://www.servicenow.com/products/it-operations-management.html
- https://www.servicenow.com/products/discovery.html
- https://www.servicenow.com/products/hardware-asset-management.html
- https://www.servicenow.com/products/software-asset-management.html
- https://www.servicenow.com/products/saas-license-management.html
- https://www.servicenow.com/products/strategic-portfolio-management.html
- https://www.servicenow.com/products/enterprise-architecture.html
- https://www.servicenow.com/products/app-engine-studio.html
- https://www.servicenow.com/products/creator-studio.html
- https://www.servicenow.com/products/integration-hub.html
- https://www.servicenow.com/products/ai-agents.html
- https://www.servicenow.com/ai/use-cases/triage-and-categorize-itsm-incidents.html
- https://www.servicenow.com/products/clinical-device-management.html
- https://www.servicenow.com/products/public-sector-digital-services.html
- https://www.servicenow.com/products/operational-technology-management.html
- https://www.servicenow.com/products/field-service-management.html
- https://www.servicenow.com/products/field-service-operations.html
- https://www.servicenow.com/solutions/industry/energy-utilities.html
- https://www.servicenow.com/industries.html

**Data sheets**
- https://www.servicenow.com/standard/resource-center/data-sheet/ds-sam-publisher-packs.html
- https://www.servicenow.com/standard/resource-center/data-sheet/ds-enterprise-asset-management.html
- https://www.servicenow.com/standard/resource-center/data-sheet/ds-operational-technology-management.html
- https://www.servicenow.com/content/dam/servicenow-assets/public/en-us/doc-type/resource-center/data-sheet/ds-itom-health.pdf

**Newsroom**
- https://newsroom.servicenow.com/press-releases/details/2026/ServiceNow-opens-its-full-system-of-action-to-every-AI-Agent-in-the-enterprise/default.aspx
- https://newsroom.servicenow.com/press-releases/details/2026/ServiceNow-Otto-creates-the-unified-AI-experience-for-the-enterprise/default.aspx
- https://newsroom.servicenow.com/press-releases/details/2026/ServiceNow-Build-Agent-now-works-inside-every-major-AI-coding-tool-governed-by-default/default.aspx
- https://newsroom.servicenow.com/press-releases/details/2025/ServiceNow-Makes-Major-Multi-Year-Investment-to-Enable-AI-Adoption-at-Scale-Across-Canadas-Public-Sector/default.aspx
- https://www.servicenow.com/company/media/press-room/ai-agents-studio.html

**Documentation and Community** (ServiceNow staff)
- https://www.servicenow.com/docs/r/yokohama/application-portfolio-management/application-portfolio-management-landing-page.html
- https://www.servicenow.com/community/servicenow-otto-articles/otto-now-assist-quick-start-guide/ta-p/2685044
- https://www.servicenow.com/community/developer-blog/servicenow-otto-has-arrived-what-s-changing-in-community-and/ba-p/3591256
- https://www.servicenow.com/community/servicenow-otto-articles/ai-skill-kit-now-assist-skill-kit-nask-faq/ta-p/3007953
- https://www.servicenow.com/community/servicenow-otto-articles/action-fabric-mcp-server-mcp-client-and-a2a-explained/ta-p/3557794
- https://www.servicenow.com/community/servicenow-otto-articles/mcp-server-console-faq/ta-p/3550125
- https://www.servicenow.com/community/now-assist-articles/enable-mcp-and-a2a-for-your-agentic-workflows-with-faqs-updated/ta-p/3373907
- https://www.servicenow.com/community/servicenow-otto-articles/reimagined-ai-agent-studio-september-2026-release/ta-p/3591309
- https://www.servicenow.com/community/servicenow-otto-for-creator/what-s-new-in-servicenow-otto-for-creator-brazil-ea-release/ta-p/3596068
- https://www.servicenow.com/community/sn-employeeworks-articles/getting-started-with-servicenow-employeeworks/ta-p/3556833
- https://www.servicenow.com/community/s/cgfwn76974/attachments/cgfwn76974/common-service-data-model-kb/744/3/CSDM%205%20w%20links.pdf
- https://www.servicenow.com/community/cmdb-forum/cmdb-health-dashboard-completeness-compliance-amp-correctness/m-p/3488492
- https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB2612771
- https://www.servicenow.com/community/workflow-data-fabric-blog/integration-hub-spokes-and-how-to-build-them/ba-p/2788254
- https://www.servicenow.com/community/upgrades-and-patching-articles/washington-dc-upgrade-workflow-studio-flow-designer-information/ta-p/2846383
- https://www.servicenow.com/community/enterprise-architecture-articles/enterprise-architecture-formerly-application-portfolio/ta-p/2382292
- https://www.servicenow.com/workflow/product-insights/itbm-is-now-strategic-portfolio-management.html
- https://www.servicenow.com/community/developer-articles/servicenow-predictive-intelligence-or-now-assist-yes/ta-p/3485149
- https://www.servicenow.com/community/agent-chat-routing-and-sidebar/advanced-work-assignment-awa-faqs/ta-p/2306792

**Other**
- https://tcpwave.com/servicenow_integration/
- https://tcpwave.com/Guides/ServiceNow%20Integration.pdf
- https://www.osfi-bsif.gc.ca/en/news/osfi-releases-new-guideline-technology-cyber-risk-balancing-innovation-risk-management
- https://anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation
- Release dates (third party): https://nowben.com/servicenow-brazil-release-key-dates-and-preview-information/ and https://craigtalbert.medium.com/the-servicenow-australia-release-availability-timeline-and-major-changes-7ab99389672a
- Old site: https://ralestonconsulting.com/ and https://ralestonconsulting.com/about-us (copies in `reference/old-site/`)
