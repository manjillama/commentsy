const { test, assert, load, mongoose, gifUtils, Comment, base } = require('./helpers.cjs');
const AppError = load('utils/appError.ts').default;
const origin = load('utils/origin.ts');
const groupStatuses = { COMMENT_STATUS: { approved: 'approved', pending: 'pending', deleted: 'deleted' } };
const transactionSession = { transaction: true };
const transactionMock = { connection: { transaction: async work => { await work(transactionSession); /* Driver need not return callback data. */ } } };

function publicService(mocks = {}) {
  return load('services/publicCommentService.ts', {
    '@/utils/commentStyles': { parseCommentStyles: () => ({}) },
    '@/models/App': {}, '@/models/Comment': {}, '@/models/Group': {},
    '@/utils/appError': AppError, '@/interfaces/IGroup': groupStatuses,
    './factoryService': {}, ...mocks,
  }).default;
}

function commentService(mocks = {}) {
  return load('services/commentService.ts', {
    mongoose: transactionMock, '@/utils/gif': gifUtils,
    '@/models/App': { findOne: async () => ({ _id: base.app, authorizedOrigins: ['https://example.com'] }) },
    '@/models/Comment': {}, '@/models/Group': {}, './factoryService': {},
    '@/utils/appError': AppError, '@/interfaces/IGroup': groupStatuses,
    '@/interfaces/IUser': { AVATAR_BACKGROUND_COLORS: ['#fed0bb'] }, ...mocks,
  }).default;
}

const submission = { appCode: 'app', groupIdentifier: 'post', comment: 'Hello', pageTitle: base.pageTitle, pageUrl: base.pageUrl, userId: String(base.user) };

test('root state stays isolated across signed-in, signed-out, and overlapping requests', async () => {
  let session;
  let release;
  const wait = new Promise(resolve => { release = resolve; });
  const Root = load('components/root-component.tsx', {
    '@/context/auth-provider': () => null, '@/context/redux-provider': () => null,
    '@/context/toast-provider': () => null,
    'next-auth': { getServerSession: async () => session },
    '@/app/api/auth/[...nextauth]/options': { options: {} },
    '@/lib/dbConnect': async () => {},
    '@/services/appService': { getAppsByUserId: async id => { if (id === 'alice') await wait; return [{ _id: id }]; } },
  }).default;
  session = { user: { id: 'alice' } };
  const alice = Root({ children: null });
  await Promise.resolve();
  session = { user: { id: 'bob' } };
  const bob = await Root({ children: null });
  session = null;
  const guest = await Root({ children: null });
  release();
  assert.deepEqual((await alice).props.preloadedState.apps.apps, [{ _id: 'alice' }]);
  assert.deepEqual(bob.props.preloadedState.apps.apps, [{ _id: 'bob' }]);
  assert.deepEqual(guest.props.preloadedState.apps.apps, []);
});

test('configured origins match scheme, hostname, and port exactly', () => {
  for (const url of ['http://example.com/post', 'https://example.com:444/post', 'https://www.example.com/post', 'https://evil.example/post', 'javascript:alert(1)', 'invalid'])
    assert.equal(origin.isAuthorizedPage(['https://example.com'], url), false, url);
  assert.equal(origin.isAuthorizedPage(['https://example.com'], 'https://example.com/post?q=1'), true);
  assert.equal(origin.isAuthorizedPage(['https://example.com'], 'https://example.com:443/post'), true);
  assert.equal(origin.webOrigin('https://user:password@example.com'), null);
});

test('unauthorized and malformed embed referrers never read or create groups', async () => {
  const service = publicService({
    '@/models/App': { findOne: () => ({ lean: async () => ({ authorizedOrigins: ['https://example.com'] }) }) },
    '@/models/Group': { findOne: () => { throw new Error('must authorize before group lookup'); }, create: () => { throw new Error('unexpected write'); } },
  });
  for (const refererUrl of ['invalid', 'https://evil.example/post', 'http://example.com/post', 'https://example.com:444']) {
    const result = await service.getAllGroupCommentsInitData({ appCode: 'app', groupIdentifier: 'post', refererUrl });
    assert.equal(result.status, 'fail');
  }
});

