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
    const parent = { app: base.app, group: base.group, status: 'approved', repliesCount: 0, save: async () => {} };
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
  found = { $locals: {}, _id: 'comment-id', user: 'author', group: 'group-id', status: 'approved', comment: 'old', gif, save: async function () { return this; } };
  await service.updateOwnComment('comment-id', 'author', { comment: 'new', gif: null });
  assert.equal(found.comment, 'new');
  assert.ok(found.editedAt instanceof Date);
  assert.equal(found.gif, undefined);
  await assert.rejects(service.updateOwnComment('comment-id', 'author', { comment: '', gif: null }), /Add a comment/);
  await assert.rejects(service.updateOwnComment('comment-id', 'author', { comment: 'new', gif: {} }), /Invalid GIF/);
  await service.deleteOwnComment('comment-id', 'author');
  assert.equal(found.status, 'deleted');
  assert.equal(calls.some(call => call[0] === 'replies'), false);
  assert.equal(calls.find(call => call[0] === 'group')[2].$inc.commentsCount, -1);
  calls.length = 0;
  found = { ...found, status: 'approved', parent: 'parent-id' };
  await service.deleteOwnComment('comment-id', 'author');
  assert.equal(calls.some(call => call[0] === 'replies'), false);
  assert.equal(calls.find(call => call[0] === 'parent')[1]._id, 'parent-id');
  assert.equal(calls.find(call => call[0] === 'group')[2].$inc.commentsCount, -1);
});

test('embedded deletion updates counts and lists without navigating the iframe', () => {
  const { removeDeletedComment } = load('utils/removeDeletedComment.ts');
  const parent = { _id: 'parent', repliesCount: 2 };
  const other = { _id: 'other', repliesCount: 0 };
  const original = { comments: [parent, other], total: 2, totalCommentsAndReplies: 4, commentsCount: 4 };
  const afterReply = removeDeletedComment(original, { _id: 'reply', parent: 'parent' }, 1);
  assert.equal(afterReply.comments[0].repliesCount, 1);
  assert.equal(afterReply.total, 2);
  assert.equal(afterReply.totalCommentsAndReplies, 3);
  const afterParent = removeDeletedComment(afterReply, { _id: 'parent', repliesCount: 1 }, 1);
  assert.equal(afterParent.comments.length, 2);
  assert.equal(afterParent.comments[0].status, 'deleted');
  assert.equal(afterParent.comments[0].comment, '');
  assert.equal(afterParent.total, 2);
  assert.equal(afterParent.totalCommentsAndReplies, 2);
  assert.equal(original.comments.length, 2);
});


test('reply creation rejects removed, nested, missing, and unrelated parents', async () => {
  for (const parent of [null,
    { status: 'deleted' }, { status: 'approved', isSpam: true },
    { status: 'approved', parent: 'nested' },
    { status: 'approved', app: 'other', group: base.group },
    { status: 'approved', app: base.app, group: 'other' },
  ]) {
    const service = load('services/commentService.ts', {
      '@/utils/gif': gifUtils,
      '@/models/App': { findOne: async () => ({ _id: base.app }) },
      '@/models/Group': { findOne: async () => ({ _id: base.group }) },
      '@/models/Comment': { findById: async () => parent }, './factoryService': {},
      '@/utils/appError': class AppError extends Error {},
      '@/interfaces/IGroup': { COMMENT_STATUS: { approved: 'approved' } },
      '@/interfaces/IUser': { AVATAR_BACKGROUND_COLORS: [] },
    }).default;
    await assert.rejects(service.createComment({ appCode: 'app', groupIdentifier: 'post',
      comment: 'reply', pageTitle: base.pageTitle, pageUrl: base.pageUrl,
      parentCommentId: 'parent', userId: String(base.user),
    }), /Replies are closed/);
  }
});

test('public threads retain removal notices without leaking deleted content', async () => {
  let filter;
  const service = load('services/publicCommentService.ts', {
    '@/utils/commentStyles': { parseCommentStyles: () => ({}) },
    '@/models/App': {}, '@/models/Comment': {}, '@/models/Group': { findOne: () => ({ lean: async () => ({ _id: 'group' }) }) },
    '@/utils/appError': class AppError extends Error {},
    '@/interfaces/IGroup': { COMMENT_STATUS: { approved: 'approved', deleted: 'deleted' } },
    './factoryService': { find: (_, query) => {
      filter = query;
      return { populate() { return this; }, exec: async () => [[
        { _id: 'parent', status: 'deleted', repliesCount: 2, comment: 'secret', gif, user: 'author', anonUser: { email: 'private' } },
        { _id: 'spam', status: 'approved', isSpam: true, repliesCount: 1, comment: 'spam' },
      ], 2, 20] };
    } },
  }).default;
  const [comments] = await service.getAllGroupComments('post', {});
  assert.equal(filter.parent, null);
  assert.equal(filter.$or[1].repliesCount.$gt, 0);
  await service.getAllCommentReplies('parent', {});
  assert.equal(filter.status, 'approved');
  assert.equal(filter.isSpam, false);
  for (const comment of comments) {
    assert.equal(comment.status, 'deleted');
    assert.equal(comment.comment, '');
    assert.equal(comment.gif, undefined);
    assert.equal(comment.user, undefined);
    assert.equal(comment.anonUser, undefined);
  }
});

test('guest emails stay stored but never appear in serialized comment responses', async () => {
  const guest = new Comment({ ...base, user: undefined, comment: 'Hello', anonUser: {
    name: 'Guest', email: 'private@example.com', avatarBackgroundColor: '#fed0bb',
  } });
  await guest.validate();
  assert.equal(guest.anonUser.email, 'private@example.com');
  assert.equal(Comment.schema.path('anonUser').schema.path('email').options.select, false);
  for (const response of [guest.toJSON(), guest.toObject(), JSON.parse(JSON.stringify(guest))]) {
    assert.equal(response.anonUser.email, undefined);
    assert.equal(response.commentUser.email, undefined);
    assert.equal(response.anonUser.name, 'Guest');
    assert.equal(response.commentUser.name, 'Guest');
    assert.equal(response.commentUser.avatarBackgroundColor, '#fed0bb');
    assert.ok(!JSON.stringify(response).includes('private@example.com'));
  }
  // Serialization must not erase the stored field or break subsequent saves.
  assert.equal(guest.anonUser.email, 'private@example.com');
  await guest.validate();
});
