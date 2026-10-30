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
  let record = { _id: 'user-id', provider: 'credentials', isEmailVerified: true, name: 'User', email: 'user@example.com', password: 'stored-hash', validatePassword: async (password, hash) => password === 'correct-password' && hash === 'stored-hash' };
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

test('duplicate email errors explain account recovery without exposing database details', () => {
  const errors = load('utils/errorHandler/operationalErrors.ts', { '../appError': load('utils/appError.ts').default }).default;
  for (const detail of [
    { message: 'database error', keyPattern: { email: 1 } },
    { message: 'E11000 duplicate key index: email_1 dup key: secret@example.com' },
  ]) {
    const result = errors.handleDuplicateFieldsDB(detail);
    assert.match(result.message, /An account with this email already exists/);
    assert.ok(!result.message.includes('secret@example.com'));
  }
  assert.match(errors.handleDuplicateFieldsDB({ message: 'unknown duplicate' }).message, /already in use/);
});

test('unverified credentials sign-in opens confirmation page without requiring a session', async () => {
  const login = load('utils/credentialsLogin.ts', {
    'next-auth/react': { signIn: async () => ({ ok: false, error: 'EmailNotVerified', url: null }) },
    '@/utils/embedSession': { fetchEmbedUser: async () => { throw new Error('Must not check a session before verification'); } },
  });
  assert.equal(await login.credentialsLogin(' User+test@example.com ', 'correct-password', '/dashboard'), '/verify-email#email=user%2Btest%40example.com');
});

test('OAuth provider mismatch rejects before changing the existing account or sending email', async () => {
  for (const provider of ['github', 'credentials', 'google']) {
    let saves = 0;
    let welcomes = 0;
    const record = { _id: 'existing', provider, image: 'original-avatar', isEmailVerified: true, welcomeEmailPending: true, save: async () => { saves++; } };
    const service = load('services/authService.ts', {
      '@/models/User': { findOne: async () => record, create: async () => { throw new Error('Must not create another account'); } },
      '@/services/accountEmailService': { sendWelcome: async () => { welcomes++; } },
      '@/interfaces/IUser': { EProviders: { credentials: 'credentials' } },
      '@/utils/appError': load('utils/appError.ts').default,
    }).default;
    await assert.rejects(service.handlePostOAuthUserSignIn('user@example.com', 'Changed name', provider === 'google' ? 'github' : 'google', 'new-avatar'), /OAuthAccountNotLinked/);
    assert.equal(record.image, 'original-avatar');
    assert.equal(record.provider, provider);
    assert.equal(saves, 0);
    assert.equal(welcomes, 0);
  }
});

test('matching OAuth provider awaits profile save and propagates persistence failures', async () => {
  const record = { _id: 'existing', provider: 'github', image: 'old', save: async () => { throw new Error('Save failed'); } };
  const service = load('services/authService.ts', {
    '@/models/User': { findOne: async () => record },
    '@/interfaces/IUser': { EProviders: { credentials: 'credentials' } },
    '@/utils/appError': load('utils/appError.ts').default,
  }).default;
  await assert.rejects(service.handlePostOAuthUserSignIn('user@example.com', 'User', 'github', 'new'), /Save failed/);
});
