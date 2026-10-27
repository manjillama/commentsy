const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const mongoose = require('mongoose');

// Load the actual TS modules without introducing a second build or test dependency.
function load(file, mocks = {}, globals = {}) {
  const loadedModule = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const evaluate = vm.runInThisContext(`(function(module, exports, require, ${Object.keys(globals).join(",")}) { ${source}\n})`, { filename: file });
  evaluate(loadedModule, loadedModule.exports, name => name in mocks ? mocks[name] : require(name), ...Object.values(globals));
  return loadedModule.exports;
}
const gifUtils = load('utils/gif.ts', {}, { URL });
const gif = { provider: 'klipy', id: '123', slug: 'happy-cat', url: 'https://static.klipy.com/content/cat.gif?delivery=original', title: 'Happy cat' };

test('attachments accept original KLIPY URLs and reject unsafe or malformed input', () => {
  assert.ok(gifUtils.isCommentGif(gif));
  for (const url of ['http://static.klipy.com/a.gif', 'https://static.klipy.com.evil.example/a.gif', 'https://user@static.klipy.com/a.gif', 'javascript:alert(1)', 'https://example.com/a.gif']) {
    assert.equal(gifUtils.isCommentGif({ ...gif, url }), false);
  }
  for (const invalid of [null, {}, { ...gif, slug: '../escape' }, { ...gif, title: 'a'.repeat(301) }]) assert.equal(gifUtils.isCommentGif(invalid), false);
});

const Comment = load('models/Comment.ts', {
  '@/utils/gif': gifUtils,
  '@/lib/createModel': (name, schema) => mongoose.model('GifTestComment', schema),
  '@/interfaces/IGroup': { COMMENT_STATUS: { pending: 'pending', approved: 'approved', deleted: 'deleted' } },
  '@/interfaces/IUser': { AVATAR_BACKGROUND_COLORS: ['#fed0bb'] },
}).default;
const base = { app: new mongoose.Types.ObjectId(), group: new mongoose.Types.ObjectId(), user: new mongoose.Types.ObjectId(), pageTitle: 'Test', pageUrl: 'https://example.com/post' };

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

