// One-off cleanup for the isolated fixtures created during the October 29 pilot review.
// Preview: node scripts/cleanup-pilot-qa.cjs
// Delete only those fixtures: node scripts/cleanup-pilot-qa.cjs --apply
const mongoose = require('mongoose');
require('@next/env').loadEnvConfig(process.cwd());

function fail(message) { throw Object.assign(new Error(message), { cleanupGuard: true }); }

async function cleanup(session) {
  const db = mongoose.connection.db;
  const options = session ? { session } : {};
  const users = db.collection('users');
  const account = await users.findOne({ email: 'pilot.qa.20261029@example.com', name: 'Pilot QA 20261029', provider: 'credentials' }, options);
  if (!account) return { accounts: 0, sites: 0, groups: 0, comments: 0 };
  const sites = await db.collection('apps').find({ user: account._id }, options).toArray();
  const names = ['Pilot QA 20261029', 'Pilot QA second site'];
  if (sites.some(site => !names.includes(site.name))) fail('Unexpected site on QA account; cleanup stopped.');
  const ids = sites.map(site => site._id);
  const appFilter = { app: { $in: ids } };
  const expectedText = /^(QA (fixture \d+|concurrent service write|service reply|browser signed-in (comment|reply)|guest (reply )?awaits approval)|ONLY SECOND SITE)$/;
  const unexpected = await db.collection('comments').countDocuments({ ...appFilter, $or: [
    { comment: { $not: expectedText } }, { gif: { $exists: true } },
    { user: { $exists: true, $ne: account._id } },
    { 'anonUser.email': { $exists: true, $ne: 'pilot.guest.20261029@example.com' } },
  ] }, options);
  const outsideComments = await db.collection('comments').countDocuments({ user: account._id, app: { $nin: ids } }, options);
  const otherGroups = await db.collection('groups').countDocuments({ ...appFilter, owner: { $ne: account._id } }, options);
  if (unexpected || outsideComments || otherGroups) fail('Unexpected content on QA account; cleanup stopped.');
  const counts = {
    accounts: 1, sites: sites.length,
    groups: await db.collection('groups').countDocuments(appFilter, options),
    comments: await db.collection('comments').countDocuments(appFilter, options),
  };
  if (session) {
    await db.collection('comments').deleteMany(appFilter, options);
    await db.collection('groups').deleteMany(appFilter, options);
    await db.collection('apps').deleteMany({ _id: { $in: ids }, user: account._id }, options);
    await users.deleteOne({ _id: account._id }, options);
  }
  return counts;
}

async function main() {
  if (process.argv.slice(2).some(arg => arg !== '--apply')) fail('Use no arguments to preview, or --apply to remove the QA fixtures.');
  if (!process.env.MONGODB_URI) fail('Set MONGODB_URI for the database containing the QA fixtures.');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const apply = process.argv.includes('--apply');
  let counts;
  if (apply) await mongoose.connection.transaction(async session => { counts = await cleanup(session); });
  else counts = await cleanup();
  console.log(JSON.stringify({ action: apply ? 'removed' : 'preview', ...counts }));
  if (!apply) console.log('No data changed. Add --apply to remove only the verified QA fixtures.');
}
main().catch(error => {
  // Avoid printing database URLs or raw driver errors.
  console.error(error.cleanupGuard ? error.message : 'QA cleanup could not connect or complete. No cleanup was committed.');
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());
