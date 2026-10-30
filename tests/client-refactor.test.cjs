const { test, assert, load } = require('./helpers.cjs');

function response(body, status = 200) {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status, headers: { 'X-Request-ID': 'request-123' },
  });
}

test('API methods share JSON headers, body handling, cancellation, and request IDs', async () => {
  const calls = [];
  const api = load('utils/api.ts', {}, { fetch: async (url, options) => {
    calls.push({ url, ...options }); return response({ status: 'success', data: { id: 1 } });
  } }).default;
  const signal = new AbortController().signal;
  for (const method of ['get', 'post', 'patch', 'delete']) {
    const result = method === 'post' || method === 'patch'
      ? await api[method]('/api/example', { name: 'Test' }, { signal })
      : await api[method]('/api/example', { signal });
    assert.equal(result.status, 'success');
    assert.equal(result.requestId, 'request-123');
    assert.deepEqual(result.data, { id: 1 });
    const call = calls.at(-1);
    assert.equal(call.method, method.toUpperCase());
    assert.equal(call.signal, signal);
    assert.equal(call.headers.Accept, 'application/json');
    assert.equal(call.body, ['post', 'patch'].includes(method) ? '{"name":"Test"}' : undefined);
  }
});

test('API failures always provide usable errors, even for HTML and malformed responses', async () => {
  let next;
  const api = load('utils/api.ts', {}, { fetch: async () => next }).default;
  for (const body of [{ status: 'fail', message: 'Forbidden' }, { status: 'error', errors: [null, 1, '', 'Try again'] }, null, '<html>Bad gateway</html>']) {
    next = response(body, 502);
    const result = await api.get('/api/example');
    assert.notEqual(result.status, 'success');
    assert.ok(result.message.length);
    assert.ok(result.errors.length);
    assert.ok(result.errors.every(error => typeof error === 'string' && error.length));
    assert.equal(result.requestId, 'request-123');
  }
  next = response({ status: 'success', data: 'must not succeed' }, 403);
  assert.equal((await api.get('/api/example')).status, 'fail');
  next = new Response(null, { status: 204 });
  assert.equal((await api.delete('/api/example')).status, 'success');
});

test('API network errors and cancellation return recoverable errors', async () => {
  const api = load('utils/api.ts', {}, { fetch: async () => { throw new Error('network failed'); } }).default;
  const result = await api.get('/api/example');
  assert.equal(result.status, 'error');
  assert.ok(result.errors[0]);
  assert.ok(!result.message.includes('network failed'));
});

// A small hook harness lets us exercise the real composer without browser/DB dependencies.
function hooks() {
  const values = [];
  let index = 0;
  return {
    reset: () => { index = 0; },
    react: {
      useState(initial) {
        const slot = index++;
        if (!(slot in values)) values[slot] = initial;
        return [values[slot], update => { values[slot] = typeof update === 'function' ? update(values[slot]) : update; }];
      },
      useRef(initial) {
        const slot = index++;
        if (!(slot in values)) values[slot] = { current: initial };
        return values[slot];
      },
    },
  };
}
function find(node, predicate) {
  if (!node || typeof node !== 'object') return undefined;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const match = find(child, predicate);
    if (match) return match;
  }
}
function composer(options = {}) {
  const state = hooks();
  const requests = [], posted = [], shares = [];
  let metadata = { title: 'Current page', url: 'https://example.com/current' };
  let result = { status: 'success', data: { _id: 'comment', comment: 'draft', status: 'approved', anonUser: { name: 'Guest' } } };
  const GifPicker = () => null;
  const Component = load('components/embed-comments/comment-composer.tsx', {
    react: state.react,
    '@/utils/parentPageData': { requestParentPageData: async () => { if (metadata instanceof Error) throw metadata; return metadata; } },
    '@/lib/klipy': { registerGifShare: async gif => { shares.push(gif); } },
    '@/utils/api': { post: async (url, data) => { requests.push({ url, data }); return result; } },
    '../ui/avatar': () => null, '../ui/form-feedback': () => null,
    '../ui': { Spinner: () => null }, './comment-length': () => null,
    './gif-picker': GifPicker, './Comment.module.css': { growWrap: 'grow-wrap' },
  }).default;
  const props = { commentData: { appCode: 'app', identifier: 'post', userCommentStyles: { primary: {}, accent: {} } }, onPosted: value => posted.push(value), ...options };
  const render = () => { state.reset(); return Component(props); };
  const draft = () => {
    const textarea = find(render(), node => node.type === 'textarea');
    textarea.props.onFocus();
    textarea.props.onChange({ target: { value: 'draft' } });
  };
  const submit = () => find(render(), node => node.type === 'form').props.onSubmit({ preventDefault() {} });
  return { render, draft, submit, requests, posted, shares, GifPicker,
    setResult: value => { result = value; }, setMetadata: value => { metadata = value; } };
}

