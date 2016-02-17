import test from 'tape';
import path from 'path';
import { types, traverse, transformFileSync } from 'babel-core';
import * as babylon from 'babylon';
import plugin from '../../lib/index';

test('● Test Plugin', t => {
  const { visitor } = plugin({ types });
  const falsifyNodePath = (callback) => {
    const importCode = `import myApp, { index as indexJS, moduleA } from './myApp/*';`;
    const importAst = babylon.parse(importCode, {sourceType: 'module'});
    let testedPlugin = false;
    const fakeState = {
      file: {
        opts: {
          filename: 'test/test.js',
          filenameRelative: 'test/test.js',
        }
      },
      opts: {
        callback: exportVarName => {
          if ( testedPlugin ) return;
          callback(exportVarName);
          // test once only
          testedPlugin = true;
        }
      }
    };
    const importVisitor = {
      ImportDeclaration(nodePath) {
        visitor.ImportDeclaration(nodePath, fakeState);
        delete importVisitor.ImportDeclaration;
      }
    };
    traverse(importAst, importVisitor);
  };

  // here we go
  falsifyNodePath((exportVarName) => {
    // test calling plugin
    if ( exportVarName ) {
      t.ok(exportVarName, 'call plugin successfully');
    } else {
      t.fail('failed to call plugin');
    }
    // test file
    let testFile = path.resolve(__dirname, '../test.js');
    let testedOnce = false;
    let { code } = transformFileSync(testFile, {
      plugins: [[plugin, {
        callback(exportName) {
          if ( testedOnce ) return;
          exportVarName = exportName;
          testedOnce = true;
        }
      }]]
    });
    t.ok(code.includes(`var myApp = ${exportVarName};`), 'test code');
    t.ok(code.includes(`var myApp2 = ${exportVarName};`), 'myApp === myApp2');
    t.end();
  });

});
