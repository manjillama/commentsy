const { test, assert, load, mongoose, gifUtils, gif, Comment, base } = require('./helpers.cjs');

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
