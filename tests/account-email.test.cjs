const { test, assert, load } = require('./helpers.cjs');
const { createHash } = require('node:crypto');
const AppError = load('utils/appError.ts').default;

function setup({ eligible = true, user = { _id: 'id', email: 'person@example.com' }, delivery = true } = {}) {
  const calls = { writes: [], messages: [], verifies: [] };
  let claimed = false;
  const service = load('services/accountEmailService.ts', {
    '@/models/User': {
      async updateOne(query, update) {
        calls.writes.push({ query, update });
        if ('welcomeEmailSentAt' in query) {
          if (claimed) return { modifiedCount: 0 };
          claimed = true;
        }
        return { modifiedCount: eligible ? 1 : 0 };
      },
      async findOneAndUpdate(query, update) { calls.verifies.push({ query, update }); return user; },
    },
    '@/utils/appError': AppError,
    '@/utils/emails/accountEmail': load('utils/emails/accountEmail.ts', {}, { process: { env: { NEXT_PUBLIC_SITE_URL: 'https://comments.example' } } }),
  }, {
    process: { env: { RESEND_API_KEY: 'test', NEXT_PUBLIC_SITE_URL: 'https://comments.example' } },
    fetch: async (url, options) => { calls.messages.push(JSON.parse(options.body)); return { ok: delivery }; },
  });
  return { service, calls };
}

test('verification sends hashed, expiring token only to unverified credentials accounts', async () => {
  const { service, calls } = setup();
  await service.sendVerification('person@example.com');
  const { query, update } = calls.writes[0];
  assert.deepEqual(query, { email: 'person@example.com', provider: 'credentials', isEmailVerified: { $ne: true } });
  const url = new URL(calls.messages[0].text.match(/Confirm my email: (https?:\/\/[^\s]+)/)[1]);
  assert.equal(url.origin, 'https://comments.example');
  assert.equal(url.pathname, '/verify-email');
  assert.equal(url.search, '');
  const token = url.hash.slice(1);
  assert.match(token, /^[a-f0-9]{64}$/);
  assert.equal(update.$set.emailVerificationHash, createHash('sha256').update(token).digest('hex'));
  assert.ok(update.$set.emailVerificationExpires > new Date());
  assert.ok(!JSON.stringify(calls.writes).includes(token));
});

test('ineligible verification requests never send mail', async () => {
  const { service, calls } = setup({ eligible: false });
  await service.sendVerification('oauth@example.com');
  assert.equal(calls.messages.length, 0);
});

test('confirmation atomically consumes an unexpired credentials token then sends welcome once', async () => {
  const { service, calls } = setup();
  await service.verifyEmail('a'.repeat(64));
  const { query, update } = calls.verifies[0];
  assert.equal(query.provider, 'credentials');
  assert.ok(query.emailVerificationExpires.$gt instanceof Date);
  assert.equal(update.$set.isEmailVerified, true);
  assert.deepEqual(update.$unset, { emailVerificationHash: 1, emailVerificationExpires: 1 });
  await service.sendWelcome('id', 'person@example.com');
  assert.equal(calls.messages.length, 1);
  assert.equal(calls.messages[0].subject, 'Welcome to Commentsy');
});

test('malformed, expired and consumed verification links cannot mark an account verified', async () => {
  const { service, calls } = setup({ user: null });
  await assert.rejects(service.verifyEmail('invalid'), /invalid or expired/);
  assert.equal(calls.verifies.length, 0);
  await assert.rejects(service.verifyEmail('a'.repeat(64)), /invalid or expired/);
  assert.equal(calls.messages.length, 0);
});

test('delivery failures do not fail account confirmation and release welcome claim', async () => {
  const { service, calls } = setup({ delivery: false });
  await service.verifyEmail('a'.repeat(64));
  assert.deepEqual(calls.writes.at(-1).update, { $unset: { welcomeEmailClaimedAt: 1 } });
});

test('credentials reject unverified email only after a correct password', async () => {
  const user = { provider: 'credentials', isEmailVerified: false, validatePassword: async password => password === 'correct', _id: 'id' };
  const service = load('services/authService.ts', {
    '@/models/User': { findOne: () => ({ select: async () => user }) },
    '@/interfaces/IUser': { EProviders: { credentials: 'credentials' } }, '@/utils/appError': AppError,
  }).default;
  assert.equal(await service.getLoginUserFromCredentials({ email: 'person@example.com', password: 'wrong' }), null);
  await assert.rejects(service.getLoginUserFromCredentials({ email: 'person@example.com', password: 'correct' }), /EmailNotVerified/);
});

test('OAuth welcomes only newly created accounts', async () => {
  let existing = null;
  let welcomes = 0;
  const record = { _id: 'id', provider: 'google', email: 'person@example.com', image: undefined };
  const service = load('services/authService.ts', {
    '@/models/User': { findOne: async () => existing, create: async input => { assert.equal(input.isEmailVerified, true); return record; } },
    '@/services/accountEmailService': { sendWelcome: async () => { welcomes++; } },
    '@/interfaces/IUser': { EProviders: { credentials: 'credentials' } }, '@/utils/appError': AppError,
  }).default;
  await service.handlePostOAuthUserSignIn(record.email, 'Person', 'google');
  existing = record;
  await service.handlePostOAuthUserSignIn(record.email, 'Person', 'google');
  assert.equal(welcomes, 1);
});