test('comment and reply submission use current host metadata and preserve signed-in author display', async () => {
  for (const parentCommentId of [undefined, 'parent']) {
    const user = { id: 'user', name: 'Author', email: 'author@example.com' };
    const form = composer({ user, parentCommentId });
    form.draft();
    form.setMetadata({ title: 'Changed title', url: 'https://example.com/changed' });
    await form.submit();
    assert.equal(form.requests.length, 1);
    assert.equal(form.requests[0].data.pageUrl, 'https://example.com/changed');
    assert.equal(form.requests[0].data.pageTitle, 'Changed title');
    assert.equal(form.requests[0].data.parentCommentId, parentCommentId);
    assert.equal(form.requests[0].data.anonUser, undefined);
    assert.equal(form.posted[0].commentUser, user);
    assert.equal(find(form.render(), node => node.type === 'textarea').props.value, '');
  }
});

test('guest pending comments/replies stay out of published lists and show the right confirmation', async () => {
  for (const parentCommentId of [undefined, 'parent']) {
    const form = composer({ parentCommentId });
    form.draft();
    for (const [name, value] of [['name', 'Guest'], ['email', 'guest@example.com']]) {
      find(form.render(), node => node.type === 'input' && node.props.name === name).props.onChange({ target: { value } });
    }
    form.setResult({ status: 'success', data: { _id: 'pending', status: 'pending' } });
    await form.submit();
    assert.deepEqual(form.requests[0].data.anonUser, { name: 'Guest', email: 'guest@example.com' });
    assert.equal(form.posted.length, 0);
    const feedback = find(form.render(), node => node.props?.message);
    assert.equal(feedback.props.message, `Your ${parentCommentId ? 'reply' : 'comment'} was submitted for approval.`);
    assert.equal(find(form.render(), node => node.type === 'div' && node.props.className === 'grow-wrap').props['data-replicated-value'], '');
  }
});

test('failed submissions preserve draft and GIF, and metadata failure never posts', async () => {
  const form = composer({ user: { id: 'author' } });
  form.draft();
  const gif = { id: 'gif' };
  find(form.render(), node => node.type === form.GifPicker).props.onChange(gif);
  form.setResult({ status: 'fail', message: 'Try later', errors: ['Try later'] });
  await form.submit();
  assert.equal(find(form.render(), node => node.type === 'textarea').props.value, 'draft');
  assert.equal(find(form.render(), node => node.type === form.GifPicker).props.value, gif);
  assert.equal(form.shares.length, 0);
  form.setMetadata(new Error('Cannot read host'));
  await form.submit();
  assert.equal(form.requests.length, 1);
  assert.equal(form.posted.length, 0);
});

test('empty comments are rejected and repeated submit events create only one post', async () => {
  const form = composer({ user: { id: 'author' } });
  await form.submit();
  assert.equal(form.requests.length, 0);
  form.draft();
  const submit = find(form.render(), node => node.type === 'form').props.onSubmit;
  await Promise.all([submit({ preventDefault() {} }), submit({ preventDefault() {} })]);
  assert.equal(form.requests.length, 1);
  assert.equal(form.posted.length, 1);
});

