import { MigrationInterface, QueryRunner } from 'typeorm';

type ContentSection = { key: string; type: string; content: Record<string, unknown> };

const WEBSITE_CONTENT: Array<{
  slug: string;
  title: string;
  description: string;
  sections: ContentSection[];
}> = [
  {
    slug: 'home', title: 'Commercial real estate for decisive businesses', description: 'Investment, leasing and portfolio advisory across established gateway markets.',
    sections: [
      { key: 'hero', type: 'hero', content: { kicker: 'Exceptional commercial real estate', heading: 'Spaces that shape', emphasis: 'what comes next.', body: 'A considered collection of landmark offices, retail destinations and logistics opportunities, supported by advice built around long-term value.', featuredLabel: 'Featured opportunity', featuredTitle: 'One Vanderbilt', featuredLocation: 'Midtown, New York', stats: [{ value: '12+', label: 'Prime markets' }, { value: '$2.4B', label: 'Assets represented' }, { value: '98%', label: 'Client retention' }] } },
      { key: 'manifesto', type: 'text', content: { kicker: 'A more discerning approach', heading: 'Real estate is more than an address. It is the foundation for growth, identity, and lasting value.', body: 'We combine local intelligence, rigorous analysis and a global point of view to uncover properties with enduring potential.' } },
      { key: 'film', type: 'text', content: { kicker: 'Market perspective', heading: 'See the opportunity behind the address.', body: 'Our specialists combine local market evidence with investment discipline to reveal the commercial story behind every address.', label: 'CRE Portfolio film' } },
      { key: 'featured', type: 'gallery', content: { kicker: 'Selected portfolio', heading: 'Featured opportunities', items: [{ image: 'img/02-property-office-lobby.jpg', type: 'Office', title: 'Harbour Exchange', place: 'New York', value: '$18.5M' }, { image: 'img/07-premium-retail.jpg', type: 'Mixed use', title: 'Meridian House', place: 'London', value: '$24.8M' }, { image: 'img/08-logistics-industrial.jpg', type: 'Industrial', title: 'Westbridge Logistics', place: 'Montreal', value: '$12.2M' }] } },
      { key: 'expertise', type: 'grid', content: { kicker: 'Integrated expertise', heading: 'Advice designed around the asset.', body: 'From acquisition strategy through leasing and exit, our teams align property decisions with the client’s wider commercial objectives.', items: [{ number: '01', title: 'Investment advisory' }, { number: '02', title: 'Leasing strategy' }, { number: '03', title: 'Portfolio intelligence' }] } },
    ],
  },
  {
    slug: 'about', title: 'About CRE Portfolio', description: 'Meet the advisors and principles behind CRE Portfolio.',
    sections: [
      { key: 'intro', type: 'text', content: { kicker: 'About CRE Portfolio', heading: 'Built for the places where business moves forward.', body: 'Our team combines transaction experience, local market intelligence and disciplined underwriting to help clients make confident property decisions.' } },
      { key: 'perspective', type: 'text', content: { kicker: 'Our perspective', heading: 'Insight at every stage of the property lifecycle.', paragraphs: ['We advise occupiers, owners and investors from early strategy and market testing through negotiation, delivery and long-term asset planning.', 'Every recommendation is grounded in comparable evidence, local demand, operational realities and a clear view of risk-adjusted value.'] } },
      { key: 'principles', type: 'grid', content: { kicker: 'What guides us', items: [{ number: '01', title: 'Clarity', description: 'We turn complex market evidence into direct, decision-ready advice.' }, { number: '02', title: 'Stewardship', description: 'We treat every mandate as a long-term responsibility, not a transaction.' }, { number: '03', title: 'Performance', description: 'We measure our work against durable commercial outcomes for each client.' }] } },
      { key: 'team', type: 'team', content: { kicker: 'Our team', heading: 'People who know the market from every angle.', body: 'Our advisors pair deep local knowledge with a shared standard of accountability, discretion and client care.', featureKicker: 'One integrated practice', featureHeading: 'Built around close collaboration.', featureBody: 'Investment, leasing and research specialists work as one team, giving every mandate the right mix of market access and technical depth.', members: [{ initials: 'AM', name: 'Avery Morgan', role: 'Managing Director' }, { initials: 'JL', name: 'Jordan Lee', role: 'Investment Advisory' }, { initials: 'SC', name: 'Sofia Chen', role: 'Leasing Strategy' }, { initials: 'MR', name: 'Marcus Reid', role: 'Portfolio Intelligence' }] } },
    ],
  },
  {
    slug: 'services', title: 'Services', description: 'Integrated commercial real-estate advisory services.',
    sections: [
      { key: 'intro', type: 'text', content: { kicker: 'Capabilities', heading: 'Real estate expertise, from strategy to execution.', body: 'Integrated advice for occupiers, investors and owners across acquisition, leasing, analytics, site strategy and asset management.' } },
      { key: 'services', type: 'grid', content: { items: [{ icon: 'pi-building', title: 'Property Leasing', description: 'Positioning, marketing and negotiation designed to improve occupancy and long-term income.' }, { icon: 'pi-chart-line', title: 'Investment Advisory', description: 'Acquisition and disposal advice grounded in cash-flow analysis, market evidence and risk.' }, { icon: 'pi-chart-bar', title: 'Market Analytics', description: 'Decision-ready research on supply, demand, rents, yields and occupier movement.' }, { icon: 'pi-users', title: 'Tenant Representation', description: 'Portfolio strategy and transaction management that align space with business goals.' }, { icon: 'pi-map-marker', title: 'Site Selection', description: 'Structured location analysis spanning workforce, access, cost and future growth.' }, { icon: 'pi-cog', title: 'Property Management', description: 'Active asset stewardship focused on experience, operations and performance.' }] } },
      { key: 'cta', type: 'cta', content: { kicker: 'A tailored mandate', heading: 'Bring clarity and momentum to your next property decision.', buttonLabel: 'Contact our team' } },
    ],
  },
  {
    slug: 'properties', title: 'Properties', description: 'Explore selected office, retail, industrial and mixed-use opportunities.',
    sections: [{ key: 'intro', type: 'text', content: { kicker: 'Curated opportunities', heading: 'Properties selected for lasting potential.', body: 'Explore current office, retail, industrial and mixed-use opportunities across established commercial markets.' } }],
  },
  {
    slug: 'contact', title: 'Contact', description: 'Speak with a CRE Portfolio advisor.',
    sections: [
      { key: 'intro', type: 'text', content: { kicker: 'Contact', heading: 'Let’s discuss what comes next.', body: 'Tell us about your acquisition, disposal, leasing or portfolio requirement. An advisor will respond within one business day.' } },
      { key: 'details', type: 'grid', content: { items: [{ label: 'New business', value: 'hello@creportfolio.com', link: 'mailto:hello@creportfolio.com' }, { label: 'Telephone', value: '+1 555 014 0184', link: 'tel:+15550140184' }, { label: 'Offices', value: 'New York · London · Dubai', link: '' }] } },
      { key: 'form', type: 'form', content: { heading: 'Tell us about your requirements', helper: 'Fields marked with an asterisk are required.', consent: 'By submitting, you agree to our privacy policy.' } },
    ],
  },
];

