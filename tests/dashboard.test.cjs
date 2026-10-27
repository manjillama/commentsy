const { test, assert, load, mongoose, gifUtils, gif, Comment, base } = require('./helpers.cjs');

test('dashboard comment history is scoped to the signed-in author and paginated safely', async () => {
  const queries = [];
  let skipped;
  let limited;
  const chain = {
    select() { return this; }, sort() { return this; },
    skip(value) { skipped = value; return this; },
    limit(value) { limited = value; return this; },
    lean: async () => [{ _id: 'own-comment', user: 'author', comment: 'hello' }],
  };
  const service = load('services/commentService.ts', {
    '@/utils/gif': gifUtils, '@/models/App': {}, '@/models/Group': {}, './factoryService': {},
    '@/models/Comment': {
      countDocuments: async filter => { queries.push(filter); return 22; },
      find: filter => { queries.push(filter); return chain; },
    },
    '@/utils/appError': class AppError extends Error {},
    '@/interfaces/IGroup': { COMMENT_STATUS: { approved: 'approved' } },
    '@/interfaces/IUser': { AVATAR_BACKGROUND_COLORS: [] },
  }).default;
  const page = await service.getOwnComments('author', 999);
  assert.equal(page.total, 22);
  assert.equal(page.pages, 3);
  assert.equal(page.page, 3);
  assert.equal(skipped, 20);
  assert.equal(limited, 10);
  for (const query of queries) {
    assert.equal(query.user, 'author');
    assert.equal(query.status, 'approved');
    assert.equal(query.isSpam, false);
  }
  assert.equal((await service.getOwnComments('author', -5)).page, 1);
});
