"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ImportCache = (function () {
  function ImportCache() {
    _classCallCheck(this, ImportCache);

    this.cachePool = {};
  }

  _createClass(ImportCache, [{
    key: "getCache",
    value: function getCache(state) {
      var currentFileName = state.file.opts.filename;
      return this.cachePool[currentFileName] = this.cachePool[currentFileName] || new Cache();
    }
  }]);

  return ImportCache;
})();

var Cache = exports.Cache = (function () {
  function Cache() {
    _classCallCheck(this, Cache);

    this.store = {
      library: null,
      files: {}
    };
  }

  _createClass(Cache, [{
    key: "getLibrary",
    value: function getLibrary() {
      return this.store.library;
    }
  }, {
    key: "setLibrary",
    value: function setLibrary(exportVarName) {
      this.store.library = exportVarName;
    }
  }, {
    key: "getFile",
    value: function getFile(filePath) {
      return this.store.files[filePath];
    }
  }, {
    key: "setFile",
    value: function setFile(filePath, expression) {
      this.store.files[filePath] = expression;
    }
  }]);

  return Cache;
})();

var importCache = new ImportCache();
exports.default = importCache;