test('successful signup shows confirmation instructions without attempting an unverified sign-in', async () => {
  const changes = [];
  let stateIndex = 0;
  const Form = load('components/signup/signup-form.tsx', {
    react: { useState: initial => { const index = stateIndex++; return [initial, value => changes.push({ index, value })]; } },
    '@/components/ui': { Alert: () => null, Spinner: () => null },
    '@/utils/api': { default: undefined, post: async () => ({ status: 'success', data: { message: 'Confirm your email before signing in.' } }) },
    'next/link': () => null,
    'next-auth/react': { signIn: () => { throw new Error('Signup must not sign in before confirmation'); } },
  }).default;
  const view = Form();
  await view.props.onSubmit({ preventDefault() {} });
  assert.ok(changes.some(change => change.value === 'Confirm your email before signing in.'));
  assert.ok(changes.some(change => change.index === 2 && change.value === true));
});

test('email link automatically verifies once despite Strict Mode replay, then redirects to password sign-in', async () => {
  for (const success of [true, false]) {
    let effect;
    const requests = [];
    const redirects = [];
    const updates = [];
    const location = { hash: '#' + 'a'.repeat(64), pathname: '/verify-email', replace: url => redirects.push(url) };
    const Form = load('components/verify-email-form.tsx', {
      react: {
        useRef: initial => ({ current: initial }),
        useState: initial => [initial, value => updates.push(value)],
        useEffect: callback => { effect = callback; },
      },
      'next/link': () => null,
      '@/utils/api': { post: async (url, body) => {
        requests.push({ url, body });
        return success ? { status: 'success', data: {} } : { status: 'fail', message: 'Link expired' };
      } },
      './ui/form-feedback': () => null,
    }, { window: { location, history: { replaceState() { location.hash = ''; } } } }).default;
    Form();
    effect(); effect();
    await Promise.resolve();
    assert.deepEqual(requests, [{ url: '/api/verify-email', body: { token: 'a'.repeat(64) } }]);
    assert.deepEqual(redirects, success ? ['/signin?emailConfirmed=1'] : []);
    if (!success) assert.ok(updates.includes('Link expired'));
  }
});

test('sending confirmation replaces the email form with inbox instructions and a disabled resend countdown', async () => {
  const states = [];
  let cursor = 0;
  let effects = [];
  const initialized = { current: false };
  let sends = 0;
  const Form = load('components/verify-email-form.tsx', {
    react: {
      useRef: () => initialized,
      useState(initial) {
        const index = cursor++;
        if (!(index in states)) states[index] = initial;
        return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
      },
      useEffect: callback => effects.push(callback),
    },
    'next/link': () => null, './ui/form-feedback': () => null,
    '@/utils/api': { post: async () => { sends++; return { status: 'success', data: {} }; } },
  }, { window: { location: { hash: '#email=person%40example.com', pathname: '/verify-email' }, history: { replaceState() {} } } }).default;
  function render() { cursor = 0; effects = []; return Form(); }
  function find(node, predicate) {
    if (!node || typeof node !== 'object') return;
    if (predicate(node)) return node;
    for (const child of [node.props?.children].flat(Infinity)) { const result = find(child, predicate); if (result) return result; }
  }
  render(); effects.forEach(effect => effect());
  let view = render();
  await find(view, node => node.type === 'form').props.onSubmit({ preventDefault() {} });
  view = render();
  assert.equal(find(view, node => node.type === 'form'), undefined);
  assert.ok(find(view, node => node.type === 'h1').props.children.includes('Check your inbox.'));
  const resend = find(view, node => node.type === 'button' && node.props.children === 'Resend available in 60s');
  assert.equal(resend.props.disabled, true);
  await resend.props.onClick();
  assert.equal(sends, 1);
});


test('welcome is marked sent only after provider acceptance; failed sends remain pending', async () => {
  const accepted = setup();
  await accepted.service.sendWelcome('id', 'person@example.com');
  assert.ok(!accepted.calls.writes[0].update.$set.welcomeEmailSentAt);
  assert.equal(accepted.calls.writes[0].update.$set.welcomeEmailPending, true);
  assert.ok(accepted.calls.writes[1].update.$set.welcomeEmailSentAt instanceof Date);
  const failed = setup({ delivery: false });
  await failed.service.sendWelcome('id', 'person@example.com');
  assert.ok(failed.calls.writes.every(write => !write.update.$set?.welcomeEmailSentAt));
});

test('successful verified credentials login retries a pending welcome email', async () => {
  let welcomes = 0;
  const user = { _id: 'id', provider: 'credentials', isEmailVerified: true, welcomeEmailPending: true, email: 'person@example.com', validatePassword: async () => true };
  const service = load('services/authService.ts', {
    '@/models/User': { findOne: () => ({ select: async () => user }) },
    '@/services/accountEmailService': { sendWelcome: async () => { welcomes++; } },
    '@/interfaces/IUser': { EProviders: { credentials: 'credentials' } }, '@/utils/appError': AppError,
  }).default;
  await service.getLoginUserFromCredentials({ email: user.email, password: 'correct-password' });
  assert.equal(welcomes, 1);
  user.welcomeEmailPending = false;
  await service.getLoginUserFromCredentials({ email: user.email, password: 'correct-password' });
  assert.equal(welcomes, 1);
});

test('account email designs include useful next steps and escaped links in HTML plus plain text', () => {
  const template = load('utils/emails/accountEmail.ts', {}, { process: { env: { NEXT_PUBLIC_SITE_URL: 'https://comments.example' } } });
  const welcome = template.accountEmail();
  assert.ok(welcome.html.includes('Give your readers a voice.'));
  assert.ok(welcome.html.includes('https://comments.example/docs'));
  assert.ok(welcome.text.includes('guest approval'));
  const verification = template.accountEmail('https://comments.example/verify-email#abc&def');
  assert.ok(verification.html.includes('#abc&amp;def'));
  assert.ok(verification.html.includes('24 hours'));
  assert.ok(verification.text.includes('automatically'));
});
