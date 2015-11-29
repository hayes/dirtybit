var parse = require('./parse')

module.exports = remove

function remove (expression, handler) {
  var node = parse(expression)
  var exp

  if (!node || !(exp = this.expressions[node.value])) {
    return
  }

  exp.remove(handler)
}
