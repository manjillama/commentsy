const { test, assert, load, Comment } = require('./helpers.cjs');
const { parseQueryFilter } = load('utils/apiFeatures.ts', {
  '../config': { config: { defaultTimeZone: 'UTC' } },
});

test('removed-thread filters preserve MongoDB operators and cast against the comment schema', () => {
  const filter = parseQueryFilter({
    parent: null,
    $or: [
      { status: 'approved', isSpam: false },
      { repliesCount: { $gt: 0 }, $or: [{ status: 'deleted' }, { isSpam: true }] },
    ],
    limit: 20, page: 1, fields: 'comment', sort: '-createdAt',
  });
  assert.equal(filter.$or[1].repliesCount.$gt, 0);
  assert.equal(filter.limit, undefined);
  assert.doesNotThrow(() => Comment.find(filter).cast(Comment));
  assert.doesNotThrow(() => Comment.countDocuments(filter).cast(Comment));
});

test('filter shorthand converts only operator keys and preserves literal text', () => {
  const filter = parseQueryFilter({
    repliesCount: { gt: 0, lte: 3 },
    comment: 'gt lte $gt',
    $or: [{ repliesCount: { gte: 1 } }, { repliesCount: { $lt: 5 } }],
  });
  assert.deepEqual(filter, {
    repliesCount: { $gt: 0, $lte: 3 },
    comment: 'gt lte $gt',
    $or: [{ repliesCount: { $gte: 1 } }, { repliesCount: { $lt: 5 } }],
  });
});
