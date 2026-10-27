const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const mongoose = require('mongoose');

// Load the actual TS modules without introducing a second build or test dependency.
function load(file, mocks = {}, globals = {}) {
  const loadedModule = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const evaluate = vm.runInThisContext(`(function(module, exports, require, ${Object.keys(globals).join(",")}) { ${source}\n})`, { filename: file });
  evaluate(loadedModule, loadedModule.exports, name => name in mocks ? mocks[name] : require(name), ...Object.values(globals));
  return loadedModule.exports;
}
const gifUtils = load('utils/gif.ts', {}, { URL });
const gif = { provider: 'klipy', id: '123', slug: 'happy-cat', url: 'https://static.klipy.com/content/cat.gif?delivery=original', title: 'Happy cat' };

const Comment = load('models/Comment.ts', {
  '@/utils/gif': gifUtils,
  '@/lib/createModel': (name, schema) => mongoose.model('GifTestComment', schema),
  '@/interfaces/IGroup': { COMMENT_STATUS: { pending: 'pending', approved: 'approved', deleted: 'deleted' } },
  '@/interfaces/IUser': { AVATAR_BACKGROUND_COLORS: ['#fed0bb'] },
}).default;
const base = { app: new mongoose.Types.ObjectId(), group: new mongoose.Types.ObjectId(), user: new mongoose.Types.ObjectId(), pageTitle: 'Test', pageUrl: 'https://example.com/post' };


module.exports = { test, assert, load, mongoose, gifUtils, gif, Comment, base };