test('public comment loads scope repeated identifiers to the requested app', async () => {
  const calls = [];
  const service = publicService({
    '@/models/App': { findOne: ({ code }) => ({ lean: async () => ({ _id: code }) }) },
    '@/models/Group': { findOne: query => ({ lean: async () => { calls.push(query); return { _id: query.app + '-post' }; } }) },
    './factoryService': { find: (_, query) => ({ populate() { return this; }, exec: async () => [[{ status: 'approved', comment: query.group }], 1, 20] }) },
  });
  const [a] = await service.getAllGroupComments('site-a', 'post', {});
  const [b] = await service.getAllGroupComments('site-b', 'post', {});
  assert.equal(a[0].comment, 'site-a-post');
  assert.equal(b[0].comment, 'site-b-post');
  assert.deepEqual(calls, [{ app: 'site-a', identifier: 'post' }, { app: 'site-b', identifier: 'post' }]);
  await assert.rejects(service.getAllGroupComments(undefined, 'post', {}), /Missing app code/);
});

test('competing first embed loads recover from a duplicate group insertion', async () => {
  let reads = 0;
  const service = publicService({
    '@/models/App': { findOne: () => ({ lean: async () => ({ _id: base.app, authorizedOrigins: ['https://example.com'] }) }) },
    '@/models/Group': {
      findOne: () => ({ select() { return this; }, lean: async () => ++reads === 1 ? null : ({ _id: base.group, identifier: 'post', commentsCount: 0 }) }),
      create: async () => { throw Object.assign(new Error('duplicate'), { code: 11000 }); },
    },
    './factoryService': { find: () => ({ populate() { return this; }, exec: async () => [[], 0, 20] }) },
  });
  assert.equal((await service.getAllGroupCommentsInitData({ appCode: 'app', groupIdentifier: 'post', refererUrl: 'https://example.com/post' })).status, 'success');
  assert.equal(reads, 2);
});

test('posting rejects an unauthorized page before any comment or group write', async () => {
  const service = commentService();
  await assert.rejects(service.createComment({ ...submission, pageUrl: 'https://evil.example/post' }), error => error.statusCode === 403);
  await assert.rejects(service.createComment({ ...submission, appCode: { $ne: null } }), error => error.statusCode === 400);
});

test('comment saves and atomic count increments share a session and are awaited', async () => {
  const operations = [];
  const service = commentService({
    '@/models/App': { findOne: async (_query, _projection, options) => { assert.equal(options.session, transactionSession); return { _id: base.app, authorizedOrigins: ['https://example.com'] }; } },
    '@/models/Comment': class extends Comment {
      async save(options) { assert.equal(options.session, transactionSession); operations.push('comment'); return this; }
      static async findById() { return { app: base.app, group: base.group, status: 'approved' }; }
      static async updateOne(_filter, update, options) { assert.equal(options.session, transactionSession); assert.equal(update.$inc.repliesCount, 1); await Promise.resolve(); operations.push('parent'); }
    },
    '@/models/Group': { findOne: async () => ({ _id: base.group }), updateOne: async (_filter, update, options) => { assert.equal(options.session, transactionSession); assert.equal(update.$inc.commentsCount, 1); await Promise.resolve(); operations.push('group'); } },
  });
  const result = await service.createComment({ ...submission, parentCommentId: String(new mongoose.Types.ObjectId()) });
  assert.equal(result.comment, 'Hello');
  assert.deepEqual(operations, ['comment', 'parent', 'group']);
});

test('failed comment persistence cannot increment counts', async () => {
  let increments = 0;
  const service = commentService({
    '@/models/Comment': class extends Comment { async save() { throw new Error('write failed'); } },
    '@/models/Group': { findOne: async () => ({ _id: base.group }), updateOne: async () => { increments++; } },
  });
  await assert.rejects(service.createComment(submission), /write failed/);
  assert.equal(increments, 0);
});

test('count write failures reject the transaction instead of silently succeeding', async () => {
  let aborted = false;
  const service = commentService({
    mongoose: { connection: { transaction: async work => { try { await work(transactionSession); } catch (error) { aborted = true; throw error; } } } },
    '@/models/Comment': class extends Comment { async save() { return this; } },
    '@/models/Group': { findOne: async () => ({ _id: base.group }), updateOne: async () => { throw new Error('counter failed'); } },
  });
  await assert.rejects(service.createComment(submission), /counter failed/);
  assert.equal(aborted, true);
});

