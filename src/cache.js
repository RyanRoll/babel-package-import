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
    this.store = {
      library: null,
      files: {}
    };
  }
  getLibrary() {
    return this.store.library;
  }
  setLibrary(exportVarName) {
    this.store.library = exportVarName;
  }
  getFile(filePath) {
    return this.store.files[filePath];
  }
  setFile(filePath, expression) {
    this.store.files[filePath] = expression;
  }
}

const importCache = new ImportCache();
export default importCache;
