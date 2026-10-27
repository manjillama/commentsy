const { test, assert, load, mongoose, gifUtils, gif, Comment, base } = require('./helpers.cjs');

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
  assert.ok(found.editedAt instanceof Date);
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
