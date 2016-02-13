class ImportCache {
  constructor() {
    this.cachePool = {};
  }
  getCache(state) {
    let currentFileName = state.file.opts.filename;
    return ( this.cachePool[currentFileName] = this.cachePool[currentFileName] || new Cache() );
  }
}

export class Cache {
  constructor() {
    this.cache = {
      library: null,
      files: {}
    };
  }
  getLibrary() {
    return this.cache.library;
  }
  setLibrary(exportVarName) {
    this.cache.library = exportVarName;
  }
  getFile(filePath) {
    return this.cache.files[filePath];
  }
  setFile(filePath, expression) {
    this.cache.files[filePath] = expression;
  }
}

const importCache = new ImportCache();
export default importCache;
