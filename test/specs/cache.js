import test from 'tape';
import importCache, { Cache } from '../../lib/cache';

test('● Test Cache', t => {
  let cache = new Cache();
  t.equal(cache.store.library, null, 'cache.store.library is null at first');
  t.equal(Object.keys(cache.store.files).length, 0, 'cache.store.files is an empty object at first');

  t.test('> Test get/set library function', t => {
    let exportVarName = '$$_export_ABCDEFGHIJ';
    cache.setLibrary(exportVarName);
    let library = cache.getLibrary();
    t.equal(cache.store.library, exportVarName, 'set exportVarName');
    t.equal(cache.store.library, library, 'get exportVarName');
    t.end();
  });

  t.test('> Test get/set file function', t => {
    let fileAPath = './a.js';
    let fileBPath = './b.js';
    let fileAData = {data: 'fileAData'};
    let fileBData = {data: 'fileBData'};
    cache.setFile(fileAPath, fileAData);
    cache.setFile(fileBPath, fileBData);
    let cachedFileA = cache.getFile(fileAPath);
    let cachedFileB = cache.getFile(fileBPath);
    t.deepEqual(cache.store.files[fileAPath], cachedFileA, 'get cachedFileA');
    t.deepEqual(cache.store.files[fileBPath], cachedFileB, 'get cachedFileB');
    t.end();
  });
  t.end();
});

test('● Test importCache', t => {
  let cachePoolKeys = Object.keys(importCache.cachePool);
  t.equal(cachePoolKeys.length, 0, 'importCache.cachePool is an empty object at first');
  let fakeState = {
    file: {
      opts: {
        filename: './a.js'
      }
    }
  };
  let cache = importCache.getCache(fakeState);
  t.ok(importCache.cachePool.hasOwnProperty(fakeState.file.opts.filename), 'importCache.cachePool has new cache');
  t.deepEqual(cache, importCache.getCache(fakeState), 'get cache again, they are same');
  t.end();
});
