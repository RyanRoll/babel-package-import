'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var t = _ref.types;

  return {
    visitor: {
      ImportDeclaration: function ImportDeclaration(nodePath, state) {
        var packagePath = nodePath.node.source.value;
        var packagePathLength = packagePath.length - 1;
        var callback = state.opts.callback || function () {};
        // packagePath.endsWith('*')
        if (packagePath.charAt(packagePathLength) === '*') {
          packagePath = packagePath.substr(0, packagePathLength);
          var loader = new _loader2.default(t, nodePath, state, packagePath);
          var result = loader.load();
          callback(result);
        }
        callback();
      }
    }
  };
};

var _loader = require('./loader');

var _loader2 = _interopRequireDefault(_loader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;