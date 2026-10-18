import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Page } from '../pages/entities/page.entity';
import { Section } from '../sections/entities/section.entity';
import { SiteService } from '../services/service.entity';
import { DEFAULT_SERVICES } from '../services/default-services';
import { Property } from '../properties/property.entity';
import { User } from '../users/user.entity';
import { Lead } from '../leads/leads.entity';
import { Favorite } from '../favourites/favourites.entity';
import { Notification } from '../notification/notification.entity';
import { ContactMessage } from '../contact/contact-message.entity';
import { Media } from '../media/entities/media.entity';

const ADMIN_EMAIL = 'muneeb.workstation@gmail.com';

const pages = [
  {
    slug: 'home', title: 'Portico | Commercial property demo',
    description: 'Explore an illustrative commercial real estate portfolio.',
    sections: {
      hero: { kicker: 'Portico demonstration', heading: 'Spaces that shape', emphasis: 'what comes next.', body: 'Explore illustrative commercial properties and see how Portico presents opportunities to investors and occupiers. Listings and prices in this demo are fictional.' },
      manifesto: { kicker: 'A clearer view', heading: 'Explore the property journey from discovery to enquiry.', body: 'Search, compare and save illustrative properties, then see how the management workspace handles content and enquiries.' },
      film: { kicker: 'Platform preview', heading: 'See the experience behind the address.', body: 'A visual introduction to the Portico demonstration website.', label: 'Portico preview' },
      featured: { kicker: 'Demo portfolio', heading: 'Illustrative opportunities' },
      expertise: { kicker: 'Service catalogue', heading: 'Explore the advisory workflow.', body: 'These sample service pages demonstrate how an administrator can publish and feature offerings.' },
    },
  },
  {
    slug: 'about', title: 'About the Portico demo', description: 'How the Portico demonstration works.',
    sections: {
      intro: { kicker: 'About this demonstration', heading: 'A complete commercial property experience.', body: 'Portico is a demonstration platform for commercial property discovery and administration. The people, properties and business claims shown here are illustrative.' },
      perspective: { kicker: 'The approach', heading: 'A clear path from search to decision.', paragraphs: ['Visitors can compare locations, asset classes and prices, then submit an enquiry about a property.', 'Administrators can maintain listings, services and page content from the dashboard.'] },
      principles: { kicker: 'What the demo shows', items: [{ number: '01', title: 'Discover', description: 'Browse and filter an illustrative property catalogue.' }, { number: '02', title: 'Compare', description: 'Review property detail, maps and saved opportunities.' }, { number: '03', title: 'Manage', description: 'Edit public content and respond to enquiries in one workspace.' }] },
      team: { kicker: 'Demo workspace', heading: 'Built for a real editorial workflow.', body: 'The administration screens show how a small property team can manage content and leads.', featureKicker: 'One platform', featureHeading: 'Public website and dashboard together.', featureBody: 'A connected experience for visitors and administrators.', members: [] },
    },
  },
  {
    slug: 'services', title: 'Services | Portico demo', description: 'Illustrative service catalogue.',
    sections: { intro: { kicker: 'Demo services', heading: 'Explore sample commercial property services.', body: 'These service descriptions illustrate the content management workflow. They are not a claim that Portico currently provides regulated or professional advice.' } },
  },
  {
    slug: 'properties', title: 'Properties | Portico demo', description: 'Illustrative commercial property listings.',
    sections: { intro: { kicker: 'Demo listings', heading: 'Explore illustrative opportunities.', body: 'All properties, asking prices and availability shown here are fictional demonstration records. Locations on the map are approximate city centres.' } },
  },
  {
    slug: 'contact', title: 'Contact | Portico demo', description: 'Try the Portico contact workflow.',
    sections: {
      intro: { kicker: 'Contact demo', heading: 'Try the enquiry workflow.', body: 'Use this form to demonstrate how a visitor can contact the administrator. Please avoid submitting sensitive information during a demo.' },
      details: { items: [{ label: 'Demo enquiries', value: 'Use the form on this page', link: '' }, { label: 'Availability', value: 'This is an illustrative portfolio', link: '' }] },
      form: { heading: 'Send a demo enquiry', helper: 'Fields marked with an asterisk are required.', consent: 'Your message will be stored in the demonstration workspace.' },
    },
  },
] as const;

const properties = [
  ['Demo office · Midtown Manhattan', 'New York', 'Midtown Manhattan (approximate)', 'Office', 4250000, 7800, 40.754932, -73.984016],
  ['Demo retail · Downtown Chicago', 'Chicago', 'The Loop (approximate)', 'Retail', 1850000, 4200, 41.881832, -87.627760],
  ['Demo industrial · Los Angeles', 'Los Angeles', 'Central Los Angeles (approximate)', 'Industrial', 6900000, 18500, 34.052235, -118.243683],
  ['Demo mixed use · San Francisco', 'San Francisco', 'Downtown (approximate)', 'Mixed use', 7900000, 9200, 37.774929, -122.419416],
  ['Demo office · Boston', 'Boston', 'Financial District (approximate)', 'Office', 3350000, 6100, 42.360082, -71.058880],
  ['Demo retail · Miami', 'Miami', 'Downtown (approximate)', 'Retail', 2650000, 5100, 25.761680, -80.191790],
] as const;

