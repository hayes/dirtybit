module.exports = function (root, scope) {
  var deps = {
    helpers: {},
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

function build (node, deps, scoped) {
  if (node.type === 'group') {
    return '(' + build(node.data.expression, deps, scoped) + ')'
  }

  if (node.type === 'number' || node.type === 'string' || node.type === 'keyword') {
    return node.value
  }

  if (node.type === 'unary') {
    return node.data.op + '(' + build(node.data.right, deps, scoped) + ')'
  }

  if (node.type === 'helper') {
    deps.helpers[node.value] = node
    return 'helpers["' + node.id + '"].value'
  }

  if (node.type === 'label') {
    var type = node.value in scoped ? 'scope' : 'data'
    deps[type] = true
    if (node.value === 'this') return 'data'
    return 'this.lookup(' + type + ', "' + node.value + '")'
  }

  if (node.type === 'member') {
    return 'this.lookup(' + build(node.data.left, deps, scoped) +
      ', "' + node.data.right.value + '")'
  }

  if (node.type === 'index') {
    return 'this.lookup(' + build(node.data.left, deps, scoped) +
      ', ' + build(node.data.right, deps, scoped) + ')'
  }

  if (node.type === 'binary') {
    return build(node.data.left, deps, scoped) + ' ' +
      node.data.op + ' ' + build(node.data.right, deps, scoped)
  }

  if (node.type === 'ternary') {
    return build(node.data.left, deps, scoped) + ' ? ' +
      build(node.data.middle, deps, scoped) + ' : ' +
      build(node.data.right, scoped)
  }

  if (node.type === 'array') {
    var arr = '['

    for (var i = 0, l = node.data.children.length - 1; i < l; ++i) {
      arr = arr + build(node.data.children[i], deps, scoped) + ', '
    }

    return arr + build(node.data.children[i], deps, scoped) + ']'
  }
}

function compile (raw, deps) {
  var body = '  this.setValue(' + raw + ')'

  if (deps.helpers.length) {
    body = '  var helpers = this.detector.helpers\n' + body
  }

  if (deps.data) {
    body = '  var data = this.detector.state\n' + body
  }

  if (deps.scope) {
    body = '  var scope = this.detector.scope\n' + body
  }

  return new Function('', body)
}
