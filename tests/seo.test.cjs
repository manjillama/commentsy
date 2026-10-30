const { test, assert, load } = require('./helpers.cjs');
const fs = require('node:fs');

function seoAt(origin) {
  return load('utils/seo.ts', { '@/constants': load('constants/index.ts') }, {
    process: { env: { NEXT_PUBLIC_SITE_URL: origin } },
  });
}

test('public canonical and share URLs use the configured origin, without query or path contamination', () => {
  const seo = seoAt('https://comments.example/base?preview=1');
  const metadata = seo.publicPageMetadata('Docs', 'Integration instructions', '/docs');
  assert.equal(metadata.alternates.canonical, 'https://comments.example/docs');
  assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
  assert.equal(metadata.twitter.title, metadata.title);
  assert.deepEqual(metadata.robots, { index: true, follow: true });
});

test('sitemap contains only public marketing pages and robots advertises the same origin', () => {
  const seo = seoAt('https://comments.example');
  const mocks = { '@/utils/seo': seo };
  const sitemap = load('app/sitemap.ts', mocks).default();
  assert.deepEqual(sitemap.map(entry => entry.url), [
    'https://comments.example/', 'https://comments.example/docs', 'https://comments.example/contact',
    'https://comments.example/legal/privacy-policy', 'https://comments.example/legal/terms-of-service',
  ]);
  const robots = load('app/robots.ts', mocks).default();
  assert.equal(robots.sitemap, 'https://comments.example/sitemap.xml');
  assert.equal(robots.rules.allow, '/');
  assert.equal(robots.rules.disallow, '/api/');
});

test('private routes, embeds, and API responses send noindex headers', async () => {
  const rules = (await require('../next.config.js').headers()).filter(rule => rule.headers.some(header => header.key === "X-Robots-Tag"));
  assert.deepEqual(rules.map(rule => rule.source), [
    '/api/:path*', '/embed/:path*', '/apps/:path*', '/dashboard', '/account', '/signin', '/signup', '/forgot-password', '/reset-password',
  ]);
  for (const rule of rules) assert.deepEqual(rule.headers, [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]);
  assert.match(fs.readFileSync('app/layout.tsx', 'utf8'), /robots: \{ index: false, follow: false \}/);
});
