import sharp from 'sharp';

const apply = process.argv.includes('--apply');
const base = process.env.DEMO_API_BASE_URL?.replace(/\/$/, '');
const email = process.env.DEMO_ADMIN_EMAIL || 'muneeb.workstation@gmail.com';
const password = process.env.DEMO_ADMIN_PASSWORD;
const requestOrigin = process.env.DEMO_REQUEST_ORIGIN || 'https://crefolio.vercel.app';

const pages = [
  {
    slug: 'home', title: 'Portico | Commercial property showcase',
    description: 'An illustrative portfolio of commercial property opportunities.',
    sections: {
      hero: { kicker: 'Illustrative portfolio', heading: 'Spaces that shape', emphasis: 'what comes next.', body: 'Explore a sample portfolio of commercial spaces across major US markets. Properties, prices and availability are illustrative.' },
      manifesto: { kicker: 'A considered perspective', heading: 'The right property decision starts with a clear view of the opportunity.', body: 'Compare location, specification and commercial terms in one place. This showcase demonstrates the Portico experience using fictional listings.' },
      film: { kicker: 'Explore Portico', heading: 'See the story behind each space.', body: 'A visual preview of how properties and market context can be presented to clients.', label: 'Portico showcase' },
      featured: { kicker: 'Selected examples', heading: 'Featured opportunities' },
      expertise: { kicker: 'Illustrative capabilities', heading: 'Services across the property journey.', body: 'Explore sample service pages created and maintained through the content dashboard.' },
      search: { assetClasses: ['Office', 'Retail', 'Industrial', 'Mixed use'] },
    },
  },
  {
    slug: 'about', title: 'About Portico', description: 'A demonstration of Portico’s commercial property platform.',
    sections: {
      intro: { kicker: 'About Portico', heading: 'A clearer view of commercial property.', body: 'Portico is a demonstration platform for property discovery and portfolio administration. The company profile, services and listings shown here are illustrative.' },
      perspective: { kicker: 'Our approach', heading: 'Bring the details into focus.', paragraphs: ['A useful listing connects an asset’s location and specification with the terms that matter to a buyer or occupier.', 'This sample portfolio shows how a team can publish opportunities, manage enquiries and keep content current.'] },
      principles: { kicker: 'What guides the experience', items: [{ number: '01', title: 'Clarity', description: 'Make each asset easy to understand and compare.' }, { number: '02', title: 'Context', description: 'Show the location, terms and supporting documents together.' }, { number: '03', title: 'Continuity', description: 'Carry enquiries from first contact into the management workspace.' }] },
      team: { kicker: 'The workspace', heading: 'Designed for a connected property team.', body: 'The dashboard brings listings, content and enquiries into one editorial workflow.', featureKicker: 'One platform', featureHeading: 'Public presentation and private management.', featureBody: 'Maintain the information clients see while tracking the conversations it starts.', members: [] },
    },
  },
  {
    slug: 'services', title: 'Services | Portico', description: 'Illustrative commercial property service catalogue.',
    sections: { intro: { kicker: 'Sample services', heading: 'Support from first brief to final decision.', body: 'These sample service descriptions demonstrate the CMS. They do not represent a current professional engagement or service offer.' } },
  },
  {
    slug: 'properties', title: 'Properties | Portico', description: 'Fictional commercial listings for a product demonstration.',
    sections: { intro: { kicker: 'Illustrative listings', heading: 'Explore spaces with potential.', body: 'Every listing, price and availability status on this site is fictional. Map pins show approximate districts, not property addresses.' } },
  },
  {
    slug: 'contact', title: 'Contact | Portico', description: 'Try the Portico enquiry workflow.',
    sections: {
      intro: { kicker: 'Start a conversation', heading: 'Tell us what you are looking for.', body: 'This form demonstrates the enquiry workflow. Please do not submit sensitive information about a real transaction.' },
      details: { items: [{ label: 'Enquiries', value: 'Use the form on this page', link: '' }, { label: 'Portfolio', value: 'Illustrative properties only', link: '' }] },
      form: { heading: 'Send an illustrative enquiry', helper: 'Fields marked with an asterisk are required.', consent: 'Your message is stored in the demonstration workspace.' },
    },
  },
  {
    slug: 'privacy', title: 'Privacy notice | Portico', description: 'Illustrative privacy notice for a client demonstration.',
    sections: {
      intro: { updated: 'Illustrative draft · October 2026', body: 'This is sample privacy copy for a product demonstration, not an approved privacy policy. A real operator must replace it with a notice reflecting its actual data practices and applicable law.' },
      topics: { items: [{ title: 'Information in this demo', body: 'The demonstration can store account details, saved properties and messages submitted through its forms.' }, { title: 'Operational use', body: 'An authorized administrator can view this information in the dashboard to demonstrate property and enquiry workflows.' }, { title: 'Before launch', body: 'The business owner should define retention, deletion, hosting and contact practices, then publish a reviewed policy.' }] },
    },
  },
  {
    slug: 'terms', title: 'Terms of use | Portico', description: 'Illustrative terms for a client demonstration.',
    sections: {
      intro: { updated: 'Illustrative draft · October 2026', body: 'These sample terms describe a demonstration only. They are not legal terms for a live brokerage or property transaction.' },
      topics: { items: [{ title: 'Sample listings', body: 'Properties, addresses, prices and availability shown here are fictional examples and do not constitute an offer.' }, { title: 'Use of the demo', body: 'Use the site to review its interface and workflow. Confirm all commercial facts independently before any real decision.' }, { title: 'Before launch', body: 'The business owner should obtain reviewed terms that describe its actual services, responsibilities and jurisdiction.' }] },
    },
  },
  {
    slug: 'accessibility', title: 'Accessibility statement | Portico', description: 'Illustrative accessibility statement for a client demonstration.',
    sections: {
      intro: { updated: 'Illustrative draft · October 2026', body: 'Portico is a demonstration platform. This draft statement must be replaced after an accessibility review of the deployed service.' },
      topics: { items: [{ title: 'Current experience', body: 'The interface supports keyboard navigation, visible labels and responsive layouts across the main property and content flows.' }, { title: 'Feedback', body: 'Use the contact form to report a barrier encountered while reviewing the demonstration.' }, { title: 'Before launch', body: 'Complete device and assistive-technology testing, document known limitations and publish a reviewed statement.' }] },
    },
  },
];

