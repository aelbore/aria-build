import { join, resolve } from 'path'

import { KeyValue } from '../common/common'
import { MagicString, ts } from '../libs'

/* istanbul ignore next */
function transformCode(code: string) {
  const magicString = new MagicString(code)
  return { 
    code: magicString.toString(), 
    map: magicString.generateMap({ hires: true })  
  }
}

function createUpdateImportDeclaration(node: ts.ImportDeclaration, specifiers: KeyValue, key?: string) {
  return ts.updateImportDeclaration(node, 
    node.decorators, 
    node.modifiers, 
    node.importClause, 
    key ? ts.createStringLiteral(specifiers[key]): node.moduleSpecifier)
}

function transformModuleSpecifier(specifiers?: KeyValue) {
  return (context: ts.TransformationContext) => {
    const visitor = (node: any) => {
      if (ts.isImportDeclaration(node) && specifiers) {
        const keys = Object.keys(specifiers)
        const text = getText(node.moduleSpecifier as ts.Identifier).replace(/'|"/g, '')
        const key = keys.find(key => key.includes(text))
        return createUpdateImportDeclaration(node, specifiers, key)
      }
      return ts.visitEachChild(node, (child) => visitor(child), context)
    }
    return visitor
  }
}

/* istanbul ignore next */
function getText(identifier: ts.Identifier) {
  return identifier.hasOwnProperty('escapedText')
    ? identifier.escapedText.toString()
    : identifier.text
}

export function transform(file: string, content: string, specifiers: KeyValue) {
  const magicString = new MagicString(content)

  const sourceFile = ts.createSourceFile(file, magicString.toString(), ts.ScriptTarget.ESNext, false)
  const result = ts.transform(sourceFile, [ transformModuleSpecifier(specifiers) ])
  const transformed = result.transformed[0]
  return {
    code: ts.createPrinter().printFile(transformed),
    map: magicString.generateMap({ hires: true })
  }
} 

/* istanbul ignore next */
export function transformImport(specifiers?: KeyValue) {
  return {
    name: 'transformImport',    
    transform (code: string, id: string) {  
      return (!id.includes(join(resolve(), 'node_modules')))
        ? transform(id, code, specifiers)
        : transformCode(code)
    }
  }
}