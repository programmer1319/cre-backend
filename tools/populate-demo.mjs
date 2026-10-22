import 'dotenv/config';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import mysql from 'mysql2/promise';
import jsonwebtoken from 'jsonwebtoken';

const apply = process.argv.includes('--apply');
const base = (process.env.DEMO_API_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '');
const email = process.env.DEMO_ADMIN_EMAIL || 'muneeb.workstation@gmail.com';
const requestOrigin = process.env.DEMO_REQUEST_ORIGIN || 'http://localhost:4200';
const imageRoot = resolve(process.env.DEMO_IMAGE_ROOT || '../cre-frontend/public/img');
const demoMarker = '[CreFolio fictional demonstration]';

const target = new URL(base);
if (!['localhost', '127.0.0.1', '::1'].includes(target.hostname)) {
  throw new Error('The demo importer is local-only and refuses non-local API hosts');
}

const pages = [
  {
    slug: 'home', title: 'CreFolio | Commercial property showcase',
    description: 'An illustrative portfolio of commercial property opportunities.',
    sections: {
      hero: { kicker: 'Illustrative portfolio', heading: 'Spaces that shape', emphasis: 'what comes next.', body: 'Explore a sample portfolio of commercial spaces across major US markets. Properties, prices and availability are illustrative.' },
      manifesto: { kicker: 'A considered perspective', heading: 'The right property decision starts with a clear view of the opportunity.', body: 'Compare location, specification and commercial terms in one place. This showcase demonstrates the CreFolio experience using fictional listings.' },
      film: { kicker: 'Explore CreFolio', heading: 'See the story behind each space.', body: 'A visual preview of how properties and market context can be presented to clients.', label: 'CreFolio showcase' },
      featured: { kicker: 'Selected examples', heading: 'Featured opportunities' },
      expertise: { kicker: 'Illustrative capabilities', heading: 'Services across the property journey.', body: 'Explore sample service pages created and maintained through the content dashboard.' },
      search: { assetClasses: ['Office', 'Retail', 'Industrial', 'Mixed use'] },
    },
  },
  {
    slug: 'about', title: 'About CreFolio', description: 'A demonstration of CreFolio’s commercial property platform.',
    sections: {
      intro: { kicker: 'About CreFolio', heading: 'A clearer view of commercial property.', body: 'CreFolio is a demonstration platform for property discovery and portfolio administration. The company profile, services and listings shown here are illustrative.' },
      perspective: { kicker: 'Our approach', heading: 'Bring the details into focus.', paragraphs: ['A useful listing connects an asset’s location and specification with the terms that matter to a buyer or occupier.', 'This sample portfolio shows how a team can publish opportunities, manage enquiries and keep content current.'] },
      principles: { kicker: 'What guides the experience', items: [{ number: '01', title: 'Clarity', description: 'Make each asset easy to understand and compare.' }, { number: '02', title: 'Context', description: 'Show the location, terms and supporting documents together.' }, { number: '03', title: 'Continuity', description: 'Carry enquiries from first contact into the management workspace.' }] },
      team: { kicker: 'The workspace', heading: 'Designed for a connected property team.', body: 'The dashboard brings listings, content and enquiries into one editorial workflow.', featureKicker: 'One platform', featureHeading: 'Public presentation and private management.', featureBody: 'Maintain the information clients see while tracking the conversations it starts.', members: [] },
    },
  },
  {
    slug: 'services', title: 'Services | CreFolio', description: 'Illustrative commercial property service catalogue.',
    sections: { intro: { kicker: 'Sample services', heading: 'Support from first brief to final decision.', body: 'These sample service descriptions demonstrate the CMS. They do not represent a current professional engagement or service offer.' } },
  },
  {
    slug: 'properties', title: 'Properties | CreFolio', description: 'Fictional commercial listings for a product demonstration.',
    sections: { intro: { kicker: 'Illustrative listings', heading: 'Explore spaces with potential.', body: 'Every listing, price and availability status on this site is fictional. Map pins show approximate districts, not property addresses.' } },
  },
  {
    slug: 'contact', title: 'Contact | CreFolio', description: 'Try the CreFolio enquiry workflow.',
    sections: {
      intro: { kicker: 'Start a conversation', heading: 'Tell us what you are looking for.', body: 'This form demonstrates the enquiry workflow. Please do not submit sensitive information about a real transaction.' },
      details: { items: [{ label: 'Enquiries', value: 'Use the form on this page', link: '' }, { label: 'Portfolio', value: 'Illustrative properties only', link: '' }] },
      form: { heading: 'Send an illustrative enquiry', helper: 'Fields marked with an asterisk are required.', consent: 'Your message is stored in the demonstration workspace.' },
    },
  },
  {
    slug: 'privacy', title: 'Privacy notice | CreFolio', description: 'Illustrative privacy notice for a client demonstration.',
    sections: {
      intro: { updated: 'Illustrative draft · October 2026', body: 'This is sample privacy copy for a product demonstration, not an approved privacy policy. A real operator must replace it with a notice reflecting its actual data practices and applicable law.' },
      topics: { items: [{ title: 'Information in this demo', body: 'The demonstration can store account details, saved properties and messages submitted through its forms.' }, { title: 'Operational use', body: 'An authorized administrator can view this information in the dashboard to demonstrate property and enquiry workflows.' }, { title: 'Before launch', body: 'The business owner should define retention, deletion, hosting and contact practices, then publish a reviewed policy.' }] },
    },
  },
  {
    slug: 'terms', title: 'Terms of use | CreFolio', description: 'Illustrative terms for a client demonstration.',
    sections: {
      intro: { updated: 'Illustrative draft · October 2026', body: 'These sample terms describe a demonstration only. They are not legal terms for a live brokerage or property transaction.' },
      topics: { items: [{ title: 'Sample listings', body: 'Properties, addresses, prices and availability shown here are fictional examples and do not constitute an offer.' }, { title: 'Use of the demo', body: 'Use the site to review its interface and workflow. Confirm all commercial facts independently before any real decision.' }, { title: 'Before launch', body: 'The business owner should obtain reviewed terms that describe its actual services, responsibilities and jurisdiction.' }] },
    },
  },
  {
    slug: 'accessibility', title: 'Accessibility statement | CreFolio', description: 'Illustrative accessibility statement for a client demonstration.',
    sections: {
      intro: { updated: 'Illustrative draft · October 2026', body: 'CreFolio is a demonstration platform. This draft statement must be replaced after an accessibility review of the deployed service.' },
      topics: { items: [{ title: 'Current experience', body: 'The interface supports keyboard navigation, visible labels and responsive layouts across the main property and content flows.' }, { title: 'Feedback', body: 'Use the contact form to report a barrier encountered while reviewing the demonstration.' }, { title: 'Before launch', body: 'Complete device and assistive-technology testing, document known limitations and publish a reviewed statement.' }] },
    },
  },
];