const services = [
  ['property-leasing', 'Property Leasing', 'pi-building', 'Positioning and occupancy', 'Explore how a leasing campaign can present space, terms and occupier fit.', 'img/02-property-office-lobby.jpg'],
  ['investment-advisory', 'Investment Advisory', 'pi-chart-line', 'Assessing the opportunity', 'See how investment material can bring cash flow, risk and location into focus.', 'img/06-executive-workspace.jpg'],
  ['market-analytics', 'Market Analytics', 'pi-chart-bar', 'Evidence for decisions', 'A sample research service that organizes comparable market information.', 'img/03-about-skyline.jpg'],
  ['tenant-representation', 'Tenant Representation', 'pi-users', 'Acting for occupiers', 'Explore a sample process for comparing premises and occupancy costs.', 'img/05-contact-entrance.jpg'],
  ['site-selection', 'Site Selection', 'pi-map-marker', 'Finding the right district', 'A sample framework for comparing access, workforce and operating needs.', 'img/08-logistics-industrial.jpg'],
  ['property-management', 'Property Management', 'pi-cog', 'Operating the asset', 'A sample service page about maintenance, occupier contact and reporting.', 'img/09-mixed-use-development.jpg'],
];

const properties = [
  { title: 'Hudson Quarter Workspace · Sample', city: 'New York', location: 'Midtown West district (approximate)', propertyType: 'Office', transactionType: 'lease', price: 72, priceUnit: 'per sq ft / year', area: 12800, latitude: 40.7549, longitude: -73.9840, amenities: ['Reception', 'Flexible floor plate', 'Transit access', 'Bicycle storage'], featured: true },
  { title: 'River North Corner Retail · Sample', city: 'Chicago', location: 'River North district (approximate)', propertyType: 'Retail', transactionType: 'lease', price: 58, priceUnit: 'per sq ft / year', area: 4200, latitude: 41.8925, longitude: -87.6340, amenities: ['Corner frontage', 'Ground-floor access', 'Storage area'], featured: true },
  { title: 'Eastside Logistics Hub · Sample', city: 'Austin', location: 'East Austin district (approximate)', propertyType: 'Industrial', transactionType: 'sale', price: 4850000, priceUnit: '', area: 24500, latitude: 30.2672, longitude: -97.7431, amenities: ['Loading doors', 'Yard space', 'Office component'], featured: true },
  { title: 'Market Street Studio Floors · Sample', city: 'San Francisco', location: 'SoMa district (approximate)', propertyType: 'Office', transactionType: 'sale-lease', price: 6750000, priceUnit: '', area: 9600, latitude: 37.7749, longitude: -122.4194, amenities: ['Natural light', 'Meeting rooms', 'Flexible layout'], featured: false },
  { title: 'Bayfront Mixed Use Collection · Sample', city: 'Miami', location: 'Downtown district (approximate)', propertyType: 'Mixed use', transactionType: 'sale', price: 8200000, priceUnit: '', area: 18100, latitude: 25.7617, longitude: -80.1918, amenities: ['Retail frontage', 'Office floors', 'Parking access'], featured: false },
  { title: 'South Lake Union Office Suite · Sample', city: 'Seattle', location: 'South Lake Union district (approximate)', propertyType: 'Office', transactionType: 'lease', price: 49, priceUnit: 'per sq ft / year', area: 7800, latitude: 47.6205, longitude: -122.3493, amenities: ['Shared lobby', 'Meeting rooms', 'Transit access'], featured: false, visibility: 'draft' },
];

