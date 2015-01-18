module.exports = function(node) {
  var built = build(node, [])
  return {
    deps: built.deps,
    raw: node.value,
    body: built.body,
    compiled: compile(built.body),
  }
}

function build(node, deps) {
  if(node.type === 'group') {
    var group = build(node.data.expression, deps)
    return {
      deps: group.deps,
      body: '(' + group.body + ')'
    }
  }

  if(node.type === 'number' || node.type === 'string' || node.type === 'keyword') {
    return {body: node.value, deps: []}
  }

  if(node.type === 'unary') {
    var child = build(node.data.right, deps)
    return {body: node.data.op + '(' + child.body + ')', deps: child.deps}
  }

  if(node.type === 'label' || node.type === 'helper') {
    var newDeps = addDep(node, deps)
    return {body: 'arguments[' + newDeps.index + ']', deps: newDeps.deps}
  }

  if(node.type === 'member') {
    var left = build(node.data.left, deps)
    'this.lookup(' + left.body + ', "' + node.data.right.value + '")'
    return {
      body: 'this.lookup(' + left.body + ', "' + node.data.right.value + '")',
      deps: left.deps
    }
  }

  if(node.type === 'index') {
    var left = build(node.data.left, deps)
    var right = build(node.data.right, deps.concat(left.deps))
    return {
      body: 'this.lookup(' + left.body + ', ' + right.body + ')',
      deps: left.deps.concat(right.deps)
    }
  }

  if(node.type === 'binary') {
    var left = build(node.data.left, deps)
    var right = build(node.data.right, deps.concat(left.deps))
    return {
      body: left.body + ' ' + node.data.op + ' ' + right.body,
      deps: left.deps.concat(right.deps)
    }
  }

  if(node.type === 'ternary') {
    var left = build(node.data.left, deps)
    var middle = build(node.data.middle, deps)
    var right = build(node.data.right, deps.concat(left.deps))
    return {
      body: left.body + ' ? ' + middle.body + ' : ' + right.body,
      deps: left.deps.concat(middle.deps, right.deps)
    }
  }

  if(node.type === 'helper') {
    var newDeps = addDep(node, deps)
    return {body: 'arguments[' + newDeps.index + ']', deps: newDeps.deps}
  }

  if(node.type === 'array') {
    var allDeps = deps
    var newDeps = []
    var deps = []
    var body = '['
    var child
    for(var i = 0, l = node.data.children.length - 1; i < l; ++i) {
      child = build(node.data.children[i], allDeps)
      body += child.body + ', '
      newDeps = newDeps.concat(child.deps)
      allDeps = deps.concat(newDeps)
    }

    child = build(node.data.children[i], allDeps)

    return {
      body: body += child.body + ']',
      deps: newDeps.concat(child.deps)
    }
  }
}

function addDep(node, deps) {
  for(var i = 0, l = deps.length; i < l; ++i) {
    if(node.value === deps[i].value) break
  }

  if(i === l) return {index: i, deps: [node]}
  return {index: i, deps: []}
}

function compile(raw) {
  return new Function('', 'return (' + raw + ')').bind({
    lookup: lookup
  })
}

function lookup(root, prop) {
  return typeof root === 'null' || typeof root === 'undefined' ?
    undefined :
    root[prop]
}
