import type { Faq } from './services';

/** Questions buyers ask, with real answers (the old site listed the questions only). */
export const HOME_FAQS: Faq[] = [
  {
    q: 'What does Raleston specialise in?',
    a: 'ServiceNow architecture and delivery. Our certified architects work across ITSM, ITOM, IT Asset Management (hardware, software and enterprise assets), the CMDB, SPM, integrations, custom applications on App Engine and enterprise architecture, through four services: advisory and strategy, implementation, integration, and support and optimization.',
  },
  {
    q: 'How does Raleston make ServiceNow implementations succeed?',
    a: 'A certified architect leads every engagement and designs the solution before anything is configured. We stay close to out-of-the-box, deliver in short stages your people can use, and test with the people who will use it. Our clients see up to 40% faster deployment and up to 60% higher user adoption with this approach.',
  },
  {
    q: 'Do you offer support after go-live?',
    a: 'Yes. <a href="/services/support-and-optimization/">Support and optimization</a> covers proactive monitoring, the twice-yearly ServiceNow upgrades, performance tuning, technical debt clean-up and an ongoing backlog of improvements.',
  },
  {
    q: 'Which industries do you work with?',
    a: 'Financial services, healthcare, government and the public sector, technology companies and startups, manufacturing, and energy and utilities. Our founder has delivered ServiceNow work in healthcare, retail, enterprise and government.',
  },
  {
    q: 'Can you fix an existing CMDB?',
    a: 'Yes, it is what our founder is known for. We measure the CMDB’s health first, fix the causes (identification rules, import sources and ownership), then clean the data so the problems do not come back. See <a href="/services/cmdb/">CMDB</a>.',
  },
  {
    q: 'Do you work with Now Assist, now called ServiceNow Otto?',
    a: 'Yes. We check readiness first (your knowledge base and data quality), switch on and tune the Otto skills that fit your processes, build custom skills with the AI Skill Kit where needed, and set up governance with AI Control Tower.',
  },
  {
    q: 'Can you connect AI agents like Claude or Copilot to ServiceNow?',
    a: 'Yes. ServiceNow’s MCP Server lets outside AI agents run governed ServiceNow actions such as flows, catalog requests and approvals. We scope which actions each agent can take and set up AI Control Tower, so every action is identity-checked and audited.',
  },
  {
    q: 'How do we get started?',
    a: 'Tell us where your platform is today and where you want it to go. An architect will reply, usually with a short call to understand the situation, followed by a proposal for a health check or a scoped first stage. <a href="/contact/">Talk to an architect</a>.',
  },
];
