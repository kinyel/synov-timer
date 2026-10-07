/**
 * "What do you need?" options on the contact form. `slugs` are the
 * ?topic= values that preselect an option (service pages pass their slug).
 */
export interface Topic {
  label: string;
  slugs: string[];
}

export const TOPICS: { group: string; items: Topic[] }[] = [
  {
    group: 'The platform',
    items: [
      { label: 'IT Service Management (ITSM)', slugs: ['itsm'] },
      { label: 'IT Operations Management (ITOM)', slugs: ['itom'] },
      { label: 'IT Asset Management (ITAM)', slugs: ['itam'] },
      { label: 'CMDB and data quality', slugs: ['cmdb'] },
      { label: 'Strategic Portfolio Management (SPM)', slugs: ['spm'] },
      { label: 'Integrations', slugs: ['integrations', 'integration-delivery'] },
      { label: 'App Engine and custom applications', slugs: ['app-engine'] },
      { label: 'Enterprise Architecture', slugs: ['enterprise-architecture'] },
      { label: 'AI: ServiceNow Otto and AI agents', slugs: ['ai'] },
      { label: 'TCPWave integration', slugs: ['tcpwave'] },
    ],
  },
  {
    group: 'Ways to work with us',
    items: [
      { label: 'Advisory, strategy or a health check', slugs: ['advisory-and-strategy', 'health-check'] },
      { label: 'A new implementation', slugs: ['implementation'] },
      { label: 'Support and optimization', slugs: ['support-and-optimization'] },
    ],
  },
  {
    group: 'Something else',
    items: [
      { label: 'References and case studies', slugs: ['references'] },
      { label: 'Careers', slugs: ['careers'] },
      { label: 'Something else', slugs: ['other'] },
    ],
  },
];
