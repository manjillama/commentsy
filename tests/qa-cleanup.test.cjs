const { test, assert, load } = require('./helpers.cjs');

async function runCleanup({ apply = false, unexpectedSite = false, unexpectedContent = false, databaseError = false } = {}) {
  const writes = [], logs = [];
  let finish;
  const done = new Promise(resolve => { finish = resolve; });
  const collections = {};
  for (const name of ['users', 'apps', 'comments', 'groups']) collections[name] = {
    findOne: async () => ({ _id: 'qa-user' }),
    find: () => ({ toArray: async () => [{ _id: 'qa-site', name: unexpectedSite ? 'Real site' : 'Pilot QA 20261029' }] }),
    countDocuments: async filter => filter.$or ? Number(unexpectedContent) : (filter.app?.$nin || filter.owner) ? 0 : 2,
    deleteMany: async (filter, options) => { assert.ok(options.session); writes.push({ name, filter }); },
    deleteOne: async (filter, options) => { assert.ok(options.session); writes.push({ name, filter }); },
  };
  const process = { argv: ['node', 'cleanup', ...(apply ? ['--apply'] : [])], env: { MONGODB_URI: 'test-uri' }, cwd: () => '/project' };
  load('scripts/cleanup-pilot-qa.cjs', {
    mongoose: {
      connect: async () => { if (databaseError) throw new Error('mongodb://private-password@host'); },
      connection: { db: { collection: name => collections[name] }, transaction: work => work({ session: true }) },
      disconnect: async () => { finish(); },
    },
    '@next/env': { loadEnvConfig() {} },
  }, { process, console: { log: value => logs.push(value), error: value => logs.push(value) } });
  await done;
  return { writes, logs, process };
}

test('QA cleanup defaults to preview and never writes', async () => {
  const result = await runCleanup();
  assert.deepEqual(result.writes, []);
  assert.equal(JSON.parse(result.logs[0]).action, 'preview');
});

test('QA cleanup refuses unexpected sites and content', async () => {
  for (const options of [{ unexpectedSite: true }, { unexpectedContent: true }]) {
    const result = await runCleanup({ apply: true, ...options });
    assert.deepEqual(result.writes, []);
    assert.equal(result.process.exitCode, 1);
  }
});

test('QA cleanup applies only the checked account and site IDs within a transaction', async () => {
  const result = await runCleanup({ apply: true });
  assert.deepEqual(result.writes.map(write => write.name), ['comments', 'groups', 'apps', 'users']);
  assert.deepEqual(result.writes[0].filter, { app: { $in: ['qa-site'] } });
  assert.deepEqual(result.writes[3].filter, { _id: 'qa-user' });
  assert.equal(JSON.parse(result.logs[0]).action, 'removed');
});

test('QA cleanup connection failures do not expose driver messages or credentials', async () => {
  const result = await runCleanup({ databaseError: true });
  assert.equal(result.process.exitCode, 1);
  assert.ok(!JSON.stringify(result.logs).includes('private-password'));
  assert.deepEqual(result.writes, []);
});