test('guest approval holds new comments and replies without increasing public counts', async () => {
  const service = commentService({
    '@/models/App': { findOne: async () => ({ _id: base.app, authorizedOrigins: ['https://example.com'], requireGuestApproval: true }) },
    '@/models/Comment': class extends Comment {
      async save() { return this; }
      static async findById() { return { app: base.app, group: base.group, status: 'approved' }; }
    },
    '@/models/Group': { findOne: async () => ({ _id: base.group }), updateOne: () => { throw new Error('pending comment counted'); } },
  });
  for (const parentCommentId of [undefined, String(new mongoose.Types.ObjectId())]) {
    const posted = await service.createComment({ ...submission, userId: undefined, parentCommentId, anonUser: { name: 'Guest', email: 'guest@example.com' } });
    assert.equal(posted.status, 'pending');
  }
});

test('approval counts once and pending deletion does not decrement public counts', async () => {
  let increments = 0;
  const record = { _id: 'comment', group: { _id: 'group', owner: 'owner' }, status: 'pending', isSpam: false, $locals: {}, save: async function (options) { assert.equal(options.session, transactionSession); return this; } };
  const service = commentService({
    '@/models/Comment': { findById: () => ({ populate: async () => record }) },
    '@/models/Group': { updateOne: async (_filter, update) => { increments += update.$inc.commentsCount; } },
  });
  await service.updateCommentStatus({ commentId: 'comment', userId: 'owner', status: 'approved' });
  assert.equal(increments, 1);
  await assert.rejects(service.updateCommentStatus({ commentId: 'comment', userId: 'owner', status: 'approved' }), /already|alreay/);
  record.status = 'pending';
  await service.updateCommentStatus({ commentId: 'comment', userId: 'owner', status: 'deleted' });
  assert.equal(increments, 1);
  assert.equal(record.$locals.deletedCount, 0);
});

test('cursor pagination reaches beyond 40 and remains stable after earlier inserts/deletions', async () => {
  const cursor = load('utils/commentCursor.ts', { '@/utils/appError': AppError });
  const APIFeatures = load('utils/apiFeatures.ts', { '../config': { config: { defaultTimeZone: 'UTC' } } });
  const factory = load('services/factoryService.ts', { '@/utils/apiFeatures': APIFeatures }).default;
  const timestamp = new Date('2026-10-29T10:00:00.000Z');
  const original = Array.from({ length: 65 }, (_, i) => ({ _id: (i + 1).toString(16).padStart(24, '0'), createdAt: timestamp, group: 'site-a-post', parent: null, status: 'approved', isSpam: false }));
  let records = [...original];
  const matches = (record, filter) => Object.entries(filter).every(([key, value]) => {
    if (key === '$or') return value.some(item => matches(record, item));
    if (key === '$and') return value.every(item => matches(record, item));
    if (value && typeof value === 'object' && !(value instanceof Date)) return Object.entries(value).every(([op, expected]) => {
      const operand = key === 'createdAt' ? new Date(expected) : expected;
      return op === '$lt' ? record[key] < operand : op === '$gt' ? record[key] > operand : false;
    });
    return key === 'createdAt' ? +record[key] === +new Date(value) : record[key] === value;
  });
  const model = {
    find() {
      return { filter: {}, offset: 0, size: 40,
        find(filter) { this.filter = filter; return this; }, sort(sort) { assert.equal(sort, '-createdAt -_id'); return this; },
        select() { return this; }, populate() { return this; }, skip(n) { this.offset = n; return this; }, limit(n) { this.size = n; return this; },
        then(resolve, reject) { return Promise.resolve(records.filter(record => matches(record, this.filter)).sort((a, b) => b._id.localeCompare(a._id)).slice(this.offset, this.offset + this.size)).then(resolve, reject); },
      };
    },
    countDocuments: async filter => records.filter(record => matches(record, filter)).length,
  };
  const service = publicService({
    '@/models/App': { findOne: () => ({ lean: async () => ({ _id: 'site-a' }) }) },
    '@/models/Group': { findOne: () => ({ lean: async () => ({ _id: 'site-a-post' }) }) },
    '@/models/Comment': model, './factoryService': factory,
  });
  const [first, total, size] = await service.getAllGroupComments('site-a', 'post', { limit: 20 });
  assert.equal(total, 65); assert.equal(size, 20);
  const collected = [...first];
  // Delete an already-loaded comment, then add a newer one ahead of the cursor.
  records = records.filter(record => record._id !== first[0]._id);
  records.push({ ...original[0], _id: 'f'.repeat(24) });
  let batch = first;
  while (batch.length === size) {
    const result = await service.getAllGroupComments('site-a', 'post', { limit: size, after: cursor.commentCursor(batch.at(-1)) });
    batch = result[0];
    assert.equal(result[1], 65); // Total counts the thread, not only records after the cursor.
    collected.push(...batch);
  }
  assert.equal(collected.length, 65);
  assert.equal(new Set(collected.map(item => item._id)).size, 65);
  assert.deepEqual(new Set(collected.map(item => item._id)), new Set(original.map(item => item._id)));
  for (const after of ['bad', timestamp.toISOString() + '|not-an-id', 'invalid|' + original[0]._id])
    await assert.rejects(service.getAllGroupComments('site-a', 'post', { after }), /Invalid comment cursor/);
});

