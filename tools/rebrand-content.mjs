// Explicit, repeatable CRUD update; never runs on application boot.
const base = process.env.DEMO_API_BASE_URL?.replace(/\/$/, '');
const password = process.env.DEMO_ADMIN_PASSWORD;
const email = process.env.DEMO_ADMIN_EMAIL || 'muneeb.workstation@gmail.com';
const apply = process.argv.includes('--apply');
if (!base || !password) throw new Error('Set DEMO_API_BASE_URL and DEMO_ADMIN_PASSWORD');
const cookies = new Map();
async function request(method, path, body) {
  const headers = { Origin: 'https://crefolio.vercel.app' };
  if (cookies.size) headers.Cookie = [...cookies].map(([k, v]) => `${k}=${v}`).join('; ');
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${base}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(20000) });
  for (const value of response.headers.getSetCookie()) {
    const pair = value.split(';')[0]; const at = pair.indexOf('=');
    cookies.set(pair.slice(0, at), pair.slice(at + 1));
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`${method} ${path}: HTTP ${response.status} ${JSON.stringify(error.message ?? '')}`);
  }
  const text = await response.text(); return text ? JSON.parse(text) : null;
}
function rebrand(value) {
  if (typeof value === 'string') return value.replace(/\bportico\b/gi, 'CreFolio');
  if (Array.isArray(value)) return value.map(rebrand);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, rebrand(v)]));
  return value;
}
async function patch(path, body) {
  const updated = rebrand(body);
  if (JSON.stringify(updated) === JSON.stringify(body)) return;
  console.log(`${apply ? 'Updating' : 'Would update'} ${path}`);
  if (apply) await request('PATCH', path, updated);
}
await request('POST', '/user/login', { email, password });
try {
  const user = await request('GET', '/user/me');
  if (user.role !== 'admin' || user.email.toLowerCase() !== email.toLowerCase()) throw new Error('Administrator verification failed');
  for (const page of await request('GET', '/pages')) {
    await patch(`/pages/${page.slug}`, Object.fromEntries(['title', 'metaTitle', 'metaDescription'].filter(k => page[k] !== undefined).map(k => [k, page[k]])));
  }
  for (const section of await request('GET', '/sections')) await patch(`/sections/${section.id}`, { content: section.content });
  for (const service of await request('GET', '/services/admin')) {
    await patch(`/services/${service.id}`, Object.fromEntries(['title', 'summary', 'kicker', 'body', 'outcomes', 'process', 'faqs'].map(k => [k, service[k]])));
  }
  await patch('/user/me', { name: user.name });
  console.log(apply ? 'Content rebrand complete; IDs, slugs, images and publication settings preserved.' : 'Preview complete. Use --apply to update.');
} finally {
  await request('POST', '/user/logout').catch(() => {});
}
