var parse = require('./parse')
var build = require('./build')
var Expression = require('./expression')

module.exports = watch

function watch (expression, handler) {
  var exp = this.expressions[expression]

  if (!exp) {
    exp = watchNode(this, parse(expression), handler)
    if (handler) {
      handler(exp.value)
    }
  } else if (exp.handlers.indexOf(handler) === -1) {
    exp.handlers.push(handler)
    handler(exp.value)
  }

  return exp
}

function watchNode (detector, node, handler) {
  var expression

  if (detector.expressions[node.value]) return detector.expressions[node.value]
  if (node.type === 'helper') {
    expression = watchHelper(detector, node, handler)
  } else {
    expression = watchExpression(detector, node)
  }

  expression.update(false)

  if (handler) {
    expression.handlers.push(handler)
  }

  return expression
}

function watchExpression (detector, node) {
  var built = build(node, detector.scope)
  var helpers = built.deps.helpers
  var len = helpers.length
  var deps = new Array(len)

  for (var i = 0; i < len; ++i) {
    deps[i] = watchNode(detector, built.deps.helpers[i])
  }

  if ((built.deps.data || built.deps.scope) && detector.root) {
    deps.push(detector.root)
  }

  var expression = new Expression(detector, built.compiled, node, deps)

  detector.expressions[node.value] = expression

  return expression
}

function watchHelper (detector, node) {
  var name = node.data.left.value
  var constructor = detector.helpers[name]
  if (!constructor) {
    throw new Error('Unknown helper: ' + name)
  }

  var children = node.data.children
  var len = children.length
  var deps = new Array(len)

  for (var i = 0; i < len; ++i) {
    deps[i] = watchNode(detector, children[i])
  }

  var helper = constructor(change)

  if (typeof helper !== 'function') {
    throw new Error('helper ' + name + ' did not return a function')
  }

  var built = build.helper(deps.length)
  var expression = new Expression(detector, check, node, deps)

  detector.expressions[node.value] = expression
  detector.helpers[node.id] = expression

  return expression

  function change (value) {
    return expression.setValue(value)
  }

  function check () {
    return built(helper, deps)
  }
}