test('authorized domain fields send arrays directly when editing, adding, and removing', () => {
  const state = hooks();
  const Form = load('components/app-form/form.tsx', {
    react: { ...state.react, useId: () => 'domains-label' },
    '../ui': { Alert: () => null, Spinner: () => null }, '@/utils/api': {},
    'react-redux': { useDispatch: () => () => {} }, '@/slices/userAppsSlice': {},
    '../ui/toast': () => null, './guest-approval-help': () => null, './field-help': () => null,
  }).default;
  const view = Form({ type: 'new', from: 'settings' });
  const field = find(view, node => node.props?.authorizedOrigins);
  const changes = [];
  const domains = field.type({ authorizedOrigins: ['https://one.example', 'https://two.example'], onChange: value => changes.push(value) });
  find(domains, node => node.type === 'input').props.onChange({ target: { value: 'https://changed.example' } });
  find(domains, node => node.type === 'button' && node.props.children === 'Add URI').props.onClick();
  find(domains, node => node.type === 'button' && node.props['aria-label'] === 'Remove authorized domain 1').props.onClick();
  assert.deepEqual(changes, [
    ['https://changed.example', 'https://two.example'],
    ['https://one.example', 'https://two.example', ''],
    ['https://two.example'],
  ]);
});

test('GIF-only posts share the attachment only after a successful save', async () => {
  const form = composer({ user: { id: 'author' } });
  find(form.render(), node => node.type === 'textarea').props.onFocus();
  const gif = { id: 'gif-only' };
  find(form.render(), node => node.type === form.GifPicker).props.onChange(gif);
  await form.submit();
  assert.equal(form.requests[0].data.comment, '');
  assert.equal(form.requests[0].data.gif, gif);
  assert.deepEqual(form.shares, [gif]);
});

test('useFetch cancels old requests, ignores stale results, and clears earlier errors', async () => {
  const state = hooks();
  const effects = [], calls = [];
  const useFetch = load('hooks/useFetch.ts', {
    react: { ...state.react, useEffect: effect => effects.push(effect) },
    '@/utils/api': { get: (url, options) => new Promise(resolve => calls.push({ url, ...options, resolve })) },
  }).useFetch;
  const render = url => { state.reset(); return useFetch(url); };
  render('/old?status=undefined&empty=&page=1');
  const cleanupOld = effects[0]();
  assert.equal(calls[0].url, '/old?page=1');
  cleanupOld();
  assert.equal(calls[0].signal.aborted, true);
  render('/new');
  effects[1]();
  calls[1].resolve({ status: 'fail', message: 'Temporary error' });
  await Promise.resolve();
  assert.equal(render('/retry')[2], 'Temporary error');
  effects[2]();
  assert.equal(render('/retry')[2], null);
  calls[2].resolve({ status: 'success', data: 'new data' });
  await Promise.resolve();
  calls[0].resolve({ status: 'success', data: 'stale data' });
  await Promise.resolve();
  assert.deepEqual(render('/retry'), [false, 'new data', null]);
});

test('embed resizing reports size changes without polling and disconnects on cleanup', () => {
  const effects = [], messages = [];
  const element = { offsetHeight: 400 };
  let stateIndex = 0, observerCallback, observed, disconnected = false;
  const palette = { primary: {}, accent: {} };
  const Embed = load('components/embed-comments/index.tsx', {
    react: {
      useState: () => [stateIndex++ === 0 ? null : palette, () => {}],
      useRef: () => ({ current: element }), useEffect: effect => effects.push(effect),
    },
    './embed-session': { useEmbedSession: () => ({ controls: {} }), EmbedSessionContext: { Provider: 'provider' } },
    '@/utils/parentPageData': {}, './comments-container': () => null,
  }, {
    window: { parent: { postMessage: data => messages.push(data) } },
    ResizeObserver: class {
      constructor(callback) { observerCallback = callback; }
      observe(target) { observed = target; }
      disconnect() { disconnected = true; }
    },
  }).default;
  Embed({ commentData: { commentStyles: {} } });
  const cleanup = effects[2]();
  assert.equal(observed, element);
  observerCallback();
  assert.equal(messages.length, 1);
  element.offsetHeight = 500;
  observerCallback();
  assert.deepEqual(messages.map(message => message.height), [400, 500]);
  cleanup();
  assert.equal(disconnected, true);
});
