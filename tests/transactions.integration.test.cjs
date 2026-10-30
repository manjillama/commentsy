const { randomBytes } = require('node:crypto');
const { test, assert, load, mongoose } = require('./helpers.cjs');

// This suite uses a unique database, never the database named in the URI.
// A replica set is required; CI starts one and supplies MONGODB_URI_TEST.
test('real MongoDB transactions preserve counts under concurrency and roll back partial failures', {
  skip: !process.env.MONGODB_URI_TEST,
  timeout: 90_000,
}, async () => {
  const database = `commentsy_test_${randomBytes(12).toString('hex')}`;
  try {
    await mongoose.connect(process.env.MONGODB_URI_TEST, { dbName: database, serverSelectionTimeoutMS: 10_000 });
    const createModel = (name, schema) => mongoose.model(name, schema);
    const AppError = load('utils/appError.ts').default;
    const statuses = load('interfaces/IGroup.ts');
    const users = load('interfaces/IUser.ts');
    const styles = load('utils/commentStyles.ts');
    const App = load('models/App.ts', {
      '@/lib/createModel': createModel, '@/utils/commentStyles': styles,
      nanoid: { nanoid: () => randomBytes(6).toString('hex') },
    }).default;
    const Group = load('models/Group.ts', { '@/lib/createModel': createModel }).default;
    const Comment = load('models/Comment.ts', {
      '@/lib/createModel': createModel, '@/utils/gif': load('utils/gif.ts'),
      '@/interfaces/IGroup': statuses, '@/interfaces/IUser': users,
    }).default;
    await Promise.all([App.init(), Group.init(), Comment.init()]);
    let failCountWrite = false;
    const service = load('services/commentService.ts', {
      '@/utils/gif': load('utils/gif.ts'), '@/utils/appError': AppError,
      '@/interfaces/IGroup': statuses, '@/interfaces/IUser': users,
      '@/models/App': App, '@/models/Comment': Comment,
      '@/models/Group': {
        findOne: (...args) => Group.findOne(...args),
        updateOne: async (...args) => {
          const result = await Group.updateOne(...args);
          if (failCountWrite) throw new Error('injected counter failure');
          return result;
        },
      }, './factoryService': {},
    }).default;
    const owner = new mongoose.Types.ObjectId();
    const app = await App.create({ name: 'Test', description: 'Transaction tests', user: owner, authorizedOrigins: ['https://example.com'] });
    const group = await Group.create({ identifier: 'post', app: app._id, owner });
    const submission = { appCode: app.code, groupIdentifier: 'post', comment: 'Hello', pageTitle: 'Post', pageUrl: 'https://example.com/post', userId: String(owner) };
    const posted = await Promise.all(Array.from({ length: 12 }, () => service.createComment(submission)));
    assert.equal(await Comment.countDocuments({ group: group._id }), 12);
    assert.equal((await Group.findById(group._id)).commentsCount, 12);
    assert.ok(posted.every(comment => comment?._id));

    failCountWrite = true;
    await assert.rejects(service.createComment(submission), /injected counter failure/);
    assert.equal(await Comment.countDocuments({ group: group._id }), 12);
    assert.equal((await Group.findById(group._id)).commentsCount, 12);
    failCountWrite = false;

    const parent = posted[0];
    await Promise.all(Array.from({ length: 8 }, () => service.createComment({ ...submission, parentCommentId: String(parent._id) })));
    assert.equal((await Comment.findById(parent._id)).repliesCount, 8);
    assert.equal((await Group.findById(group._id)).commentsCount, 20);
    const deletions = await Promise.allSettled([
      service.deleteOwnComment(String(parent._id), String(owner)),
      service.deleteOwnComment(String(parent._id), String(owner)),
    ]);
    assert.equal(deletions.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal((await Group.findById(group._id)).commentsCount, 19);
    assert.equal(await Comment.countDocuments({ parent: parent._id, status: 'approved' }), 8);
    await assert.rejects(service.createComment({ ...submission, parentCommentId: String(parent._id) }), /Replies are closed/);

    await App.updateOne({ _id: app._id }, { requireGuestApproval: true });
    const pending = await service.createComment({ ...submission, userId: undefined, anonUser: { name: 'Guest', email: 'guest@example.com' } });
    assert.equal(pending.status, 'pending');
    assert.equal((await Group.findById(group._id)).commentsCount, 19);
    await service.updateCommentStatus({ commentId: String(pending._id), userId: String(owner), status: 'approved' });
    assert.equal((await Group.findById(group._id)).commentsCount, 20);

    const RateLimit = load('models/RateLimit.ts', { '@/lib/createModel': createModel }).default;
    await RateLimit.init();
    const limiter = load('utils/rateLimit.ts', { '@/models/RateLimit': RateLimit, '@/utils/appError': AppError }, { process: { env: { NEXTAUTH_SECRET: 'integration-test-secret' } } });
    const limits = await Promise.allSettled(Array.from({ length: 10 }, () => limiter.enforceRateLimit('test-client', 3, 3_600_000)));
    assert.equal(limits.filter(result => result.status === 'fulfilled').length, 3);
    assert.ok(limits.filter(result => result.status === 'rejected').every(result => result.reason.statusCode === 429));
  } finally {
    if (mongoose.connection.readyState === 1 && mongoose.connection.name === database) await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});
