# Babel Package Import

[![Travis branch](https://img.shields.io/travis/RyanRoll/babel-package-import/master.svg?style=flat-square)](https://travis-ci.org/RyanRoll/babel-package-import)
[![npm](https://img.shields.io/npm/v/babel-package-import.svg?style=flat-square)](https://www.npmjs.com/package/babel-package-import)
[![npm](https://img.shields.io/npm/l/babel-package-import.svg?style=flat-square)](https://www.npmjs.com/package/babel-package-import)

A way of structuring JS modules

## Example

##### Package Structure

```
myApp
├── moduleA
│   └── index.js
├── moduleB
│   └── index.js
├── moduleC
│   └── index.js
└── index.js
```


##### In

```jsx
import * as myApp from './myApp/*';
```

##### Out(ES6)

```jsx
let myApp = {};
myApp['index'] = require('./myApp/index');
myApp['moduleA'] = {};
myApp['moduleA']['index'] = require('./myApp/moduleA/index');
myApp['moduleB'] = {};
myApp['moduleB']['index'] = require('./myApp/moduleB/index');
myApp['moduleC'] = {};
myApp['moduleC']['index'] = require('./myApp/moduleC/index');

```

##### Out(Raw)


```jsx
use strict';
var _index = require('./myApp/index');
var $$_import_N1ebPFQ6qx = _interopRequireWildcard(_index);
var _index2 = require('./myApp/moduleA/index');
var $$_import_EJb_vtXT9l = _interopRequireWildcard(_index2);
var _index3 = require('./myApp/moduleB/index');
var $$_import_4yG_vtQ65l = _interopRequireWildcard(_index3);
var _index4 = require('./myApp/moduleC/index');
var $$_import_NJmbPFXa5g = _interopRequireWildcard(_index4);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var $$_export_VJZwKQT9l = {};
$$_export_VJZwKQT9l['index'] = $$_import_N1ebPFQ6qx;
$$_export_VJZwKQT9l['moduleA'] = {};
$$_export_VJZwKQT9l['moduleA']['index'] = $$_import_EJb_vtXT9l;
$$_export_VJZwKQT9l['moduleB'] = {};
$$_export_VJZwKQT9l['moduleB']['index'] = $$_import_4yG_vtQ65l;
$$_export_VJZwKQT9l['moduleC'] = {};
$$_export_VJZwKQT9l['moduleC']['index'] = $$_import_NJmbPFXa5g;
var myApp = $$_export_VJZwKQT9l;
```


## Usage

##### Via `.babelrc` (Recommended)
**.babelrc**

```json
{
  "plugins": ["babel-package-import"]
}
```

##### Via CLI

```sh
$ babel --plugins babel-package-import script.js
```

##### Via Node API

```jsx
import { transform } from 'babel-core';
transform('code', {
  plugins: ['babel-package-import']
});
```

## Installation

```
npm install --save-dev babel-package-import
```

## Import Cache

Babel Package Import will cache modules which has been imported for every file.

#### Example

##### In

```jsx
import * as myApp from './myApp/*';
import myApp2, { index as indexJS, moduleA } from './myApp/*';

```

##### Out(Raw)

```jsx
'use strict';
var _index = require('./myApp/index');
var $$_import_4ygTNmf9qx = _interopRequireWildcard(_index);
var _index2 = require('./myApp/moduleA/index');
var $$_import_4J_TNXM55e = _interopRequireWildcard(_index2);
var _index3 = require('./myApp/moduleB/index');
var $$_import_NkzTEmzq9e = _interopRequireWildcard(_index3);
var _index4 = require('./myApp/moduleC/index');
var $$_import_4JXpEmG99e = _interopRequireWildcard(_index4);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var $$_export_EyaEmM5qx = {};
$$_export_EyaEmM5qx['index'] = $$_import_4ygTNmf9qx;
$$_export_EyaEmM5qx['moduleA'] = {};
$$_export_EyaEmM5qx['moduleA']['index'] = $$_import_4J_TNXM55e;
$$_export_EyaEmM5qx['moduleB'] = {};
$$_export_EyaEmM5qx['moduleB']['index'] = $$_import_NkzTEmzq9e;
$$_export_EyaEmM5qx['moduleC'] = {};
$$_export_EyaEmM5qx['moduleC']['index'] = $$_import_4JXpEmG99e;
var myApp = $$_export_EyaEmM5qx;
var myApp2 = $$_export_EyaEmM5qx;
var _$$_export_EyaEmM5qx = $$_export_EyaEmM5qx;
var indexJS = _$$_export_EyaEmM5qx.index;
var moduleA = _$$_export_EyaEmM5qx.moduleA;

```

## License

[MIT license](https://github.com/RyanRoll/babel-package-import/blob/master/LICENSE).
