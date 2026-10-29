const { test, assert, load, Comment, base, gifUtils } = require('./helpers.cjs');

function recorder() {
  const records = [];
  const logger = Object.fromEntries(['debug', 'info', 'warn', 'error'].map(level => [level, (message, fields) => records.push({ level, message, ...fields })]));
  return { records, logger };
}
function apiWrapper(logger, globals = {}) {
  return load('utils/errorHandler/index.ts', {
    '@/utils/requestBody': { validateWriteRequest: () => {} },
    '@/config': { config: { envs: { dev: 'development' } } },
    './operationalErrors': {}, '@/utils/logger': logger,
  }, globals).default;
}

test('Winston formats JSON with request context and stdout-only transport', async () => {
  const winston = require('winston');
  const { PassThrough } = require('node:stream');
  const context = load('utils/logContext.ts');
  const logger = load('utils/logger.ts', { '@/utils/logContext': context }).default;
  const transport = logger.transports[0];
  assert.ok(transport instanceof winston.transports.Console);
  assert.equal(Object.keys(transport.stderrLevels).length, 0);
  assert.equal(Object.keys(transport.consoleWarnLevels).length, 0);
  const output = new PassThrough();
  let line = '';
  output.on('data', chunk => { line += chunk.toString(); });
  logger.clear();
  logger.add(new winston.transports.Stream({ stream: output }));
  context.withRequestLogContext({ requestId: 'test-request', method: 'POST', path: '/api/comments' }, () => logger.info('comment.moderated', { commentId: 'comment-id' }));
  const record = JSON.parse(line);
  assert.equal(record.level, 'info');
  assert.equal(record.service, 'commentsy');
  assert.equal(record.requestId, 'test-request');
  assert.equal(record.commentId, 'comment-id');
  assert.ok(record.timestamp);
  logger.close();
});

test('successful requests including repeated session polls produce no API logs', async () => {
  const { records, logger } = recorder();
  const wrap = apiWrapper(logger);
  const req = { method: 'GET', url: 'https://example.com/api/auth/session?token=secret' };
  const ids = new Set();
  for (let index = 0; index < 5; index++) {
    const response = await wrap(async () => Response.json({ user: null }))(req);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { user: null });
    assert.ok(response.headers.get('x-request-id'));
    ids.add(response.headers.get('x-request-id'));
  }
  assert.equal(ids.size, 5);
  assert.deepEqual(records, []);
});

test('unexpected API failures emit one useful error without query strings or raw error data', async () => {
  const { records, logger } = recorder();
  const req = { method: 'POST', url: 'https://example.com/api/comments?token=secret' };
  const error = new Error('private-password guest@example.com mongodb://user:password@db');
  error.stack = 'Error: private-password\n    at handler (/app/services/commentService.ts:10:2)\n    at provider (https://external.example/secret:1:2)';
  error.code = 123;
  error.operation = 'comment.created';
  const response = await apiWrapper(logger)(async () => { throw error; })(req);
  assert.equal(response.status, 500);
  assert.equal(records.length, 1);
  assert.equal(records[0].level, 'error');
  assert.equal(records[0].message, 'api.failed');
  assert.equal(records[0].requestId, response.headers.get('x-request-id'));
  assert.equal(records[0].operation, 'comment.created');
  assert.equal(records[0].errorCode, 123);
  assert.deepEqual(records[0].locations, ['/app/services/commentService.ts:10:2']);
  assert.equal(typeof records[0].elapsedMs, 'number');
  for (const privateValue of ['token', 'secret', 'private-password', 'guest@example.com', 'mongodb://', 'external.example'])
    assert.ok(!JSON.stringify(records).includes(privateValue));
});

