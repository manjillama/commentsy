const { test, assert, load } = require('./helpers.cjs');
const AppError = load('utils/appError.ts').default;
const statuses = { COMMENT_STATUS: { pending: 'pending', approved: 'approved', deleted: 'deleted' } };

function authOptions(keys) {
  return load('app/api/auth/[...nextauth]/options.ts', {
    '@/config': { keys }, '@/services/authService': {}, '@/lib/dbConnect': async () => {}, '@/models/User': {},
    '@/utils/sessionCookie': { sessionCookieOptions: () => ({}) }, '@/utils/authRedirect': {},
  }).options;
}

test('OAuth providers are registered only when both credentials are configured', () => {
  for (const [keys, expected] of [
    [{}, ['credentials']],
    [{ GITHUB_ID: 'id' }, ['credentials']],
    [{ GITHUB_ID: 'id', GITHUB_SECRET: '  ' }, ['credentials']],
    [{ GITHUB_ID: 'id', GITHUB_SECRET: 'secret' }, ['github', 'credentials']],
    [{ GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 'secret' }, ['google', 'credentials']],
    [{ GITHUB_ID: 'id', GITHUB_SECRET: 'secret', GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 'secret' }, ['github', 'google', 'credentials']],
  ]) assert.deepEqual(authOptions(keys).providers.map(provider => provider.id), expected);
});

test('credentials-only sign-in/up show their forms immediately with no dead alternative button', () => {
  for (const kind of ['signin', 'signup']) {
    let initialState;
    const Form = () => null;
    const Wrapper = load(`components/${kind}/${kind}-wrapper.tsx`, {
      react: { useState: value => { initialState = value; return [value, () => {}]; } },
      [`./${kind}-form`]: Form,
      '../oauth-providers': () => null, '../auth/auth-layout': () => null, '../auth/auth.module.css': {},
    }).default;
    const view = Wrapper({ providers: { credentials: { id: 'credentials', type: 'credentials' } } });
    assert.equal(initialState, true);
    const content = view.props.children;
    assert.equal(content.props.children[0].type, Form);
    assert.equal(content.props.children[1], false);
  }
});

function route(file, mocks = {}) {
  const options = { options: {} };
  return load(file, {
    '@/utils/errorHandler': work => work, '@/utils/appError': AppError,
    '@/lib/dbConnect': async () => {},
    '@/utils/requestBody': { readJsonBody: req => req.json() },
    '@/app/api/auth/[...nextauth]/options': options,
    '../auth/[...nextauth]/options': options, '../../auth/[...nextauth]/options': options,
    'next-auth': { getServerSession: async () => null },
    ...mocks,
  });
}

test('all private routes reject missing identities before invoking services', async () => {
  const cases = [
    ['app/api/apps/route.ts', ['GET', 'POST'], '@/services/appService'],
    ['app/api/apps/[id]/route.ts', ['PATCH'], '@/services/appService'],
    ['app/api/apps/[id]/comments/route.ts', ['GET'], '@/services/commentService'],
    ['app/api/apps/[id]/comments/[commentId]/status/route.ts', ['PATCH'], '@/services/commentService'],
    ['app/api/apps/[id]/comments/[commentId]/mark-as-spam/route.ts', ['PATCH'], '@/services/commentService'],
    ['app/api/comments/[id]/route.ts', ['PATCH', 'DELETE'], '@/services/commentService'],
    ['app/api/account/route.ts', ['PATCH', 'POST'], '@/services/accountService'],
  ];
  for (const identity of [null, { user: {} }]) {
    for (const [file, methods, service] of cases) {
      const handlers = route(file, {
        'next-auth': { getServerSession: async () => identity },
        [service]: new Proxy({}, { get(_target, key) { return key === '__esModule' ? false : () => { throw new Error('private service must not be called'); }; } }),
      });
      for (const method of methods) {
        const req = new Request('https://comments.example.com/api/test', { method, ...(method === 'GET' ? {} : { body: '{}' }) });
        await assert.rejects(handlers[method](req, { params: { id: 'site', commentId: 'comment' } }), error => [401, 403].includes(error.statusCode), `${file} ${method}`);
      }
    }
  }
});