test('pagination normalizes invalid limits and reports the applied size', async () => {
  const features = load('utils/apiFeatures.ts', { '../config': { config: { defaultTimeZone: 'UTC' } } });
  for (const [value, expected] of [[0, 40], [-1, 40], [100, 40], [NaN, 40], [Infinity, 40], [3.9, 3], ['20', 20]])
    assert.equal(features.paginationSize(value), expected);
  let skip, limit;
  const query = { skip(value) { skip = value; return this; }, limit(value) { limit = value; return this; } };
  new features.default(query, { page: -10 }).paginate(0);
  assert.equal(skip, 0); assert.equal(limit, 40);
});

test('More comments sends app identity and advances its cursor instead of growing a capped limit', async () => {
  let requested, nextData;
  const data = { appCode: 'site-a', identifier: 'post & one', comments: [{ _id: 'a'.repeat(24), createdAt: '2026-10-29T10:00:00.000Z' }], size: 20, total: 50, userCommentStyles: { accent: {} } };
  const Component = load('components/embed-comments/fetch-more-comments.tsx', {
    react: { useState: value => [value, () => {}], useRef: value => ({ current: value }) },
    '@/utils/api': { get: async url => { requested = new URL(url, 'https://comments.example.com'); return { status: 'success', data: { comments: [{ _id: 'b'.repeat(24) }], total: 50, size: 20 } }; } },
    '../ui': { Spinner: () => null }, '../ui/form-feedback': () => null,
  }).default;
  const view = Component({ commentData: data, setCommentData: value => { nextData = typeof value === "function" ? value(data) : value; }, params: { currentPage: 5, sort: '-createdAt' }, setParams: () => {} });
  await view.props.children[1].props.onClick();
  assert.equal(requested.searchParams.get('appCode'), 'site-a');
  assert.equal(requested.searchParams.get('identifier'), 'post & one');
  assert.equal(requested.searchParams.get('limit'), '20');
  assert.equal(requested.searchParams.get('page'), '1');
  assert.equal(requested.searchParams.get('after'), '2026-10-29T10:00:00.000Z|' + 'a'.repeat(24));
  assert.equal(nextData.comments.length, 2);
});

test('auth returns reject arbitrary external, protocol-relative, credentialed, and unsafe URLs', async () => {
  const redirect = load('utils/authRedirect.ts', {}, { process: { env: { AUTH_REDIRECT_ORIGINS: 'https://blog.example.com' } } }).authRedirect;
  const baseUrl = 'https://comments.example.com';
  for (const url of ['https://evil.example/login', '//evil.example/login', '/\\evil.example', 'javascript:alert(1)', 'https://user:password@blog.example.com', 'http://blog.example.com', 'https://blog.example.com:444'])
    assert.equal(await redirect(url, baseUrl), baseUrl, url);
  assert.equal(await redirect('/dashboard', baseUrl), baseUrl + '/dashboard');
  assert.equal(await redirect('https://blog.example.com/post?q=1#comments', baseUrl), 'https://blog.example.com/post?q=1#comments');
  const closed = load('utils/authRedirect.ts', {}, { process: { env: {} } }).authRedirect;
  assert.equal(await closed('https://blog.example.com', baseUrl), baseUrl);
});

test('JSON writes reject foreign origins, simple form submissions, malformed data, and oversized streams', async () => {
  const bodyUtils = load('utils/requestBody.ts', { '@/utils/appError': AppError }, { process: { env: { NEXTAUTH_URL: 'https://comments.example.com' } } });
  const request = (body, headers = {}) => new Request('https://comments.example.com/api/comments', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body });
  assert.doesNotThrow(() => bodyUtils.validateWriteRequest(request('{}', { origin: 'https://comments.example.com' })));
  for (const headers of [{ origin: 'https://evil.example' }, { origin: 'null' }, { 'sec-fetch-site': 'cross-site' }, { 'content-type': 'text/plain' }])
    assert.throws(() => bodyUtils.validateWriteRequest(request('{}', headers)), error => [403, 415].includes(error.statusCode));
  for (const body of ['null', '[]', '"value"', '{']) await assert.rejects(bodyUtils.readJsonBody(request(body)), error => error.statusCode === 400);
  await assert.rejects(bodyUtils.readJsonBody(request(JSON.stringify({ comment: 'é'.repeat(100) })), 100), error => error.statusCode === 413);
  assert.deepEqual(await bodyUtils.readJsonBody(request('{"comment":"Hello"}')), { comment: 'Hello' });
});

