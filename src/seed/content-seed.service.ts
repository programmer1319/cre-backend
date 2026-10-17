import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from '../pages/entities/page.entity';
import { Section } from '../sections/entities/section.entity';

const CONTENT = [
  { slug: 'home', title: 'Commercial real estate for decisive businesses', metaDescription: 'Investment, leasing and portfolio advisory across established gateway markets.', sections: [{ key: 'hero', type: 'hero', content: { kicker: 'Exceptional commercial real estate', heading: 'Spaces that shape what comes next.', body: 'A considered collection of landmark offices, retail destinations and logistics opportunities, supported by advice built around long-term value.' } }, { key: 'expertise', type: 'grid', content: { heading: 'Advice designed around the asset.', items: ['Investment advisory', 'Leasing strategy', 'Portfolio intelligence'] } }] },
  { slug: 'about', title: 'About Portico', metaDescription: 'Meet the advisors and principles behind Portico.', sections: [{ key: 'intro', type: 'text', content: { heading: 'Built for the places where business moves forward.', body: 'Our team combines transaction experience, local market intelligence and disciplined underwriting to help clients make confident property decisions.' } }, { key: 'team', type: 'team', content: { heading: 'People who know the market from every angle.', members: [{ name: 'Avery Morgan', role: 'Managing Director' }, { name: 'Jordan Lee', role: 'Investment Advisory' }, { name: 'Sofia Chen', role: 'Leasing Strategy' }, { name: 'Marcus Reid', role: 'Portfolio Intelligence' }] } }] },
  { slug: 'services', title: 'Services', metaDescription: 'Integrated commercial real-estate advisory services.', sections: [{ key: 'services', type: 'grid', content: { heading: 'Real estate expertise, from strategy to execution.', items: ['Property leasing', 'Investment advisory', 'Market analytics', 'Tenant representation', 'Site selection', 'Property management'] } }] },
  { slug: 'properties', title: 'Properties', metaDescription: 'Explore selected office, retail, industrial and mixed-use opportunities.', sections: [{ key: 'intro', type: 'text', content: { heading: 'Current opportunities', body: 'Explore a carefully selected portfolio of income-producing and strategic commercial assets across leading markets.' } }] },
  { slug: 'contact', title: 'Contact', metaDescription: 'Speak with a Portico advisor.', sections: [{ key: 'intro', type: 'text', content: { heading: 'Let’s discuss what comes next.', body: 'Tell us about your acquisition, disposal, leasing or portfolio requirement. An advisor will respond within one business day.' } }] },
];

@Injectable()
export class ContentSeedService implements OnApplicationBootstrap {
  constructor(@InjectRepository(Page) private readonly pages: Repository<Page>, @InjectRepository(Section) private readonly sections: Repository<Section>) {}
  async onApplicationBootstrap() {
    if (process.env.SEED_CONTENT !== 'true') return;
    for (const source of CONTENT) {
      let page = await this.pages.findOne({ where: { slug: source.slug } });
      page = await this.pages.save(this.pages.create({ ...(page ?? {}), slug: source.slug, title: source.title, metaTitle: source.title, metaDescription: source.metaDescription, isActive: true }));
      await this.sections.delete({ pageId: page.id });
      await this.sections.save(source.sections.map((section, index) => this.sections.create({ pageId: page!.id, sectionKey: section.key, sectionType: section.type, content: section.content, galleryIds: [], sortOrder: index, isActive: true })));
    }
  }
}
