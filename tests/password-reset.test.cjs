const { test, assert, load } = require('./helpers.cjs');
const crypto = require('node:crypto');
const AppError = load('utils/appError.ts').default;

function setup(user = null, modifiedCount = 1, deliveryOk = true) {
  const calls = { writes: [], emails: [], queries: [] };
  const service = load('services/passwordResetService.ts', {
    '@/models/User': {
      findOne(query) { calls.queries.push(query); return { select: () => ({ lean: async () => user }) }; },
      async updateOne(query, update) { calls.writes.push({ query, update }); return { modifiedCount }; },
    },
    '@/utils/appError': AppError,
    '@/utils/emails/passwordReset': load('utils/emails/passwordReset.ts'),
    bcrypt: { hash: async value => `hashed:${value}` },
  }, {
    process: { env: { RESEND_API_KEY: 'test-key', NEXT_PUBLIC_SITE_URL: 'https://commentsy.example' } },
    fetch: async (url, options) => { calls.emails.push({ url, options }); return { ok: deliveryOk }; },
  });
  return { service, calls };
}

test('reset email eligibility is scoped to normalized credentials account, with no email for a missing account', async () => {
  const { service, calls } = setup();
  await service.requestPasswordReset('test@example.com');
  assert.deepEqual(calls.queries, [{ email: 'test@example.com', provider: 'credentials' }]);
  assert.equal(calls.emails.length, 0);
  assert.equal(calls.writes.length, 0);
});

test('email uses configured origin and sender, while only a token hash and expiry are stored', async () => {
  const { service, calls } = setup({ _id: 'user-id' });
  await service.requestPasswordReset('test@example.com');
  const email = JSON.parse(calls.emails[0].options.body);
  assert.equal(email.from, 'Commentsy <no-reply@commentsy.com>');
  const link = email.text.match(/https:\/\/\S+/)[0];
  const token = new URL(link).searchParams.get('token');
  assert.match(token, /^[a-f0-9]{64}$/);
  assert.ok(email.html.includes(`href="${link}"`));
  assert.ok(email.html.includes('Reset password'));
  assert.ok(email.html.includes('30 minutes'));
  assert.equal(calls.writes[0].update.$set.passwordResetHash, crypto.createHash('sha256').update(token).digest('hex'));
  assert.ok(calls.writes[0].update.$set.passwordResetExpires > new Date());
  assert.equal(JSON.stringify(calls.writes).includes(token), false);
});

test('failed delivery clears only the token issued by that request', async () => {
  const { service, calls } = setup({ _id: 'id' }, 1, false);
  await service.requestPasswordReset('test@example.com');
  assert.equal(calls.writes.length, 2);
  assert.equal(calls.writes[1].query.passwordResetHash, calls.writes[0].update.$set.passwordResetHash);
});

test('reset atomically consumes unexpired credentials token, hashes password, and revokes sessions', async () => {
  const { service, calls } = setup();
  await service.resetPassword('a'.repeat(64), 'new-password');
  const { query, update } = calls.writes[0];
  assert.equal(query.provider, 'credentials');
  assert.ok(query.passwordResetExpires.$gt instanceof Date);
  assert.equal(update.$set.password, 'hashed:new-password');
  assert.equal(update.$inc.sessionVersion, 1);
  assert.deepEqual(update.$unset, { passwordResetHash: 1, passwordResetExpires: 1 });
});

test('invalid, expired, reused tokens and invalid passwords cannot reset an account', async () => {
  const { service, calls } = setup(null, 0);
  await assert.rejects(service.resetPassword('bad', 'new-password'), /invalid or has expired/);
  await assert.rejects(service.resetPassword('a'.repeat(64), 'short'), /at least 8/);
  assert.equal(calls.writes.length, 0);
  await assert.rejects(service.resetPassword('a'.repeat(64), 'new-password'), /invalid or has expired/);
});

test('password reset revokes old sessions while a fresh sign-in receives the current version', async () => {
  const options = load('app/api/auth/[...nextauth]/options.ts', {
    '@/config': { keys: {} }, '@/services/authService': {}, '@/lib/dbConnect': async () => {},
    '@/models/User': { findById: () => ({ select: () => ({ lean: async () => ({ sessionVersion: 1 }) }) }) },
    '@/utils/sessionCookie': { sessionCookieOptions: () => ({}) }, '@/utils/authRedirect': {},
  }).options;
  const jwt = options.callbacks.jwt;
  assert.deepEqual(await jwt({ token: { sub: 'id', sessionVersion: 0 } }), {});
  assert.deepEqual(await jwt({ token: { sub: 'id' } }), {});
  const fresh = await jwt({ token: { sub: 'id' }, user: { avatarBackgroundColor: '#fff' } });
  assert.equal(fresh.sessionVersion, 1);
  assert.equal((await jwt({ token: fresh })).id, 'id');
});
