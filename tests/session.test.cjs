const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = file => fs.readFileSync(file, 'utf8').replace(/^import .*;\r?\n/gm, '').replace(/export /g, '');
const complete = { id: 'user-a', terme_condition: true, agree: true, name: 'Test', sex: 'female', age: 18 };

function setup({ profile = complete, session = true, authError = null, dbError = null, signupSession = true } = {}) {
  const calls = [];
  const storage = new Map([['authToken', 'legacy-token']]);
  const auth = {
    getSession: async () => ({ data: { session: session ? { user: { id: 'user-a' } } : null }, error: null }),
    getUser: async () => ({ data: { user: { id: 'user-a' } }, error: authError }),
    signOut: async options => { calls.push(['signOut', options]); return { error: null }; },
    signInWithPassword: async credentials => { calls.push(['signIn', credentials]); return { error: authError }; },
    signUp: async credentials => { calls.push(['signUp', credentials]); return { data: { session: signupSession ? {} : null }, error: authError }; },
  };
  const query = {
    upsert: async (...args) => { calls.push(['upsert', ...args]); return { error: dbError }; },
    update: changes => { calls.push(['update', changes]); return query; },
    select: () => query,
    eq: (key, value) => { calls.push(['eq', key, value]); return query; },
    single: async () => ({ data: profile, error: dbError }),
  };
  const context = vm.createContext({
    getSupabase: () => ({ auth, from: table => { calls.push(['from', table]); return query; } }),
    AsyncStorage: { multiRemove: async keys => keys.forEach(key => storage.delete(key)) },
  });
  vm.runInContext(source('onboarding.js') + source('backend.js') + source('session.js'), context);
  return { context, calls, storage };
}

test('each incomplete profile resumes at the first unfinished step', () => {
  const { context } = setup();
  for (const [changes, expected] of [
    [{ terme_condition: false }, 'TermsScreen'], [{ agree: '0' }, 'TermsScreen'],
    [{ name: '' }, 'NameSelection'], [{ sex: null }, 'GenderSelection'],
    [{ age: null }, 'OldSelection'], [{ agree: true }, 'WelcomeScreen'],
  ]) {
    const user = { ...complete, ...changes };
    const destination = context.getDestination(user);
    assert.equal(destination.name, expected);
    assert.equal(destination.params.userId, user);
  }
});
test('profile transitions replace navigation history', () => {
  let state;
  setup().context.continueOnboarding({ reset: value => { state = value; } }, complete);
  assert.equal(state.routes.length, 1);
  assert.equal(state.routes[0].name, 'WelcomeScreen');
});
test('Supabase sessions restore profiles; legacy storage is removed', async () => {
  const fresh = setup({ session: false });
  assert.equal((await fresh.context.restoreSession()).name, 'Home');
  const restored = setup();
  assert.equal((await restored.context.restoreSession()).name, 'WelcomeScreen');
  assert.equal(restored.storage.size, 0);
  assert.equal(restored.calls.find(call => call[0] === 'eq')[2], 'user-a');
  const insert = restored.calls.find(call => call[0] === 'upsert');
  assert.equal(insert[1].id, 'user-a');
  assert.equal(insert[2].ignoreDuplicates, true);
});
test('expired sessions sign out; database errors preserve session for retry', async () => {
  const expired = setup({ authError: { status: 401 } });
  assert.equal((await expired.context.restoreSession()).name, 'Login');
  assert.ok(expired.calls.some(call => call[0] === 'signOut'));
  const offline = setup({ dbError: new Error('offline') });
  assert.equal((await offline.context.restoreSession()).name, 'Login');
  assert.equal(offline.calls.some(call => call[0] === 'signOut'), false);
});
test('sign in normalizes email; phone login and auth failures are rejected', async () => {
  const { context, calls } = setup();
  assert.equal((await context.signIn(' Test@Example.com ', 'password')).id, 'user-a');
  assert.equal(calls.find(call => call[0] === 'signIn')[1].email, 'test@example.com');
  await assert.rejects(context.signIn('+254700000000', 'password'), /valid email/);
  await assert.rejects(setup({ authError: new Error('Invalid login credentials') }).context.signIn('a@example.com', 'bad'), /Invalid login/);
});
test('unconfirmed signup never reads or creates a profile', async () => {
  const { context, calls } = setup({ signupSession: false });
  assert.equal(await context.signUp('a@example.com', 'password'), null);
  assert.equal(calls.some(call => call[0] === 'from'), false);
  assert.equal((await setup().context.signUp('a@example.com', 'password')).id, 'user-a');
});
test('profile updates use the authenticated ID and reject ownership changes', async () => {
  const { context, calls } = setup();
  await context.updateProfile({ name: 'Updated' });
  assert.equal(calls.find(call => call[0] === 'eq')[2], 'user-a');
  await assert.rejects(context.updateProfile({ id: 'user-b' }), /Invalid profile/);
  await assert.rejects(context.updateProfile({}), /Invalid profile/);
  await assert.rejects(setup({ dbError: new Error('denied') }).context.updateProfile({ age: 18 }), /denied/);
});
test('logout uses Supabase local signout and clears legacy personal data', async () => {
  const { context, calls, storage } = setup();
  await context.clearSession();
  assert.equal(calls.find(call => call[0] === 'signOut')[1].scope, 'local');
  assert.equal(storage.size, 0);
});
