import test from 'tape';
import { types, traverse } from 'babel-core';
import * as babylon from 'babylon';
import generate from 'babel-generator';
import PackageLoader from '../../lib/loader';

test('● Test PackageLoader', t => {
  const packagePath = './myApp/';
  const falsifyNodePath = (callback) => {
    const importCode = `import myApp, { index as indexJS, moduleA } from '${packagePath}*';`;
    const importAst = babylon.parse(importCode, {sourceType: 'module'});
    const importVisitor = {
      ImportDeclaration(path) {
        callback(importCode, importAst, path);
        delete importVisitor.ImportDeclaration;
      }
    };
    traverse(importAst, importVisitor);
  };
  const start = (importCode, importAst, nodePath) => {
    const fakeState = {
      file: {
        opts: {
          filename: 'test/test.js',
          filenameRelative: 'test/test.js',
        }
      }
    };
    //let pathCopy = Object.assign({ __proto__: path.__proto__ }, path);
    let loader = new PackageLoader(types, nodePath, fakeState, packagePath);
    let exportVarNameForTest = `${loader.exportVarName}_ABCDEFGHIJ`;
    const generateAst = () => {
      return generate(importAst, null, importCode);
    };
    const clearPathContainer = (array=loader.nodePath.container) => {
      array.some(value => {
        let isPathNode = value.source && value._paths;
        if ( isPathNode ) {
          array.length = 0;
          array.push(value);
        }
        return isPathNode;
      });
    };
    const testCode = 'let foo = "bar";';
    const testAst = babylon.parse(testCode);
    let testPath;
    const testVisitor = {
      VariableDeclaration(nodePath) {
        testPath = nodePath;
        delete testVisitor.VariableDeclaration;
      }
    };
    traverse(testAst, testVisitor);
    const getExportVarByExpression = (expression) => {
      testPath.replaceWith(expression);
      return generate(testAst, {quotes: 'single'}, testCode).code;
    };

    t.test('> Test loader', t => {
      //t.ok(pathCopy.insertBefore, 'test the path copy');
      t.equal(loader.t, types, 'loader.t = types');
      t.equal(loader.nodePath, nodePath, 'loader.nodePath = nodePath');
      t.equal(loader.packagePath, packagePath, 'loader.packagePath = packagePath');
      console.log(`loader.currentFileAbsPath = ${loader.currentFileAbsPath}`);
      t.equal(loader.exportVarName, '$$_export', 'the original loader.exportVarName is "$$_export"');
      t.equal(loader.namespace, '$$_import', 'the original loader.namespace is "$$_import"');
      t.ok(loader.cache, 'get cache data');
      t.end();
    });

    t.test('> Test createExportObject()', t => {
      loader.createExportObject(exportVarNameForTest);
      let { code } = generateAst();
      t.ok(code.includes(`let ${exportVarNameForTest} = {};`), 'create the export variable');
      clearPathContainer();
      t.end();
    });

    t.test('> Test getImportPath()', t => {
      let fooPath = '.././foo/';
      let barPath = 'bar.js'
      let location = loader.getImportPath(fooPath, barPath);
      t.equal(location, fooPath + barPath, 'path is same');
      t.end();
    });

    t.test('> Test assignToPackageVar()', t => {
      // test "$$_export['foo'] = 'bar';"
      let exportExpression = types.memberExpression(
        types.identifier(loader.exportVarName),
        types.stringLiteral('foo'),
        true
      );
      let valueExpression = types.stringLiteral('bar');
      loader.assignToPackageVar(exportExpression, valueExpression);
      let { code } = generateAst();
      t.ok(code.includes(`$$_export['foo'] = 'bar';`), 'create a expression statement');
      clearPathContainer();
      t.end();
    });

    t.test('> Test assignToExport()', t => {
      loader.assignToExport(exportVarNameForTest);
      let { code } = generateAst();
      code = code.replace(/(\r\n|\n|\r)/gm, '');
      t.ok(code.includes(`let myApp = ${exportVarNameForTest};`), 'create the module variable');
      t.ok(
        code.includes(`let {  index: indexJS,  moduleA: moduleA} = ${exportVarNameForTest};`),
        'create specifiers'
      );
      clearPathContainer();
      t.end();
    });

    t.test('> Test loadPackage()', t => {
      let exportExpression = types.identifier(exportVarNameForTest);
      let testQueue = [];
      loader.loadPackage(packagePath, exportExpression, (handler, varExp, valueExp, importExp) => {
        //console.log(varExp, valueExp, importExp);
        let exportVar = getExportVarByExpression(
          types.expressionStatement(
            types.assignmentExpression(
              '=',
              varExp,
              valueExp
            )
          )
        );
        if ( handler === 'file' ) {
          testQueue.push({
            importCode: importExp ? getExportVarByExpression(importExp) : null,
            importVar: exportVar
          });
        } else { // directory
          testQueue.push({
            moduleVar: exportVar
          });
        }
      });
      let { code } = generateAst();
      testQueue.forEach((item, index) => {
        if ( item.hasOwnProperty('moduleVar') ) {
          let moduleVarIndex = code.indexOf(item.moduleVar);
          let nextItem = testQueue[index + 1];
          let importCodeIndex = code.indexOf(nextItem.importCode);
          t.notEqual(moduleVarIndex, -1, '[dynamic] test module assignment code');
          t.ok(
            importCodeIndex !== -1 && moduleVarIndex < importCodeIndex,
            '[dynamic] position of module assignment code is in front of module import code'
          );
        } else {
          let importCodeIndex = code.indexOf(item.importCode);
          let importVarIndex = code.indexOf(item.importVar);
          t.notEqual(importCodeIndex, -1, '[dynamic] test import code');
          t.notEqual(importVarIndex, -1, '[dynamic] test import variable code');
          t.ok(
            importVarIndex !== importCodeIndex && importCodeIndex < importVarIndex,
            '[dynamic] test code position'
          );
        }
      });
      clearPathContainer();
      t.end();
    });

    t.test('> Test load()', t => {
      let exportVarName = loader.load();
      let { code } = generateAst();
      t.ok(exportVarName, 'loaded package successfully');
      t.equal(code.includes(importCode), false, 'the original import code was removed');
      falsifyNodePath((code, ast, path) => {
        let newLoader = new PackageLoader(types, path, fakeState, packagePath);
        let newExportVarName = newLoader.load();
        t.ok(
          exportVarName === newExportVarName &&
            loader.cache.getLibrary() === newLoader.cache.getLibrary()
          ,
          'test cache'
        );
      });
      t.end();
    });

    t.end();
  };
  // here we go
  falsifyNodePath(start);
});