const sectionType = (key) => ({ hero: 'hero', team: 'team', featured: 'gallery', expertise: 'grid', principles: 'grid', details: 'grid', form: 'form' })[key] || 'text';
const xml = (value) => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]);

async function illustration(title, variant = 0) {
  const colors = [['#101d28', '#ad9570'], ['#17242d', '#8f9a91'], ['#1e2930', '#baab8e']][variant % 3];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><rect width="1600" height="1000" fill="${colors[0]}"/><path d="M0 800L400 600L880 710L1600 470V1000H0Z" fill="${colors[1]}" opacity=".16"/><rect x="210" y="180" width="530" height="650" fill="${colors[1]}" opacity=".45"/><rect x="795" y="320" width="580" height="510" fill="${colors[1]}" opacity=".24"/><g fill="${colors[0]}" opacity=".65">${Array.from({ length: 30 }, (_, index) => `<rect x="${255 + (index % 5) * 92}" y="${230 + Math.floor(index / 5) * 88}" width="52" height="52"/>`).join('')}</g><text x="95" y="925" fill="white" font-family="Arial,sans-serif" font-size="42">${xml(title)}</text><text x="98" y="970" fill="white" font-family="Arial,sans-serif" font-size="24">ILLUSTRATIVE PROPERTY VISUAL · NOT AN ACTUAL BUILDING</text></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

function brochure(title) {
  const safe = title.replace(/[^\x20-\x7E]/g, '-').replace(/[()\\]/g, '').slice(0, 70);
  const content = `BT /F1 22 Tf 50 740 Td (PORTICO SAMPLE BROCHURE) Tj 0 -45 Td /F1 15 Tf (${safe}) Tj 0 -40 Td (Illustrative listing. No real property is offered.) Tj 0 -30 Td (Location, price, area and availability are examples only.) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const [index, object] of objects.entries()) { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; }
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf);
}

if (!apply) {
  process.stdout.write(`Dry run: ${pages.length} pages, ${services.length} services, ${properties.length} properties, one enquiry, one contact message and one saved property.\nPass --apply with DEMO_API_BASE_URL and DEMO_ADMIN_PASSWORD to replace current content through the API.\n`);
  process.exit(0);
}
if (!base || !password || !/^https?:\/\//.test(base)) throw new Error('DEMO_API_BASE_URL and DEMO_ADMIN_PASSWORD are required');

const cookies = new Map();
async function request(method, path, body) {
  const headers = {};
  if (cookies.size) {
    headers.Cookie = [...cookies].map(([key, value]) => `${key}=${value}`).join('; ');
    headers.Origin = requestOrigin;
  }
  if (body !== undefined && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${base}${path}`, { method, headers, body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body) });
  for (const cookie of response.headers.getSetCookie()) {
    const [pair] = cookie.split(';');
    const separator = pair.indexOf('=');
    if (separator > 0) cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
  }
  const text = await response.text();
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status} ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : null;
}

const signedIn = await request('POST', '/user/login', { email, password });
const currentUser = await request('GET', '/user/me');
if (currentUser.role !== 'admin' || currentUser.email.toLowerCase() !== email.toLowerCase()) throw new Error('Administrator verification failed');
void signedIn;

