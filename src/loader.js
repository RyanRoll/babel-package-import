// AST demo: http://astexplorer.net/#/4Ifn5ilohb/15

import path from 'path';
import fs from 'fs';
import shortid from 'shortid';

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_');

class PackageLoader {
  constructor(t, nodePath, state, packagePath) {
    let currentFileAbsPath = path.resolve(state.file.opts.filenameRelative, '..');
    this.t = t;
    this.nodePath = nodePath;
    this.packagePath = packagePath;
    this.exportVarName = '$$_export';
    this.namespace = '$$_import';
    this.packageAbsPath = path.resolve(currentFileAbsPath, packagePath);
  }
  load() {
    if ( fs.lstatSync(this.packageAbsPath).isDirectory() ) {
      this.assignImportToAnExportObject();
      this.loadPackage(this.packagePath, this.packageAbsPath);
      this.assignExport();
      // remove the original path
      this.nodePath.remove();
    }
  }
  assignImportToAnExportObject() {
    this.nodePath.insertBefore(
      this.t.variableDeclaration(
        'let',
        [
          this.t.variableDeclarator(
            this.t.identifier(this.exportVarName),
            this.t.objectExpression([])
          )
        ]
      )
    );
  }
  loadPackage(dirPath, dirAbsPath, exportExpression=this.t.identifier(this.exportVarName)) {
    let list = fs.readdirSync(dirAbsPath);
    let { name: dirNamespace } = path.parse(dirPath);
    list.forEach(fileName => {
      let file = path.join(dirAbsPath, fileName);
      let stat = fs.statSync(file);
      if ( stat.isFile() ) {
        let { name: subNamespace } = path.parse(file);
        let alias = this.namespace + '_' + shortid.generate();
        let importPath = this.getImportPath(dirPath, subNamespace);
        this.nodePath.insertBefore(
          this.t.importDeclaration(
            [this.t.importNamespaceSpecifier(this.t.identifier(alias))],
            this.t.stringLiteral(importPath)
          )
        );
        this.assignPackageVar(
          this.t.memberExpression(
            exportExpression,
            this.t.stringLiteral(subNamespace),
            true
          ),
          this.t.identifier(alias)
        );
      } else if ( stat.isDirectory() ) {
        let nextDirPath = this.getImportPath(dirPath, fileName);
        let nextDirAbsPath = dirAbsPath + '/' + fileName;
        let nextExportExpression = this.t.memberExpression(
          exportExpression,
          this.t.stringLiteral(fileName),
          true
        );
        this.assignPackageVar(nextExportExpression, this.t.objectExpression([]));
        this.loadPackage(nextDirPath, nextDirAbsPath, nextExportExpression);
      }
    });
  }
  getImportPath(dirPath, name) {
    return dirPath + ( dirPath.charAt(dirPath.length - 1) === '/' ? '' : '/' ) + name;
  }
  assignPackageVar(exportExpression, valueExpression) {
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
  assignExport() {
    let { nodePath: { node: { specifiers } } } = this;
    let exportName = null;
    let destructuringList = [];
    if ( specifiers.length > 1 ) {
      specifiers.forEach(specifier => {
        if ( this.t.isImportDefaultSpecifier(specifier) ) {
          exportName = specifier.local.name;
        } else if ( this.t.isImportSpecifier(specifier) ) {
          destructuringList.push(
            this.t.objectProperty(
              this.t.identifier(specifier.imported.name),
              this.t.identifier(specifier.local.name)
            )
          );
        }
      });
    } else {
      let [ firstSpecifier ] = specifiers;
      if ( this.t.isImportNamespaceSpecifier(firstSpecifier) ) {
        exportName = firstSpecifier.local.name;
      }
    }
    if ( exportName ) {
      this.nodePath.insertBefore(
        this.t.variableDeclaration(
          'let',
          [
            this.t.variableDeclarator(
              this.t.identifier(exportName),
              this.t.identifier(this.exportVarName)
            )
          ]
        )
      );
    }
    if ( destructuringList.length ) {
      this.nodePath.insertBefore(
        this.t.variableDeclaration(
          'let',
          [
            this.t.variableDeclarator(
              this.t.objectPattern(destructuringList),
              this.t.identifier(this.exportVarName)
            )
          ]
        )
      );
    }
  }
}

export default PackageLoader;