const sampleImages = [
  'img/02-property-office-lobby.jpg',
  'img/07-premium-retail.jpg',
  'img/08-logistics-industrial.jpg',
  'img/09-mixed-use-development.jpg',
  'img/06-executive-workspace.jpg',
  'img/04-services-facade.jpg',
] as const;

/** Explicit one-shot reset for a client demo. Never runs during ordinary startup. */
@Injectable()
export class DemoSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DemoSeedService.name);
  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.RESET_DEMO_DATA !== 'true') return;
    const completed = await this.dataSource.query('SELECT `id` FROM `demo_seed_runs` WHERE `id` = 1 LIMIT 1') as unknown[];
    if (completed.length) return;
    await this.dataSource.transaction(async (manager) => {
      const admin = await manager.getRepository(User).findOne({ where: { email: ADMIN_EMAIL } });
      if (!admin || admin.role !== 'admin') throw new Error('Demo reset requires the sole administrator account');

      // Clearing the dependent records first preserves foreign-key integrity.
      await manager.getRepository(Notification).createQueryBuilder().delete().execute();
      await manager.getRepository(Favorite).createQueryBuilder().delete().execute();
      await manager.getRepository(Lead).createQueryBuilder().delete().execute();
      await manager.getRepository(ContactMessage).createQueryBuilder().delete().execute();
      await manager.getRepository(Property).createQueryBuilder().delete().execute();
      await manager.getRepository(Section).createQueryBuilder().delete().execute();
      await manager.getRepository(Media).createQueryBuilder().delete().execute();
      await manager.getRepository(Page).createQueryBuilder().delete().execute();
      await manager.getRepository(SiteService).createQueryBuilder().delete().execute();

      for (const source of pages) {
        const page = await manager.getRepository(Page).save(manager.getRepository(Page).create({
          slug: source.slug, title: source.title, metaTitle: source.title,
          metaDescription: source.description, isActive: true,
        }));
        let index = 0;
        for (const [key, content] of Object.entries(source.sections)) {
          await manager.getRepository(Section).save(manager.getRepository(Section).create({
            pageId: page.id, sectionKey: key, sectionType: key, content,
            galleryIds: [], sortOrder: index++, isActive: true,
          }));
        }
      }

      for (const [index, source] of DEFAULT_SERVICES.entries()) {
        await manager.getRepository(SiteService).save(manager.getRepository(SiteService).create({
          ...source,
          kicker: 'Illustrative service',
          body: [`This sample ${source.title.toLowerCase()} page demonstrates how an administrator can publish detailed service information.`, 'The content is illustrative and does not describe a current client engagement or a professional service offer.'],
          outcomes: ['Demonstrate a clear service overview', 'Show an editable process and frequently asked questions'],
          process: [{ title: 'Discuss', detail: 'Capture the client requirement in the demonstration workflow.' }, { title: 'Review', detail: 'Show how the service page can explain next steps.' }],
          faqs: [{ question: 'Is this a live service offer?', answer: 'No. This is illustrative content for a Portico demonstration.' }],
          featured: index < 6,
        }));
      }

      const sampleProperties: Property[] = [];
      const frontendOrigin = (process.env.FRONTEND_URL ?? 'https://crefolio.vercel.app').replace(/\/$/, '');
      for (const [index, [title, city, location, propertyType, price, area, latitude, longitude]] of properties.entries()) {
        const saved = await manager.getRepository(Property).save(manager.getRepository(Property).create({
          title, city, location, propertyType, price, area, latitude, longitude,
          bedrooms: 0, bathrooms: 0, images: [`${frontendOrigin}/${sampleImages[index]}`], owner: admin,
          description: 'Illustrative demonstration listing. This property, its asking price and availability are fictional. The map pin marks an approximate city centre and is not a property address.',
        }));
        sampleProperties.push(saved);
      }
      await manager.getRepository(Lead).save(manager.getRepository(Lead).create({
        name: 'Sample visitor', email: 'visitor@example.test', property: sampleProperties[0],
        message: 'Demo enquiry: please show how an administrator can follow up on this illustrative office listing.',
        status: 'new',
      }));
      await manager.getRepository(ContactMessage).save(manager.getRepository(ContactMessage).create({
        name: 'Sample prospect', email: 'prospect@example.test', company: 'Example Organisation',
        message: 'Demo contact message: I would like to see the property search and content management workflow.',
        status: 'new',
      }));
      await manager.getRepository(Favorite).save(manager.getRepository(Favorite).create({ user: admin, property: sampleProperties[1] }));
      await manager.getRepository(Notification).save(manager.getRepository(Notification).create({
        user: admin, userId: admin.id, property: sampleProperties[0], propertyId: sampleProperties[0].id,
        type: 'lead', message: 'Demo: a sample visitor enquired about an illustrative listing.', read: false,
      }));
      await manager.query('INSERT INTO `demo_seed_runs` (`id`) VALUES (1)');
    });
    this.logger.warn('Demo data reset completed. Set RESET_DEMO_DATA=false before the next restart.');
  }
}