// Deletions use the same guarded CRUD routes as the dashboard. No database table is edited directly.
// Read every management collection before the first write, so an old deployment or a missing
// permission fails without leaving a half-cleared catalogue.
const collections = {
  notifications: '/notification',
  favorites: '/favorites',
  leads: '/leads',
  contacts: '/contact',
  properties: '/properties/admin?limit=48',
  pages: '/pages',
  services: '/services/admin',
  media: '/media',
};
const current = {};
const preflightErrors = [];
for (const [name, path] of Object.entries(collections)) {
  try {
    current[name] = await request('GET', path);
    process.stdout.write(`Preflight ${path}: OK\n`);
  } catch (error) {
    preflightErrors.push(error.message);
  }
}
if (preflightErrors.length) throw new Error(`Preflight failed before changes:\n${preflightErrors.join('\n')}`);
for (const notification of current.notifications) await request('DELETE', `/notification/${notification.id}`);
for (const favorite of current.favorites) await request('POST', `/favorites/${favorite.property.id}`);
for (const lead of current.leads) await request('DELETE', `/leads/${lead.id}`);
for (const message of current.contacts) await request('DELETE', `/contact/${message.id}`);
for (;;) {
  const batch = await request('GET', '/properties/admin?limit=48');
  if (!batch.data.length) break;
  for (const property of batch.data) await request('DELETE', `/properties/${property.id}`);
}
for (const page of current.pages) await request('DELETE', `/pages/${page.slug}`);
for (const service of current.services) await request('DELETE', `/services/${service.id}`);
for (const media of current.media) await request('DELETE', `/media/${media.id}`);

for (const page of pages) {
  const created = await request('POST', '/pages', { slug: page.slug, title: page.title, metaTitle: page.title, metaDescription: page.description, isActive: true });
  let sortOrder = 0;
  for (const [sectionKey, content] of Object.entries(page.sections)) {
    await request('POST', '/sections', { pageId: created.id, sectionKey, sectionType: sectionType(sectionKey), content, galleryIds: [], sortOrder: sortOrder++, isActive: true });
  }
}

for (const [index, [slug, title, icon, kicker, summary]] of services.entries()) {
  const form = new FormData();
  form.append('file', new Blob([await illustration(title, index)], { type: 'image/png' }), `${slug}.png`);
  const media = await request('POST', '/media/upload', form);
  await request('POST', '/services', {
    slug, title, icon, kicker, summary,
    image: `${new URL(base).origin}${media.url}`,
    body: [`${summary} This page is an original, illustrative example of a commercial property service.`, 'The steps below show how a client brief can be organized. No specific transaction or professional outcome is represented.'],
    outcomes: ['A documented requirement', 'A clear comparison of options', 'A record of the recommended next steps'],
    process: [{ title: 'Brief', detail: 'Define the commercial objective and constraints.' }, { title: 'Review', detail: 'Compare relevant options and supporting information.' }, { title: 'Decision', detail: 'Record the recommended action and the assumptions behind it.' }],
    faqs: [{ question: 'Is this an active service offer?', answer: 'No. This is illustrative content for a Portico client demonstration.' }],
    isActive: true, featured: index < 3, sortOrder: index,
  });
}

const createdProperties = [];
for (const [index, property] of properties.entries()) {
  const form = new FormData();
  const record = {
    ...property,
    description: `${property.title} is a fictional commercial property example set in the ${property.location}. The indicative ${property.area.toLocaleString('en-US')} sq ft area, pricing and specification demonstrate how a real listing would be presented. The map pin marks an approximate district centre rather than a property address. No actual asset is advertised.`,
    bedrooms: 0, bathrooms: 0, status: 'available', visibility: property.visibility || 'published',
  };
  for (const [key, value] of Object.entries(record)) form.append(key, key === 'amenities' ? JSON.stringify(value) : String(value));
  for (let view = 0; view < 3; view++) form.append('images', new Blob([await illustration(property.title, index + view)], { type: 'image/png' }), `sample-${index + 1}-${view + 1}.png`);
  if (index < 2) form.append('documents', new Blob([brochure(property.title)], { type: 'application/pdf' }), `sample-brochure-${index + 1}.pdf`);
  createdProperties.push(await request('POST', '/properties', form));
}

await request('POST', `/favorites/${createdProperties[0].id}`);
await request('POST', '/leads', { name: 'Sample visitor', email: 'visitor@example.test', message: 'Illustrative enquiry: please show how this property is handled in the dashboard.', property: createdProperties[0].id });
await request('POST', '/contact', { name: 'Sample prospect', email: 'prospect@example.test', company: 'Example Organisation', message: 'Illustrative contact message for the Portico demonstration workspace.' });

const publicProperties = await request('GET', '/properties');
const publicServices = await request('GET', '/services');
const home = await request('GET', '/pages/home');
if (publicProperties.total !== properties.length - 1 || publicServices.length !== services.length || home.sections.hero.kicker !== 'Illustrative portfolio') {
  throw new Error('API verification failed after import');
}
process.stdout.write(`Imported ${publicProperties.total} published properties, ${publicServices.length} services and ${pages.length} pages. One draft property is available in the admin dashboard.\n`);
