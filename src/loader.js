// AST demo: http://astexplorer.net/#/4Ifn5ilohb/18
import path from 'path';
import fs from 'fs';
import shortid from 'shortid';
import importCache from './cache';

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_');

class PackageLoader {
  constructor(t, nodePath, state, packagePath) {
    let opts = state.file.opts;
    this.t = t;
    this.nodePath = nodePath;
    this.packagePath = packagePath;
    this.currentFileAbsPath = path.resolve(opts.filenameRelative, '..');
    this.exportVarName = '$$_export';
    this.namespace = '$$_import';
    this.cache = importCache.getCache(state);
  }
  load(progress=()=>{}) {
    let packageAbsPath = path.resolve(this.currentFileAbsPath, this.packagePath);
    if ( fs.lstatSync(packageAbsPath).isDirectory() ) {
      let cachedLibrary = this.cache.getLibrary();
      let exportVarName = cachedLibrary || `${this.exportVarName}_${shortid.generate()}`;
      if ( ! cachedLibrary ) {
        this.createExportObject(exportVarName);
        this.loadPackage(this.packagePath, this.t.identifier(exportVarName), progress);
      }
      this.assignToExport(exportVarName);
      // remove the original path
      this.nodePath.remove();
      this.cache.setLibrary(exportVarName);
      return exportVarName;
    } else {
      console.warn(`"${packageAbsPath}" is not a directory.`);
    }
  }
  createExportObject(exportVarName) {
    // let $$_export = {};
    this.nodePath.insertBefore(
      this.t.variableDeclaration(
        'let',
        [
          this.t.variableDeclarator(
            this.t.identifier(exportVarName),
            this.t.objectExpression([])
          )
        ]
      )
    );
  }
  loadPackage(dirPath, exportExpression, progress=()=>{}) {
    let dirAbsPath = path.resolve(this.currentFileAbsPath, dirPath);
    let list = fs.readdirSync(dirAbsPath);
    let { name: dirNamespace } = path.parse(dirPath);
    list.forEach(fileName => {
      let file = path.join(dirAbsPath, fileName);
      let stat = fs.statSync(file);
      if ( stat.isFile() ) {
        let cachedFile = this.cache.getFile(file);
        let { name: subNamespace } = path.parse(file);
        let importExpression;
        if ( ! cachedFile ) {
          let alias = `${this.namespace}_${shortid.generate()}`;
          let importPath = this.getImportPath(dirPath, subNamespace);
          // import * as $alias from '$importPath';
          importExpression = this.t.importDeclaration(
            [this.t.importNamespaceSpecifier(this.t.identifier(alias))],
            this.t.stringLiteral(importPath)
          );
          this.nodePath.insertBefore(importExpression);
          cachedFile = this.t.identifier(alias);
          this.cache.setFile(file, cachedFile);
        }
        let varExpression = this.t.memberExpression(
          exportExpression,
          this.t.stringLiteral(subNamespace),
          true
        );
        this.assignToPackageVar(
          varExpression,
          cachedFile
        );
        progress('file', varExpression, cachedFile, importExpression);
      } else if ( stat.isDirectory() ) {
        let nextDirPath = this.getImportPath(dirPath, fileName);
        let nextExportExpression = this.t.memberExpression(
          exportExpression,
          this.t.stringLiteral(fileName),
          true
        );
        // $$_export['$module'] = {};
        let valueExpression = this.t.objectExpression([]);
        this.assignToPackageVar(nextExportExpression, valueExpression);
        progress('directory', nextExportExpression, valueExpression);
        this.loadPackage(nextDirPath, nextExportExpression, progress);
      }
    });
  }
  // get raw path instead of path.join
  getImportPath(dirPath, name) {
    return dirPath + ( dirPath.charAt(dirPath.length - 1) === '/' ? '' : '/' ) + name;
  }
  assignToPackageVar(exportExpression, valueExpression) {
    // $$_export['$module'] = $value;
    this.nodePath.insertBefore(
      this.t.expressionStatement(
        this.t.assignmentExpression(
          '=',
          exportExpression,
          valueExpression
        )
      )
    );
  }
  assignToExport(exportVarName) {
    let { nodePath: { node: { specifiers } } } = this;
    let exportAlias = null;
    let destructuringList = [];
    // import myApp, { index, moduleA } from './myApp/*';
    if ( specifiers.length ) {
      specifiers.forEach(specifier => {
        if ( this.t.isImportDefaultSpecifier(specifier) ) {
          exportAlias = specifier.local.name;
        } else if ( this.t.isImportSpecifier(specifier) ) {
          destructuringList.push(
            this.t.objectProperty(
              this.t.identifier(specifier.imported.name),
              this.t.identifier(specifier.local.name)
            )
          );
        } else {
          // Only import * as myApp from './myApp/*';
          let [ firstSpecifier ] = specifiers;
          if ( this.t.isImportNamespaceSpecifier(firstSpecifier) ) {
            exportAlias = firstSpecifier.local.name;
          }
        }
      });
    }
    // let myApp = $$_export;
    if ( exportAlias ) {
      this.nodePath.insertBefore(
        this.t.variableDeclaration(
          'let',
          [
            this.t.variableDeclarator(
              this.t.identifier(exportAlias),
              this.t.identifier(exportVarName)
            )
          ]
        )
      );
    }
    // let {a: A, b} = $$_export;
    if ( destructuringList.length ) {
      this.nodePath.insertBefore(
        this.t.variableDeclaration(
          'let',
          [
            this.t.variableDeclarator(
              this.t.objectPattern(destructuringList),
              this.t.identifier(exportVarName)
            )
          ]
        )
      );
    }
  }
}

export default PackageLoader;
