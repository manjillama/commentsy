const { test, assert, load } = require('./helpers.cjs');
const vm = require('node:vm');

test('generated embed snippet sends the complete host page URL with query and fragment', () => {
  const JsCode = load('components/code-snippets/js-code.tsx', {
    './copy-button': { CopyButton: () => null },
    'react-syntax-highlighter': { Prism: () => null },
  }, { process: { env: { NEXT_PUBLIC_SITE_URL: 'https://comments.example.com' } } }).default;
  const view = JsCode();
  const code = view.props.children[1].props.children.replace(/^<script>\s*|\s*<\/script>$/g, '');
  for (const pageUrl of [
    'https://blog.example.com/?post=my-article',
    'https://blog.example.com/articles/my-article?language=en#discussion',
    'https://blog.example.com/articles/my-article',
  ]) {
    let listener;
    let metadata;
    const iframe = { contentWindow: { postMessage: (data, origin) => { metadata = data; assert.equal(origin, 'https://comments.example.com'); } } };
    vm.runInNewContext(code, {
      window: { location: { href: pageUrl }, addEventListener: (_type, handler) => { listener = handler; } },
      document: { title: 'My article', getElementById: () => iframe },
    });
    listener({ data: { type: 'pingCommentsyParent' } });
    assert.equal(metadata.url, pageUrl);
    assert.equal(metadata.title, 'My article');
  }
});

test('stored page URLs normalize Unicode and spaces without changing escaped URL structure', () => {
  const { normalizePageUrl } = load('utils/pageUrl.ts');
  const normalized = normalizePageUrl('https://example.com/café space?post=a%26b&tag=one&tag=two#my section');
  assert.equal(normalized, 'https://example.com/caf%C3%A9%20space?post=a%26b&tag=one&tag=two#my%20section');
  assert.equal(normalizePageUrl(normalized), normalized);
  assert.equal(new URL(normalized).searchParams.get('post'), 'a&b');
  assert.deepEqual(new URL(normalized).searchParams.getAll('tag'), ['one', 'two']);
  for (const invalid of [null, 123, '/relative', 'javascript:alert(1)', 'ftp://example.com', 'https://user:password@example.com', 'https://example.com/%oops', 'https://example.com/\npath']) {
    assert.equal(normalizePageUrl(invalid), null);
  }
});

test('comment model normalizes saved URLs and rejects unsupported schemes', () => {
  const { Comment, base } = require('./helpers.cjs');
  const document = new Comment({ ...base, comment: 'hello', pageUrl: 'https://example.com/my page?post=a%26b#discussion' });
  assert.equal(document.validateSync(), undefined);
  assert.equal(document.pageUrl, 'https://example.com/my%20page?post=a%26b#discussion');
  assert.ok(new Comment({ ...base, comment: 'hello', pageUrl: 'javascript:alert(1)' }).validateSync()?.errors.pageUrl);
});

test('submission requests current parent metadata rather than a cached initial URL', async () => {
  let handler;
  let removed = false;
  const fullUrl = 'https://example.com/?chapter=1&page=12#comments';
  const parent = { postMessage: message => {
    assert.equal(message.type, 'pingCommentsyParent');
    handler({ source: {}, data: { type: 'commentsyParentSiteData', title: 'Wrong frame', url: 'https://wrong.example/' } });
    handler({ source: parent, data: { type: 'commentsyParentSiteData', title: 'Chapter 1 · Page 12', url: fullUrl } });
  } };
  const page = load('utils/parentPageData.ts', {}, {
    window: { parent, addEventListener: (_type, listener) => { handler = listener; }, removeEventListener: () => { removed = true; } },
    setTimeout, clearTimeout,
  });
  const current = await page.requestParentPageData();
  assert.equal(current.url, fullUrl);
  assert.equal(current.title, 'Chapter 1 · Page 12');
  assert.equal(removed, true);
});