test('rate limits share durable buckets, expire by window, hash identities, and reject excess requests', async () => {
  const buckets = new Map(); let now = 60_000; const calls = [];
  const RateLimit = { findOneAndUpdate: async (filter, update) => {
    calls.push({ filter, update });
    const bucket = buckets.get(filter._id) ?? { count: 0 };
    bucket.count += update.$inc.count;
    buckets.set(filter._id, bucket);
    return bucket;
  } };
  const mocks = { '@/models/RateLimit': RateLimit, '@/utils/appError': AppError };
  const globals = { process: { env: { NEXTAUTH_SECRET: 'test-secret' } }, Date: class extends Date { static now() { return now; } } };
  const first = load('utils/rateLimit.ts', mocks, globals).enforceRateLimit;
  const second = load('utils/rateLimit.ts', mocks, globals).enforceRateLimit;
  await first('client:private@example.com', 2);
  await second('client:private@example.com', 2);
  await assert.rejects(first('client:private@example.com', 2), error => error.statusCode === 429 && error.retryAfter === 60);
  assert.equal(buckets.size, 1);
  assert.ok(!JSON.stringify(calls).includes('private@example.com'));
  assert.equal(+calls[0].update.$setOnInsert.expiresAt, 120_000);
  now = 120_000;
  await second('client:private@example.com', 2);
  assert.equal(buckets.size, 2);
});

test('untrusted client IP headers cannot bypass the shared fallback rate limit', () => {
  const req = { headers: new Headers({ 'x-forwarded-for': 'forged', 'x-real-ip': 'also-forged', 'x-vercel-forwarded-for': 'trusted, previous' }) };
  const mocks = { '@/models/RateLimit': {}, '@/utils/appError': AppError };
  assert.equal(load('utils/rateLimit.ts', mocks, { process: { env: {} } }).requestClientKey(req), 'shared');
  assert.equal(load('utils/rateLimit.ts', mocks, { process: { env: { VERCEL: '1' } } }).requestClientKey(req), 'trusted');
  assert.equal(load('utils/rateLimit.ts', mocks, { process: { env: { RATE_LIMIT_IP_HEADER: 'x-real-ip' } } }).requestClientKey(req), 'also-forged');
});

test('rate limiter retries a competing bucket insertion and fails closed on database errors', async () => {
  let attempts = 0;
  const rate = load('utils/rateLimit.ts', {
    '@/models/RateLimit': { findOneAndUpdate: async (_filter, _update, options) => {
      if (++attempts === 1) { assert.equal(options.upsert, true); throw Object.assign(new Error('duplicate'), { code: 11000 }); }
      assert.equal(options.upsert, undefined); return { count: 2 };
    } }, '@/utils/appError': AppError,
  }, { process: { env: { NEXTAUTH_SECRET: 'test-secret' } } });
  await assert.rejects(rate.enforceRateLimit('client', 1), error => error.statusCode === 429);
  assert.equal(attempts, 2);
  const unavailable = load('utils/rateLimit.ts', { '@/models/RateLimit': { findOneAndUpdate: async () => { throw new Error('DB down'); } }, '@/utils/appError': AppError }, { process: { env: { NEXTAUTH_SECRET: 'test-secret' } } });
  await assert.rejects(unavailable.enforceRateLimit('client', 1), /DB down/);
});

test('signup allowlists fields and validates bcrypt length before account creation', async () => {
  let saved;
  const route = load('app/api/signup/route.ts', {
    '@/utils/requestBody': load('utils/requestBody.ts', { '@/utils/appError': AppError }),
    '@/utils/rateLimit': { enforceRateLimit: async () => {}, requestClientKey: () => 'test' },
    '@/utils/appError': AppError, '@/lib/dbConnect': async () => {}, '@/utils/errorHandler': work => work,
    '@/models/User': { create: async data => { saved = data; return { ...data, _id: 'user-id' }; } },
  });
  const req = body => new Request('https://comments.example.com/api/signup', { method: 'POST', body: JSON.stringify(body) });
  const data = { name: '  Guest  ', email: 'guest@example.com', password: 'test-password', isEmailVerified: true, provider: 'google', _id: 'chosen-id', image: 'chosen-image' };
  const response = await route.POST(req(data));
  assert.deepEqual(saved, { name: 'Guest', email: data.email, password: data.password, provider: 'credentials' });
  assert.equal((await response.json()).data.password, undefined);
  for (const password of [undefined, '', 'é'.repeat(40)]) await assert.rejects(route.POST(req({ ...data, password })), error => error.statusCode === 400);
});

