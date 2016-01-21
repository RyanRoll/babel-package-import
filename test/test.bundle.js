'use strict';

var _index = require('./myApp/index');

var $$_import_VJydzHY$l = _interopRequireWildcard(_index);

var _index2 = require('./myApp/moduleA/index');

var $$_import_VJgJOGHtue = _interopRequireWildcard(_index2);

var _index3 = require('./myApp/moduleB/index');

var $$_import_VyWJuzHYdg = _interopRequireWildcard(_index3);

var _index4 = require('./myApp/moduleC/index');

var $$_import_V1Gk$zSFOx = _interopRequireWildcard(_index4);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var $$_export = {};
$$_export['index'] = $$_import_VJydzHY$l;
$$_export['moduleA'] = {};
$$_export['moduleA']['index'] = $$_import_VJgJOGHtue;
$$_export['moduleB'] = {};
$$_export['moduleB']['index'] = $$_import_VyWJuzHYdg;
$$_export['moduleC'] = {};
$$_export['moduleC']['index'] = $$_import_V1Gk$zSFOx;
var myApp = $$_export;
var _$$_export = $$_export;
var indexJS = _$$_export.index;
var moduleA = _$$_export.moduleA; //import * as myApp from './myApp/*';

console.log('Looks good!');
console.log(myApp, indexJS, moduleA);