/** Seeds the fixed public page structure without overwriting later editorial changes. */
export class SeedWebsiteContent1788862000000 implements MigrationInterface {
  name = 'SeedWebsiteContent1788862000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    for (const source of WEBSITE_CONTENT) {
      let pages = await queryRunner.query('SELECT `id` FROM `pages` WHERE `slug` = ? LIMIT 1', [source.slug]) as Array<{ id: number }>;
      if (!pages.length) {
        await queryRunner.query('INSERT INTO `pages` (`slug`, `title`, `meta_title`, `meta_description`, `isActive`) VALUES (?, ?, ?, ?, 1)', [source.slug, source.title, source.title, source.description]);
        pages = await queryRunner.query('SELECT `id` FROM `pages` WHERE `slug` = ? LIMIT 1', [source.slug]) as Array<{ id: number }>;
      }
      for (let index = 0; index < source.sections.length; index++) {
        const section = source.sections[index];
        const existing = await queryRunner.query('SELECT `id` FROM `page_sections` WHERE `page_id` = ? AND `section_key` = ? LIMIT 1', [pages[0].id, section.key]) as unknown[];
        if (!existing.length) {
          await queryRunner.query('INSERT INTO `page_sections` (`page_id`, `section_key`, `section_type`, `content`, `gallery_ids`, `sort_order`, `is_active`) VALUES (?, ?, ?, ?, ?, ?, 1)', [pages[0].id, section.key, section.type, JSON.stringify(section.content), '[]', index]);
        }
      }
    }
  }

  async down(): Promise<void> {
    // Editorial content is intentionally preserved if this schema migration is reverted.
  }
}