test('middleware checks the validated token and uses the configured session cookie name', () => {
  let options;
  load('middleware.ts', {
    'next-auth/middleware': { withAuth: (_fn, value) => { options = value; return () => {}; } },
    'next/server': { NextResponse: { next: () => ({}) } },
  });
  const req = { nextUrl: { pathname: '/dashboard' }, cookies: { get: () => 'forged-cookie' } };
  assert.equal(options.cookies.sessionToken.name, 'next-auth.session-token');
  assert.equal(options.callbacks.authorized({ req, token: null }), false);
  assert.equal(options.callbacks.authorized({ req, token: { sub: 'user' } }), true);
});

test('shared API wrapper blocks form CSRF before handlers and emits rate-limit retry headers', async () => {
  const config = { config: { envs: { dev: 'development' } } };
  const wrap = load('utils/errorHandler/index.ts', {
    '@/config': config,
    '@/utils/requestBody': load('utils/requestBody.ts', { '@/utils/appError': AppError }, { process: { env: { NEXTAUTH_URL: 'https://comments.example.com' } } }),
    './operationalErrors': {},
    '@/utils/logger': { info() {}, warn() {}, error() {}, debug() {}, log() {} },
  }, { process: { env: { NODE_ENV: 'production' } } }).default;
  let called = false;
  const handler = wrap(async () => { called = true; return new Response(); });
  const csrf = await handler(new Request('https://comments.example.com/api/comments', { method: 'POST', headers: { 'content-type': 'text/plain', origin: 'https://evil.example' }, body: '{}' }));
  assert.equal(csrf.status, 403);
  assert.equal(called, false);
  const limited = wrap(async () => { const error = new AppError('Slow down', 429); error.retryAfter = 12; throw error; });
  const response = await limited(new Request('https://comments.example.com/api/signup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }));
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('retry-after'), '12');
});

test('signup schema requires credentials passwords and enforces byte limits without breaking OAuth', async () => {
  const users = load('interfaces/IUser.ts');
  const User = load('models/User.ts', {
    '@/interfaces/IUser': users,
    '@/lib/createModel': (_name, schema) => mongoose.model('HardeningTestUser', schema),
    bcrypt: { hash: async () => 'hash', compare: async () => true },
  }).default;
  const user = { name: 'Test', email: 'test@example.com', provider: 'credentials' };
  await assert.rejects(new User(user).validate(), /Missing password/);
  await assert.rejects(new User({ ...user, password: 'é'.repeat(40) }).validate(), /72 UTF-8 bytes/);
  await new User({ ...user, provider: 'github' }).validate();
  await new User({ ...user, password: 'test-password' }).validate();
  const loaded = User.hydrate(user, { password: 0 });
  loaded.name = 'Updated';
  await loaded.validate();
});

test('reply submission updates the widget total and parent count without changing top-level totals', () => {
  let current = { comments: [{ _id: 'parent', repliesCount: 0 }], commentsCount: 1, totalCommentsAndReplies: 1, total: 1 };
  let stateCalls = 0;
  const Container = load('components/embed-comments/comments-container.tsx', {
    react: { useState: initial => {
      stateCalls++;
      return [initial, stateCalls === 3 ? update => { current = typeof update === 'function' ? update(current) : update; } : () => {}];
    } },
    './comment-mutations': { CommentMutationsContext: { Provider: 'provider' } },
    '@/utils/removeDeletedComment': {}, './login-hint': () => null,
    './input-comment': () => null, './comment-list': () => null, './fetch-more-comments': () => null,
  }).default;
  const view = Container({ data: current, parentSiteData: null });
  view.props.value.onReplyCreated('parent');
  assert.equal(current.total, 1);
  assert.equal(current.commentsCount, 2);
  assert.equal(current.totalCommentsAndReplies, 2);
  assert.equal(current.comments[0].repliesCount, 1);
});