test('validation is debug-only, access denials warn, and rate-limit responses are not logged twice', async () => {
  const AppError = load('utils/appError.ts').default;
  const { records, logger } = recorder();
  const req = { method: 'POST', url: 'https://example.com/api/comments' };
  const wrap = apiWrapper(logger);
  for (const status of [400, 401, 403, 429]) {
    const before = records.length;
    const response = await wrap(async () => { throw new AppError('expected rejection', status); })(req);
    assert.equal(response.status, status);
    if (status === 429) assert.equal(records.length, before);
    else assert.equal(records.at(-1).level, status === 400 ? 'debug' : 'warn');
  }
});

test('returned server errors and slow successes remain visible without ordinary completion logs', async () => {
  const { records, logger } = recorder();
  let now = 0;
  const wrap = apiWrapper(logger, { Date: { now: () => now } });
  const req = { method: 'GET', url: 'https://example.com/api/comments' };
  await wrap(async () => new Response(null, { status: 503 }))(req);
  assert.equal(records[0].message, 'api.failed');
  await wrap(async () => { now = 6000; return new Response('ok'); })(req);
  assert.equal(records[1].message, 'api.slow');
  assert.equal(records[1].elapsedMs, 6000);
  assert.equal(records[1].level, 'warn');
});

test('request context survives awaits and never crosses concurrent requests', async () => {
  const { withRequestLogContext, requestLogContext } = load('utils/logContext.ts');
  await Promise.all(['one', 'two'].map(requestId => withRequestLogContext({ requestId, method: 'POST', path: '/api/comments' }, async () => {
    await Promise.resolve();
    assert.equal(requestLogContext().requestId, requestId);
  })));
  assert.deepEqual(requestLogContext(), {});
});

test('moderation events occur only after transaction commit, never for rolled-back writes', async () => {
  const { records, logger } = recorder();
  const AppError = load('utils/appError.ts').default;
  let abortCommit = false;
  const record = { _id: 'comment-id', group: { _id: 'group-id', owner: 'owner' }, status: 'pending', isSpam: false, save: async function () { return this; } };
  const service = load('services/commentService.ts', {
    '@/utils/logger': logger,
    mongoose: { connection: { transaction: async work => { await work({}); assert.equal(records.length, 0); if (abortCommit) throw new Error('commit failed'); } } },
    '@/utils/gif': gifUtils, '@/utils/appError': AppError,
    '@/interfaces/IGroup': { COMMENT_STATUS: { approved: 'approved', deleted: 'deleted' } },
    '@/interfaces/IUser': { AVATAR_BACKGROUND_COLORS: [] },
    '@/models/App': {}, '@/models/Comment': { findById: () => ({ populate: async () => record }) },
    '@/models/Group': { updateOne: async () => {} }, './factoryService': {},
  }).default;
  await service.updateCommentStatus({ commentId: 'comment-id', userId: 'owner', status: 'approved' });
  assert.equal(records.length, 1);
  assert.equal(records[0].message, 'comment.moderated');
  assert.equal(records[0].status, 'approved');
  records.length = 0;
  record.status = 'pending';
  abortCommit = true;
  await assert.rejects(service.updateCommentStatus({ commentId: 'comment-id', userId: 'owner', status: 'approved' }), /commit failed/);
  assert.deepEqual(records, []);
});

test('rate-limit bursts emit one warning per bucket window without logging client identity', async () => {
  const { records, logger } = recorder();
  const AppError = load('utils/appError.ts').default;
  let count = 0;
  const limiter = load('utils/rateLimit.ts', {
    '@/utils/logger': logger, '@/utils/appError': AppError,
    '@/models/RateLimit': { findOneAndUpdate: async () => ({ count: ++count }) },
  }, { process: { env: { NEXTAUTH_SECRET: 'test-secret' } } });
  for (let index = 0; index < 5; index++) {
    try { await limiter.enforceRateLimit('login:private-client-ip', 1); } catch (error) { assert.equal(error.statusCode, 429); }
  }
  assert.equal(records.length, 1);
  assert.equal(records[0].message, 'rate_limit.exceeded');
  assert.equal(records[0].scope, 'login');
  assert.ok(!JSON.stringify(records).includes('private-client-ip'));
});
