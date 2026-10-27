const { test, assert, load, mongoose, gifUtils, gif, Comment, base } = require('./helpers.cjs');

test('session cookie supports local HTTP while preserving HTTPS embed settings', () => {
  const { sessionCookieOptions } = load('utils/sessionCookie.ts', {}, { URL });
  const local = sessionCookieOptions('http://localhost:3000', false);
  assert.equal(local.secure, false);
  assert.equal(local.sameSite, 'lax');
  const deployed = sessionCookieOptions('https://comments.example.com', true);
  assert.equal(deployed.secure, true);
  assert.equal(deployed.sameSite, 'none');
  assert.equal(deployed.httpOnly, true);
  assert.equal(sessionCookieOptions(undefined, true).secure, true);
  assert.equal(sessionCookieOptions('https://localhost:3000', false).secure, true);
});

test('credentials normalize email, validate passwords, and preserve provider restrictions', async () => {
  let record = { _id: 'user-id', provider: 'credentials', name: 'User', email: 'user@example.com', password: 'stored-hash', validatePassword: async (password, hash) => password === 'correct-password' && hash === 'stored-hash' };
  const service = load('services/authService.ts', {
    '@/models/User': { findOne: query => {
      assert.equal(query.email, 'user@example.com');
      return { select: async field => { assert.equal(field, '+password'); return record; } };
    } },
    '@/interfaces/IUser': { EProviders: { credentials: 'credentials' }, AVATAR_BACKGROUND_COLORS: [] },
    '@/utils/appError': class AppError extends Error {},
  }).default;
  assert.equal((await service.getLoginUserFromCredentials({ email: ' USER@example.com ', password: 'correct-password' })).id, 'user-id');
  assert.equal(await service.getLoginUserFromCredentials({ email: 'user@example.com', password: 'wrong' }), null);
  await assert.rejects(service.getLoginUserFromCredentials({ email: '', password: '' }), /CredentialsSigninMissing/);
  record = { ...record, provider: 'github' };
  await assert.rejects(service.getLoginUserFromCredentials({ email: 'user@example.com', password: 'correct-password' }), /OAuthAccountNotLinked/);
});

test('credentials login never silently redirects when the browser drops its session cookie', async () => {
  let retainedUser;
  let result = { ok: true, error: null, url: 'http://localhost:3000/dashboard' };
  const login = load('utils/credentialsLogin.ts', {
    'next-auth/react': { signIn: async (provider, options) => {
      assert.equal(provider, 'credentials');
      assert.equal(options.email, 'user@example.com');
      assert.equal(options.password, 'autofilled-password');
      assert.equal(options.callbackUrl, '/dashboard');
      return result;
    } },
    '@/utils/embedSession': { fetchEmbedUser: async () => retainedUser },
  });
  const submit = () => login.credentialsLogin('user@example.com', 'autofilled-password', '/dashboard');
  await assert.rejects(submit(), /SessionCookieBlocked/);
  retainedUser = { id: 'author' };
  assert.equal(await submit(), 'http://localhost:3000/dashboard');
  result = { ok: false, error: 'CredentialsSignin', url: null };
  await assert.rejects(submit(), /CredentialsSignin/);
});