const services = [
  ['property-leasing', 'Property Leasing', 'pi-building', 'Positioning and occupancy', 'Explore how a leasing campaign can present space, terms and occupier fit.', 'img/02-property-office-lobby.webp'],
  ['investment-advisory', 'Investment Advisory', 'pi-chart-line', 'Assessing the opportunity', 'See how investment material can bring cash flow, risk and location into focus.', 'img/06-executive-workspace.webp'],
  ['market-analytics', 'Market Analytics', 'pi-chart-bar', 'Evidence for decisions', 'A sample research service that organizes comparable market information.', 'img/03-about-skyline.webp'],
  ['tenant-representation', 'Tenant Representation', 'pi-users', 'Acting for occupiers', 'Explore a sample process for comparing premises and occupancy costs.', 'img/05-contact-entrance.webp'],
  ['site-selection', 'Site Selection', 'pi-map-marker', 'Finding the right district', 'A sample framework for comparing access, workforce and operating needs.', 'img/08-logistics-industrial.webp'],
  ['property-management', 'Property Management', 'pi-cog', 'Operating the asset', 'A sample service page about maintenance, occupier contact and reporting.', 'img/09-mixed-use-development.webp'],
];

const properties = [
  { title: 'Hudson Quarter Workspace · Fictional', city: 'New York', location: 'Midtown West district (approximate)', propertyType: 'Office', transactionType: 'lease', status: 'available', visibility: 'published', price: 72, priceUnit: 'per sq ft / year', area: 12800, bedrooms: 14, bathrooms: 4, floor: '12–14', workstations: 118, parkingSpaces: 0, latitude: 40.7549, longitude: -73.9840, amenities: ['Staffed reception', 'Flexible floor plates', 'Conference suite', 'Bicycle storage', 'Showers'], featured: true, imageFiles: ['02-property-office-lobby.webp', '06-executive-workspace.webp', '10-rooftop-terrace.webp'] },
  { title: 'River North Corner Retail · Fictional', city: 'Chicago', location: 'River North district (approximate)', propertyType: 'Retail', transactionType: 'lease', status: 'available', visibility: 'published', price: 58, priceUnit: 'per sq ft / year', area: 4200, bedrooms: 3, bathrooms: 2, floor: 'Ground and lower ground', workstations: 0, parkingSpaces: 2, latitude: 41.8925, longitude: -87.6340, amenities: ['Dual-aspect frontage', 'Dedicated loading', 'Stock room', 'Outdoor signage zone'], featured: true, imageFiles: ['07-premium-retail.webp', '05-contact-entrance.webp', '04-services-facade.webp'] },
  { title: 'Eastside Logistics Hub · Fictional', city: 'Austin', location: 'East Austin district (approximate)', propertyType: 'Industrial', transactionType: 'sale', status: 'under-offer', visibility: 'published', price: 4850000, priceUnit: '', area: 24500, bedrooms: 2, bathrooms: 3, floor: 'Ground with mezzanine', workstations: 24, parkingSpaces: 34, latitude: 30.2672, longitude: -97.7431, amenities: ['Eight loading doors', 'Secure yard', 'Clear-span warehouse', 'Office mezzanine', 'EV charging'], featured: true, imageFiles: ['08-logistics-industrial.webp', 'warehouse.webp', '09-mixed-use-development.webp'] },
  { title: 'Market Street Studio Floors · Fictional', city: 'San Francisco', location: 'SoMa district (approximate)', propertyType: 'Office', transactionType: 'sale-lease', status: 'available', visibility: 'published', price: 6750000, priceUnit: '', area: 9600, bedrooms: 10, bathrooms: 4, floor: '5–6', workstations: 86, parkingSpaces: 6, latitude: 37.7749, longitude: -122.4194, amenities: ['Natural light', 'Boardroom', 'Flexible layout', 'Private terraces'], featured: false, imageFiles: ['highrise.webp', 'glass-building.webp', '06-executive-workspace.webp'] },
  { title: 'Bayfront Mixed Use Collection · Fictional', city: 'Miami', location: 'Downtown district (approximate)', propertyType: 'Mixed use', transactionType: 'sale', status: 'available', visibility: 'published', price: 8200000, priceUnit: '', area: 18100, bedrooms: 18, bathrooms: 7, floor: 'Ground–8', workstations: 72, parkingSpaces: 42, latitude: 25.7617, longitude: -80.1918, amenities: ['Retail frontage', 'Office floors', 'Rooftop terrace', 'Structured parking'], featured: true, imageFiles: ['09-mixed-use-development.webp', '10-rooftop-terrace.webp', '01-home-hero.webp'] },
  { title: 'South Lake Union Office Suite · Fictional', city: 'Seattle', location: 'South Lake Union district (approximate)', propertyType: 'Office', transactionType: 'lease', status: 'leased', visibility: 'published', price: 49, priceUnit: 'per sq ft / year', area: 7800, bedrooms: 8, bathrooms: 3, floor: '7', workstations: 64, parkingSpaces: 8, latitude: 47.6205, longitude: -122.3493, amenities: ['Shared lobby', 'Meeting rooms', 'Transit access', 'Wellness room'], featured: false, imageFiles: ['03-about-skyline.webp', '02-property-office-lobby.webp', '06-executive-workspace.webp'] },
  { title: 'Arts District Creative Warehouse · Fictional', city: 'Los Angeles', location: 'Arts District (approximate)', propertyType: 'Warehouse', transactionType: 'lease', status: 'available', visibility: 'published', price: 36, priceUnit: 'per sq ft / year', area: 15200, bedrooms: 4, bathrooms: 3, floor: 'Ground', workstations: 38, parkingSpaces: 18, latitude: 34.0407, longitude: -118.2327, amenities: ['Sawtooth roof', 'Grade-level loading', 'Creative offices', 'Secure parking'], featured: false, imageFiles: ['warehouse.webp', '08-logistics-industrial.webp', '04-services-facade.webp'] },
  { title: 'Back Bay Advisory Suite · Fictional draft', city: 'Boston', location: 'Back Bay district (approximate)', propertyType: 'Office', transactionType: 'lease', status: 'withdrawn', visibility: 'draft', price: 64, priceUnit: 'per sq ft / year', area: 6100, bedrooms: 7, bathrooms: 2, floor: '9', workstations: 48, parkingSpaces: 4, latitude: 42.3503, longitude: -71.0810, amenities: ['Client suite', 'Private offices', 'Kitchen', 'Transit access'], featured: false, imageFiles: ['06-executive-workspace.webp', '02-property-office-lobby.webp'] },
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
  const content = `BT /F1 22 Tf 50 740 Td (CREFOLIO SAMPLE BROCHURE) Tj 0 -45 Td /F1 15 Tf (${safe}) Tj 0 -40 Td (Illustrative listing. No real property is offered.) Tj 0 -30 Td (Location, price, area and availability are examples only.) Tj ET`;
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
  process.stdout.write(`Dry run: up to ${pages.length} pages, ${services.length} services and ${properties.length} properties will be added through the local CRUD API. Existing records are preserved.\nPass --apply while the local API is running.\n`);
  process.exit(0);
}
if (!base || !/^https?:\/\//.test(base)) throw new Error('A valid local DEMO_API_BASE_URL is required');

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

// Local import authentication is minted from the local database and JWT secret. No administrator
// password is read, changed or printed; catalogue writes still pass through the guarded HTTP API.
const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'crefolio',
});
const [administrators] = await connection.execute(
  'SELECT id, email, role, token_version AS tokenVersion FROM `user` WHERE LOWER(email) = LOWER(?) LIMIT 1',
  [email],
);
await connection.end();
const administrator = administrators[0];
const secret = process.env.JWT_SECRET;
if (!administrator || administrator.role !== 'admin') throw new Error('Local administrator was not found');
if (!secret || secret.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
cookies.set('accessToken', jsonwebtoken.sign({
  sub: administrator.id,
  email: administrator.email,
  role: administrator.role,
  ver: administrator.tokenVersion ?? 0,
}, secret, { expiresIn: '15m' }));

const currentUser = await request('GET', '/user/me');
if (currentUser.role !== 'admin' || currentUser.email.toLowerCase() !== email.toLowerCase()) throw new Error('Administrator verification failed');

const current = {
  pages: await request('GET', '/pages'),
  services: await request('GET', '/services/admin'),
  properties: (await request('GET', '/properties/admin?limit=48')).data,
};
const added = { pages: 0, services: 0, properties: 0, servicesUpdated: 0, propertiesReplaced: 0 };

for (const page of pages) {
  if (current.pages.some((item) => item.slug === page.slug)) continue;
  const created = await request('POST', '/pages', { slug: page.slug, title: page.title, metaTitle: page.title, metaDescription: `${demoMarker} ${page.description}`, isActive: true });
  let sortOrder = 0;
  for (const [sectionKey, content] of Object.entries(page.sections)) {
    await request('POST', '/sections', { pageId: created.id, sectionKey, sectionType: sectionType(sectionKey), content, galleryIds: [], sortOrder: sortOrder++, isActive: true });
  }
  added.pages++;
}

for (const [index, [slug, title, icon, kicker, summary, imageFile]] of services.entries()) {
  const existing = current.services.find((item) => item.slug === slug);
  if (existing && !existing.kicker.includes('Fictional demonstration')) continue;
  let image;
  if (existing) {
    image = new URL(existing.image, 'http://localhost').pathname;
  } else {
    const form = new FormData();
    const serviceImage = imageFile.replace(/^img[\\/]/, '');
    form.append('file', new Blob([await readFile(resolve(imageRoot, serviceImage))], { type: 'image/webp' }), serviceImage);
    const media = await request('POST', '/media/upload', form);
    image = media.url;
  }
  const payload = {
    slug, title, icon, kicker: `${kicker} · Fictional demonstration`, summary,
    image,
    body: [`${summary} This page is an original, illustrative example of a commercial property service.`, 'The steps below show how a client brief can be organized. No specific transaction or professional outcome is represented.'],
    outcomes: ['A documented requirement', 'A clear comparison of options', 'A record of the recommended next steps'],
    process: [{ title: 'Brief', detail: 'Define the commercial objective and constraints.' }, { title: 'Review', detail: 'Compare relevant options and supporting information.' }, { title: 'Decision', detail: 'Record the recommended action and the assumptions behind it.' }],
    faqs: [{ question: 'Is this an active service offer?', answer: 'No. This is illustrative content for a CreFolio client demonstration.' }],
    isActive: true, featured: index < 3, sortOrder: index,
  };
  if (existing) {
    await request('PATCH', `/services/${existing.id}`, payload);
    added.servicesUpdated++;
  } else {
    await request('POST', '/services', payload);
    added.services++;
  }
}

for (const property of current.properties) {
  if (!properties.some((demo) => demo.title === property.title)) continue;
  await request('DELETE', `/properties/${property.id}`);
  added.propertiesReplaced++;
}

for (const property of properties) {
  const form = new FormData();
  const { imageFiles, ...fields } = property;
  const record = {
    ...fields,
    description: `${property.title} is a fictional commercial property example set in the ${property.location}. The indicative ${property.area.toLocaleString('en-US')} sq ft area, pricing and specification demonstrate how a real listing would be presented. The map pin marks an approximate district centre rather than a property address. No actual asset is advertised.`,
  };
  for (const [key, value] of Object.entries(record)) form.append(key, key === 'amenities' ? JSON.stringify(value) : String(value));
  for (const imageFile of imageFiles) {
    form.append('images', new Blob([await readFile(resolve(imageRoot, imageFile))], { type: 'image/webp' }), imageFile);
  }
  form.append('documents', new Blob([brochure(property.title)], { type: 'application/pdf' }), `${property.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-sample-brochure.pdf`);
  await request('POST', '/properties', form);
  added.properties++;
}

const publicProperties = await request('GET', '/properties?limit=48');
const publicServices = await request('GET', '/services');
const home = await request('GET', '/pages/home');
const importedProperties = (await request('GET', '/properties/admin?limit=48')).data.filter((item) => item.title.includes('· Fictional'));
for (const property of importedProperties) {
  const detail = await request('GET', `/properties/admin/${property.id}`);
  if (!Number.isFinite(detail.latitude) || !Number.isFinite(detail.longitude) || (detail.latitude === 0 && detail.longitude === 0)) {
    throw new Error(`Coordinate verification failed for ${detail.title}`);
  }
  if (!detail.imageVariants?.length || detail.imageVariants.some((image) => !image.gallery || !image.card || !image.thumbnail)) {
    throw new Error(`Image variant verification failed for ${detail.title}`);
  }
}
if (publicProperties.total < properties.filter((item) => item.visibility === 'published').length || publicServices.length < services.length || home.sections.hero.kicker !== 'Illustrative portfolio') {
  throw new Error('API verification failed after import');
}
process.stdout.write(`Added ${added.pages} pages, ${added.services} services and ${added.properties} properties through CRUD; updated ${added.servicesUpdated} demo services and replaced ${added.propertiesReplaced} demo properties. Verified ${importedProperties.length} fictional properties with coordinates and WebP variants; non-demo records were preserved.\n`);
