module.exports = function (root, scope) {
  var deps = {
    id: 0,
    helpers: {},
    labels: {},
    vars: [],
    scope: false,
    data: false
  }

  var built = build(root, deps, scope || {})
  var helperNames = Object.keys(deps.helpers)
  var helpers = new Array(helperNames.length)

  for (var i = 0, len = helperNames.length; i < len; ++i) {
    helpers[i] = deps.helpers[helperNames[i]]
  }

  deps.helpers = helpers

  return {
    deps: deps,
    raw: root.value,
    body: built,
    compiled: compile(built, deps)
  }
}

module.exports.helper = function buildHelper (len) {
  if (!len) return new Function('update', 'update()')
  var body = 'update('

  for (var i = 0; i < len - 1; ++i) {
    body += 'deps[' + i + '].value, '
  }

  body += 'deps[' + i + '].value)'

  return new Function('update, deps', body)
}

function build (node, deps, scope) {
  if (node.type === 'group') {
    return '(' + build(node.data.expression, deps, scope) + ')'
  }

  if (node.type === 'number' || node.type === 'string' || node.type === 'keyword') {
    return node.value
  }

  if (node.type === 'unary') {
    return node.data.op + '(' + build(node.data.right, deps, scope) + ')'
  }

  if (node.type === 'helper') {
    deps.helpers[node.value] = node
    return 'helpers["' + node.id + '"].value'
  }

  if (node.type === 'label') {
    var type = node.value in scope ? 'scope' : 'data'
    deps[type] = true
    if (node.value === 'this') return 'data'
    if (deps.labels[node.value]) return deps.labels[node.value]
    var id = deps.labels[node.value] = lookup(type, '"' + node.value + '"')
    return id
  }

  if (node.type === 'member') {
    return lookup(makeVar(node.data.left), '"' + node.data.right.value + '"')
  }

  if (node.type === 'index') {
    return lookup(makeVar(node.data.left), makeVar(node.data.right))
  }

  if (node.type === 'binary') {
    return build(node.data.left, deps, scope) + ' ' +
      node.data.op + ' ' + build(node.data.right, deps, scope)
  }

  if (node.type === 'ternary') {
    return build(node.data.left, deps, scope) + ' ? ' +
      build(node.data.middle, deps, scope) + ' : ' +
      build(node.data.right, scope)
  }

  if (node.type === 'array') {
    var arr = '['

    for (var i = 0, l = node.data.children.length - 1; i < l; ++i) {
      arr = arr + build(node.data.children[i], deps, scope) + ', '
    }

    return arr + build(node.data.children[i], deps, scope) + ']'
  }

  function makeVar (node) {
    if (node.type === 'member' || node.type === 'index' || node.type === 'label') {
      return build(node, deps, scope)
    }

    var id = '_' + deps.id++
    deps.vars.push('var ' + id + ' = ' + build(node, deps, scope))
    return id
  }

  function lookup (left, right) {
    var id = '_' + deps.id++
    var statement = 'var ' + id + ' = ' + left + '!==null && ' + left +
      ' !== undefined ? ' + left + '[' + right + '] : undefined'

    deps.vars.push(statement)
    return id
  }
}

function compile (raw, deps) {
  var body = ''

  if (deps.helpers.length) {
    body = '  var helpers = this.detector.helpers\n' + body
  }

  if (deps.data) {
    body = '  var data = this.detector.state\n' + body
  }

  if (deps.scope) {
    body = '  var scope = this.detector.scope\n' + body
  }

  for (var i = 0, len = deps.vars.length; i < len; ++i) {
    body += '  ' + deps.vars[i] + '\n'
  }

  body += '  this.setValue(' + raw + ')'

  return new Function('', body)
}
