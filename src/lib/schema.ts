import type { Faq } from '../data/services';

/** FAQPage JSON-LD. Answers are stripped of markup. */
export const faqSchema = (items: Faq[]) => ({
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') },
  })),
});