test('comment service rejects empty content and invalid attachments before database writes', async () => {
  const service = load('services/commentService.ts', {
    '@/utils/gif': gifUtils,
    '@/models/App': { findOne: () => { throw new Error('unexpected database access'); } },
    '@/models/Comment': {}, '@/models/Group': {}, './factoryService': {},
    '@/utils/appError': class AppError extends Error {},
    '@/interfaces/IGroup': { COMMENT_STATUS: {} }, '@/interfaces/IUser': { AVATAR_BACKGROUND_COLORS: [] },
  }).default;
  await assert.rejects(service.createComment({ comment: '   ' }), /Add a comment or choose a GIF/);
  await assert.rejects(service.createComment({ comment: 'text', gif: { ...gif, url: 'https://evil.example/a.gif' } }), /Invalid GIF/);
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

test('service saves GIF-only comments and anonymous replies with their attachment', async () => {
  for (const anonymous of [false, true]) {
    const group = { _id: base.group, commentsCount: 0, save: async () => {} };
    const parent = { repliesCount: 0, save: async () => {} };
    const service = load('services/commentService.ts', {
      '@/utils/gif': gifUtils,
      '@/models/App': { findOne: async () => ({ _id: base.app }) },
      '@/models/Comment': class extends Comment {
        async save() { return this; }
        static async findById() { return parent; }
      },
      '@/models/Group': { findOne: async () => group }, './factoryService': {},
      '@/utils/appError': class AppError extends Error {},
      '@/interfaces/IGroup': { COMMENT_STATUS: { approved: 'approved' } },
      '@/interfaces/IUser': { AVATAR_BACKGROUND_COLORS: ['#fed0bb'] },
    }).default;
    const posted = await service.createComment({
      appCode: 'app', groupIdentifier: 'post', comment: '', gif,
      pageTitle: base.pageTitle, pageUrl: base.pageUrl,
      ...(anonymous ? { anonUser: { name: 'Guest', email: 'guest@example.com' }, parentCommentId: String(new mongoose.Types.ObjectId()) } : { userId: String(base.user) }),
    });
    assert.deepEqual(JSON.parse(JSON.stringify(posted.gif)), gif);
    assert.equal(posted.comment, '');
    assert.equal(group.commentsCount, 1);
    if (anonymous) { assert.equal(posted.anonUser.name, 'Guest'); assert.equal(parent.repliesCount, 1); }
    else assert.equal(String(posted.user), String(base.user));
  }
});

test('development reload replaces a cached pre-GIF schema with the current schema', () => {
  const createModel = load('lib/createModel.ts', {
    '@/config': { config: { envs: { dev: 'development' } } },
  }, { process: { env: { NODE_ENV: 'development' } } }).default;
  const name = 'GifHotReloadRegression';
  try {
    const old = createModel(name, new mongoose.Schema({ comment: { type: String, required: true } }));
    assert.ok(new old({}).validateSync());
    const refreshed = createModel(name, Comment.schema);
    assert.notEqual(refreshed, old);
    const posted = new refreshed({ ...base, comment: '', gif });
    assert.equal(posted.validateSync(), undefined);
    assert.deepEqual(JSON.parse(JSON.stringify(posted.gif)), gif);
    assert.equal(mongoose.models[name], refreshed);
  } finally {
    if (mongoose.models[name]) mongoose.deleteModel(name);
  }
});

test('author mutations enforce ownership and scope deletion to the selected thread', async () => {
  const calls = [];
  let found = null;
  const service = load('services/commentService.ts', {
    '@/utils/gif': gifUtils, '@/models/App': {}, './factoryService': {},
    '@/models/Comment': {
      findOne: async query => { calls.push(['find', query]); return found; },
      updateMany: async (query, update) => { calls.push(['replies', query, update]); return { modifiedCount: 2 }; },
      updateOne: async (query, update) => { calls.push(['parent', query, update]); },
    },
    '@/models/Group': { updateOne: async (query, update) => { calls.push(['group', query, update]); } },
    '@/utils/appError': class AppError extends Error {},
    '@/interfaces/IGroup': { COMMENT_STATUS: { approved: 'approved', deleted: 'deleted' } },
    '@/interfaces/IUser': { AVATAR_BACKGROUND_COLORS: [] },
  }).default;
  await assert.rejects(service.updateOwnComment('comment-id', 'other-user', { comment: 'changed' }), /cannot edit/);
  await assert.rejects(service.deleteOwnComment('comment-id', 'other-user'), /cannot delete/);
  assert.equal(calls[0][1].user, 'other-user');
  assert.equal(calls[1][1].user, 'other-user');
  found = { _id: 'comment-id', user: 'author', group: 'group-id', status: 'approved', comment: 'old', gif, save: async function () { return this; } };
  await service.updateOwnComment('comment-id', 'author', { comment: 'new', gif: null });
  assert.equal(found.comment, 'new');
  assert.equal(found.gif, undefined);
  await assert.rejects(service.updateOwnComment('comment-id', 'author', { comment: '', gif: null }), /Add a comment/);
  await assert.rejects(service.updateOwnComment('comment-id', 'author', { comment: 'new', gif: {} }), /Invalid GIF/);
  await service.deleteOwnComment('comment-id', 'author');
  assert.equal(found.status, 'deleted');
  assert.equal(calls.find(call => call[0] === 'replies')[1].parent, 'comment-id');
  assert.equal(calls.find(call => call[0] === 'group')[2].$inc.commentsCount, -3);
  calls.length = 0;
  found = { ...found, status: 'approved', parent: 'parent-id' };
  await service.deleteOwnComment('comment-id', 'author');
  assert.equal(calls.some(call => call[0] === 'replies'), false);
  assert.equal(calls.find(call => call[0] === 'parent')[1]._id, 'parent-id');
  assert.equal(calls.find(call => call[0] === 'group')[2].$inc.commentsCount, -1);
});

test('iframe storage checks distinguish blocked, supported, and first-party contexts', async () => {
  const access = load('utils/embedSession.ts');
  let checked = 0;
  const blocked = { hasStorageAccess: async () => { checked++; return false; } };
  assert.equal(await access.hasEmbedStorageAccess(blocked, true), false);
  assert.equal(checked, 1);
  assert.equal(await access.hasEmbedStorageAccess(blocked, false), true);
  assert.equal(checked, 1);
  assert.equal(await access.hasEmbedStorageAccess({}, true), true);
  assert.equal(await access.hasEmbedStorageAccess({ hasStorageAccess: async () => true }, true), true);
});

test('storage request runs synchronously during the click and propagates denial', async () => {
  const access = load('utils/embedSession.ts');
  let requested = false;
  const pending = access.requestEmbedStorageAccess({ requestStorageAccess: () => { requested = true; return Promise.resolve(); } });
  assert.equal(requested, true);
  await pending;
  await assert.rejects(access.requestEmbedStorageAccess({ requestStorageAccess: async () => { throw new Error('denied'); } }), /denied/);
  await access.requestEmbedStorageAccess({});
});

test('session refresh includes cookies, skips cache, and handles signed-out and failed sessions', async () => {
  let response = { ok: true, json: async () => ({ user: { id: 'author', name: 'Author' } }) };
  const access = load('utils/embedSession.ts', {}, {
    fetch: async (url, options) => {
      assert.equal(url, '/api/auth/session');
      assert.equal(options.credentials, 'include');
      assert.equal(options.cache, 'no-store');
      return response;
    },
  });
  assert.equal((await access.fetchEmbedUser()).id, 'author');
  response = { ok: true, json: async () => ({}) };
  assert.equal(await access.fetchEmbedUser(), undefined);
  response = { ok: false };
  await assert.rejects(access.fetchEmbedUser(), /Could not check your sign-in/);
});

test('session cookie supports local HTTP while preserving HTTPS embed settings', () => {
  const { sessionCookieOptions } = load('utils/sessionCookie.ts', {}, { URL });
  const local = sessionCookieOptions('http://localhost:3000', false);
  assert.equal(local.secure, false);
  assert.equal(local.sameSite, 'lax');
  const deployed = sessionCookieOptions('https://comments.example.com', true);
  assert.equal(deployed.secure, true);
  assert.equal(deployed.sameSite, 'none');
  assert.equal(deployed.httpOnly, true);
  assert.equal(sessionCookieOptions(undefined, true).secure, true);
  assert.equal(sessionCookieOptions('https://localhost:3000', false).secure, true);
});

test('credentials normalize email, validate passwords, and preserve provider restrictions', async () => {
  let record = { _id: 'user-id', provider: 'credentials', name: 'User', email: 'user@example.com', password: 'stored-hash', validatePassword: async (password, hash) => password === 'correct-password' && hash === 'stored-hash' };
  const service = load('services/authService.ts', {
    '@/models/User': { findOne: query => {
      assert.equal(query.email, 'user@example.com');
      return { select: async field => { assert.equal(field, '+password'); return record; } };
    } },
    '@/interfaces/IUser': { EProviders: { credentials: 'credentials' }, AVATAR_BACKGROUND_COLORS: [] },
    '@/utils/appError': class AppError extends Error {},
  }).default;
  assert.equal((await service.getLoginUserFromCredentials({ email: ' USER@example.com ', password: 'correct-password' })).id, 'user-id');
  assert.equal(await service.getLoginUserFromCredentials({ email: 'user@example.com', password: 'wrong' }), null);
  await assert.rejects(service.getLoginUserFromCredentials({ email: '', password: '' }), /CredentialsSigninMissing/);
  record = { ...record, provider: 'github' };
  await assert.rejects(service.getLoginUserFromCredentials({ email: 'user@example.com', password: 'correct-password' }), /OAuthAccountNotLinked/);
});

test('credentials login never silently redirects when the browser drops its session cookie', async () => {
  let retainedUser;
  let result = { ok: true, error: null, url: 'http://localhost:3000/dashboard' };
  const login = load('utils/credentialsLogin.ts', {
    'next-auth/react': { signIn: async (provider, options) => {
      assert.equal(provider, 'credentials');
      assert.equal(options.email, 'user@example.com');
      assert.equal(options.password, 'autofilled-password');
      assert.equal(options.callbackUrl, '/dashboard');
      return result;
    } },
    '@/utils/embedSession': { fetchEmbedUser: async () => retainedUser },
  });
  const submit = () => login.credentialsLogin('user@example.com', 'autofilled-password', '/dashboard');
  await assert.rejects(submit(), /SessionCookieBlocked/);
  retainedUser = { id: 'author' };
  assert.equal(await submit(), 'http://localhost:3000/dashboard');
  result = { ok: false, error: 'CredentialsSignin', url: null };
  await assert.rejects(submit(), /CredentialsSignin/);
});