test('site updates and comment reads enforce the current owner even with forged input filters', async () => {
  const app = { _id: 'site', user: 'owner', name: 'Original' };
  let saved = false;
  const App = {
    findOne: query => {
      const found = query.user === app.user && query._id === app._id ? app : null;
      return { lean: async () => found, then: resolve => Promise.resolve(found).then(resolve) };
    },
  };
  const apps = load('services/appService.ts', {
    '@/models/App': App, '@/utils/appError': AppError, '@/utils/commentStyles': {},
  }).default;
  await assert.rejects(apps.updateApp('site', { name: 'Attacker', user: 'owner' }, 'attacker'));
  assert.equal(app.name, 'Original');
  for (const user of [undefined, '']) await assert.rejects(apps.getAppsByUserId(user), error => error.statusCode === 401);
  const comments = load('services/commentService.ts', {
    '@/models/App': App, '@/models/Comment': {}, '@/models/Group': {},
    '@/utils/appError': AppError, '@/utils/gif': {}, '@/interfaces/IGroup': statuses, '@/interfaces/IUser': {},
    './factoryService': { find: () => { saved = true; } },
  }).default;
  await assert.rejects(comments.getAllAppComments({ appId: 'site', userId: 'attacker', queryParams: { user: 'owner', app: 'site' } }));
  assert.equal(saved, false);
});

test('moderation refuses another owner and a comment ID placed under the wrong site URL', async () => {
  let writes = 0;
  const comment = { _id: 'comment', app: 'site-a', group: { owner: 'owner' }, user: 'author', status: 'approved', isSpam: false,
    save: async () => { writes++; } };
  const service = load('services/commentService.ts', {
    mongoose: { connection: { transaction: work => work({}) } },
    '@/models/App': {}, '@/models/Group': { updateOne: async () => { writes++; } },
    '@/models/Comment': { findById: () => ({ populate: async () => comment }) },
    '@/utils/appError': AppError, '@/utils/gif': {}, '@/interfaces/IGroup': statuses, '@/interfaces/IUser': {}, './factoryService': {},
  }).default;
  for (const method of ['updateCommentStatus', 'markCommentAsSpam']) {
    await assert.rejects(service[method]({ commentId: 'comment', appId: 'site-a', userId: 'attacker', status: 'deleted' }), error => error.statusCode === 403);
    await assert.rejects(service[method]({ commentId: 'comment', appId: 'site-b', userId: 'owner', status: 'deleted' }), error => error.statusCode === 404);
  }
  assert.equal(writes, 0);
});

test('mutation routes derive account identity from the session and bind moderation to the URL site', async () => {
  const calls = [];
  const session = { user: { id: 'current-user' } };
  const identity = { 'next-auth': { getServerSession: async () => session } };
  const req = () => new Request('https://comments.example.com/api/test', { method: 'POST', body: JSON.stringify({ userId: 'forged-user', name: 'Name', status: 'deleted' }) });
  for (const [file, method] of [
    ['app/api/apps/[id]/comments/[commentId]/status/route.ts', 'updateCommentStatus'],
    ['app/api/apps/[id]/comments/[commentId]/mark-as-spam/route.ts', 'markCommentAsSpam'],
  ]) {
    const handler = route(file, { ...identity, '@/services/commentService': { [method]: async data => { calls.push(data); return {}; } } });
    await handler.PATCH(req(), { params: { id: 'site', commentId: 'comment' } });
    assert.equal(calls.at(-1).userId, 'current-user');
    assert.equal(calls.at(-1).appId, 'site');
  }
  const account = route('app/api/account/route.ts', {
    ...identity, '@/services/accountService': { updateProfile: async id => { calls.push(id); return {}; }, changePassword: async id => { calls.push(id); } },
  });
  await account.PATCH(req());
  await account.POST(req());
  assert.deepEqual(calls.slice(-2), ['current-user', 'current-user']);
});
