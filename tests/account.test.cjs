const { test, assert, load, mongoose, gifUtils, gif, Comment, base } = require('./helpers.cjs');

test('account settings validate profile input and only update allowed profile fields', async () => {
  const record = { name: 'Old', email: 'original@example.com', provider: 'credentials', avatarBackgroundColor: '#fed0bb', save: async () => {} };
  const service = load('services/accountService.ts', {
    '@/models/User': { findById: id => {
      assert.equal(id, 'signed-in-user');
      return Object.assign(Promise.resolve(record), { select: () => ({ lean: async () => ({ name: record.name, email: record.email, provider: record.provider, avatarBackgroundColor: record.avatarBackgroundColor }) }) });
    } },
    '@/utils/appError': class AppError extends Error {},
    '@/interfaces/IUser': { AVATAR_BACKGROUND_COLORS: ['#fed0bb', '#8ecae6'], EProviders: { credentials: 'credentials' } },
  }).default;
  await assert.rejects(service.updateProfile('signed-in-user', { name: '  ', avatarBackgroundColor: '#fed0bb' }), /display name/);
  await assert.rejects(service.updateProfile('signed-in-user', { name: 'Name', avatarBackgroundColor: '#123456' }), /available avatar colors/);
  const result = await service.updateProfile('signed-in-user', { name: ' New name ', avatarBackgroundColor: '#8ecae6', email: 'changed@example.com', provider: 'github' });
  assert.equal(result.name, 'New name');
  assert.equal(result.email, 'original@example.com');
  assert.equal(result.provider, 'credentials');
  assert.equal(result.avatarBackgroundColor, '#8ecae6');
});

test('password changes require the current password and a credentials account', async () => {
  let saves = 0;
  const record = { provider: 'credentials', password: 'stored-hash', validatePassword: async candidate => candidate === 'current-password', save: async () => { saves++; } };
  const service = load('services/accountService.ts', {
    '@/models/User': { findById: () => ({ select: async () => record }) },
    '@/utils/appError': class AppError extends Error {},
    '@/interfaces/IUser': { AVATAR_BACKGROUND_COLORS: [], EProviders: { credentials: 'credentials' } },
  }, { Buffer }).default;
  await assert.rejects(service.changePassword('author', { currentPassword: 'wrong', newPassword: 'new-password' }), /incorrect/);
  await assert.rejects(service.changePassword('author', { currentPassword: 'current-password', newPassword: 'short' }), /8–72/);
  await assert.rejects(service.changePassword('author', { currentPassword: 'current-password', newPassword: '😃'.repeat(20) }), /8–72/);
  await assert.rejects(service.changePassword('author', { currentPassword: 'current-password', newPassword: 'current-password' }), /different/);
  assert.equal(saves, 0);
  await service.changePassword('author', { currentPassword: 'current-password', newPassword: 'new-password' });
  assert.equal(saves, 1);
  assert.equal(record.password, 'new-password');
  record.provider = 'github';
  await assert.rejects(service.changePassword('author', { currentPassword: 'current-password', newPassword: 'new-password' }), /sign-in provider/);
  assert.equal(saves, 1);
});
