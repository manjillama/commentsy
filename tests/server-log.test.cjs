const { test, assert, load } = require('./helpers.cjs');

test('Winston formats JSON and configures a stdout-only console transport', () => {
  const winston = require('winston');
  const { PassThrough } = require('node:stream');
  const logger = load('utils/logger.ts').default;
  const consoleTransport = logger.transports[0];
  assert.ok(consoleTransport instanceof winston.transports.Console);
  assert.equal(Object.keys(consoleTransport.stderrLevels).length, 0);
  assert.equal(Object.keys(consoleTransport.consoleWarnLevels).length, 0);
  const output = new PassThrough();
  let line = '';
  output.on('data', chunk => { line += chunk.toString(); });
  logger.clear();
  logger.add(new winston.transports.Stream({ stream: output }));
  logger.error('db.connect.failed', { elapsedMs: 100 });
  const record = JSON.parse(line);
  assert.equal(record.level, 'error');
  assert.equal(record.service, 'commentsy');
  assert.equal(record.elapsedMs, 100);
  assert.ok(record.timestamp);
  logger.close();
});

test('shared API wrapper logs status and timing without query strings or raw errors', async () => {
  const records = [];
  const wrap = load('utils/errorHandler/index.ts', {
    '@/config': { config: { envs: { dev: 'development' } } },
    './operationalErrors': {},
    '@/utils/logger': {
      info: (message, fields) => records.push({ message, ...fields }),
      error: (message, fields) => records.push({ message, ...fields }),
      log: (level, message, fields) => records.push({ level, message, ...fields }),
    },
  }).default;
  const req = { method: 'POST', url: 'https://example.com/api/signup?token=secret' };
  const response = new Response(null, { status: 201 });
  const context = { params: { id: '123' } };
  assert.equal(await wrap(async (request, data) => {
    assert.equal(request, req);
    assert.equal(data, context);
    return response;
  })(req, context), response);
  assert.equal(records[0].message, 'api.request.started');
  assert.equal(records[1].status, 201);
  assert.equal(typeof records[1].elapsedMs, 'number');
  const failure = await wrap(async () => { throw new Error('private-password'); })(req);
  assert.equal(failure.status, 500);
  assert.equal(records.at(-1).level, 'error');
  assert.ok(records.every(record => record.path === '/api/signup'));
  assert.ok(!JSON.stringify(records).includes('secret'));
  assert.ok(!JSON.stringify(records).includes('private-password'));
});
