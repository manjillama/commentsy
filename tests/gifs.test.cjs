const { test, assert, load, mongoose, gifUtils, gif, Comment, base } = require('./helpers.cjs');

test('attachments accept original KLIPY URLs and reject unsafe or malformed input', () => {
  assert.ok(gifUtils.isCommentGif(gif));
  for (const url of ['http://static.klipy.com/a.gif', 'https://static.klipy.com.evil.example/a.gif', 'https://user@static.klipy.com/a.gif', 'javascript:alert(1)', 'https://example.com/a.gif']) {
    assert.equal(gifUtils.isCommentGif({ ...gif, url }), false);
  }
  for (const invalid of [null, {}, { ...gif, slug: '../escape' }, { ...gif, title: 'a'.repeat(301) }]) assert.equal(gifUtils.isCommentGif(invalid), false);
});

test('model accepts text, GIF-only, and text plus GIF; attachments survive serialization', () => {
  for (const content of [{ comment: 'hello' }, { gif }, { comment: 'hello', gif }]) {
    const document = new Comment({ ...base, ...content });
    assert.equal(document.validateSync(), undefined);
    const saved = JSON.parse(JSON.stringify(document));
    if (content.gif) assert.deepEqual(saved.gif, gif);
  }
  assert.ok(new Comment(base).validateSync()?.errors.comment);
  assert.ok(new Comment({ ...base, gif: { ...gif, url: 'https://evil.example/a.gif' } }).validateSync()?.errors.gif);
});

test('browser search preserves provider order, media URLs, query, pagination, and anonymous identity', async () => {
  const requests = [];
  const client = load('lib/klipy.ts', { '@/utils/gif': gifUtils }, {
    URL, URLSearchParams, process: { env: { NEXT_PUBLIC_KLIPY_API_KEY: 'test-public-key' } },
    navigator: { language: 'en-US' }, crypto: { randomUUID: () => 'anonymous-test-id' },
    fetch: async (url, options) => {
      requests.push({ url: String(url), options });
      return { ok: true, json: async () => ({ result: true, data: { has_next: true, data: [
        { id: 123, slug: 'happy-cat', title: 'Happy cat', file: { md: { gif: { url: gif.url } } } },
        { id: 456, slug: 'second-cat', title: 'Second cat', file: { sm: { gif: { url: 'https://static1.klipy.com/second.gif' } } } },
      ] } }) };
    },
  });
  const result = await client.searchGifs('cats & dogs!', 2, new AbortController().signal);
  assert.deepEqual(Array.from(result.gifs, item => item.id), ['123', '456']);
  assert.equal(result.gifs[0].url, gif.url);
  assert.equal(result.hasNext, true);
  const url = new URL(requests[0].url);
  assert.equal(url.pathname, '/api/v1/test-public-key/gifs/search');
  assert.equal(url.searchParams.get('q'), 'cats & dogs!');
  assert.equal(url.searchParams.get('page'), '2');
  assert.equal(url.searchParams.get('customer_id'), 'anonymous-test-id');
  await client.searchGifs('', 1, new AbortController().signal);
  assert.equal(new URL(requests[1].url).pathname, '/api/v1/test-public-key/gifs/trending');
  await client.registerGifShare(gif);
  assert.equal(new URL(requests[2].url).pathname, '/api/v1/test-public-key/gifs/share/happy-cat');
  assert.equal(requests[2].options.method, 'POST');
});

test('provider failures produce a recoverable search error', async () => {
  const client = load('lib/klipy.ts', { '@/utils/gif': gifUtils }, {
    URL, URLSearchParams, process: { env: { NEXT_PUBLIC_KLIPY_API_KEY: 'test' } },
    navigator: { language: 'en' }, crypto: { randomUUID: () => 'anon' },
    fetch: async () => ({ ok: false }),
  });
  await assert.rejects(client.searchGifs('cats', 1, new AbortController().signal), /unavailable/);
});
