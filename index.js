"use strict"

const skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g

module.exports = function(Parser) {
  const tt = (Parser.acorn || require("acorn")).tokTypes

  return class extends Parser {
    parseExport(node, exports) {
      skipWhiteSpace.lastIndex = this.pos
      const skip = skipWhiteSpace.exec(this.input)
      const next = this.input.charAt(this.pos + skip[0].length)
      if (next !== "*") return super.parseExport(node, exports)

      this.next()
      this.expect(tt.star)
      if (this.eatContextual("as")) {
        node.exported = this.parseIdent(true)
        this.checkExport(exports, node.exported.name, node.exported.start)
      } else node.exported = null
      this.expectContextual("from")
      if (this.type !== tt.string) this.unexpected()
      node.source = this.parseExprAtom()
      this.semicolon()
      return this.finishNode(node, "ExportAllDeclaration")
    }
  }
}
