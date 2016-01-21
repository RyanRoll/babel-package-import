'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })(); // AST demo: http://astexplorer.net/#/4Ifn5ilohb/15

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _shortid = require('shortid');

var _shortid2 = _interopRequireDefault(_shortid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_shortid2.default.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_');

var PackageLoader = (function () {
  function PackageLoader(t, nodePath, state, packagePath) {
    _classCallCheck(this, PackageLoader);

    var currentFileAbsPath = _path2.default.resolve(state.file.opts.filenameRelative, '..');
    this.t = t;
    this.nodePath = nodePath;
    this.packagePath = packagePath;
    this.exportVarName = '$$_export';
    this.namespace = '$$_import';
    this.packageAbsPath = _path2.default.resolve(currentFileAbsPath, packagePath);
  }

  _createClass(PackageLoader, [{
    key: 'load',
    value: function load() {
      if (_fs2.default.lstatSync(this.packageAbsPath).isDirectory()) {
        this.assignImportToAnExportObject();
        this.loadPackage(this.packagePath, this.packageAbsPath);
        this.assignExport();
        // remove the original path
        this.nodePath.remove();
      }
    }
  }, {
    key: 'assignImportToAnExportObject',
    value: function assignImportToAnExportObject() {
      this.nodePath.insertBefore(this.t.variableDeclaration('let', [this.t.variableDeclarator(this.t.identifier(this.exportVarName), this.t.objectExpression([]))]));
    }
  }, {
    key: 'loadPackage',
    value: function loadPackage(dirPath, dirAbsPath) {
      var _this = this;

      var exportExpression = arguments.length <= 2 || arguments[2] === undefined ? this.t.identifier(this.exportVarName) : arguments[2];

      var list = _fs2.default.readdirSync(dirAbsPath);

      var _path$parse = _path2.default.parse(dirPath);

      var dirNamespace = _path$parse.name;

      list.forEach(function (fileName) {
        var file = _path2.default.join(dirAbsPath, fileName);
        var stat = _fs2.default.statSync(file);
        if (stat.isFile()) {
          var _path$parse2 = _path2.default.parse(file);

          var subNamespace = _path$parse2.name;

          var alias = _this.namespace + '_' + _shortid2.default.generate();
          var importPath = _this.getImportPath(dirPath, subNamespace);
          _this.nodePath.insertBefore(_this.t.importDeclaration([_this.t.importNamespaceSpecifier(_this.t.identifier(alias))], _this.t.stringLiteral(importPath)));
          _this.assignPackageVar(_this.t.memberExpression(exportExpression, _this.t.stringLiteral(subNamespace), true), _this.t.identifier(alias));
        } else if (stat.isDirectory()) {
          var nextDirPath = _this.getImportPath(dirPath, fileName);
          var nextDirAbsPath = dirAbsPath + '/' + fileName;
          var nextExportExpression = _this.t.memberExpression(exportExpression, _this.t.stringLiteral(fileName), true);
          _this.assignPackageVar(nextExportExpression, _this.t.objectExpression([]));
          _this.loadPackage(nextDirPath, nextDirAbsPath, nextExportExpression);
        }
      });
    }
  }, {
    key: 'getImportPath',
    value: function getImportPath(dirPath, name) {
      return dirPath + (dirPath.charAt(dirPath.length - 1) === '/' ? '' : '/') + name;
    }
  }, {
    key: 'assignPackageVar',
    value: function assignPackageVar(exportExpression, valueExpression) {
      this.nodePath.insertBefore(this.t.expressionStatement(this.t.assignmentExpression('=', exportExpression, valueExpression)));
    }
  }, {
    key: 'assignExport',
    value: function assignExport() {
      var _this2 = this;

      var specifiers = this.nodePath.node.specifiers;

      var exportName = null;
      var destructuringList = [];
      if (specifiers.length > 1) {
        specifiers.forEach(function (specifier) {
          if (_this2.t.isImportDefaultSpecifier(specifier)) {
            exportName = specifier.local.name;
          } else if (_this2.t.isImportSpecifier(specifier)) {
            destructuringList.push(_this2.t.objectProperty(_this2.t.identifier(specifier.imported.name), _this2.t.identifier(specifier.local.name)));
          }
        });
      } else {
        var _specifiers = _slicedToArray(specifiers, 1);

        var firstSpecifier = _specifiers[0];

        if (this.t.isImportNamespaceSpecifier(firstSpecifier)) {
          exportName = firstSpecifier.local.name;
        }
      }
      if (exportName) {
        this.nodePath.insertBefore(this.t.variableDeclaration('let', [this.t.variableDeclarator(this.t.identifier(exportName), this.t.identifier(this.exportVarName))]));
      }
      if (destructuringList.length) {
        this.nodePath.insertBefore(this.t.variableDeclaration('let', [this.t.variableDeclarator(this.t.objectPattern(destructuringList), this.t.identifier(this.exportVarName))]));
      }
    }
  }]);

  return PackageLoader;
})();

exports.default = PackageLoader;