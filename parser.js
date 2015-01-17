var types = [group, array, keyword, number, string, label, unary]
var continuations = [helper, member, index, binary, ternary]
var keywords = ['true', 'false', 'null', 'undefined']
var unaryOperators = ['!', '+', '-', '~', 'void', 'instanceof']
var whitesapce = ' \xA0\uFEFF\f\n\r\t\v​\u00a0\u1680​\u180e\u2000​\u2001\u2002​\u2003\u2004\u2005\u2006​\u2007\u2008​\u2009\u200a​\u2028\u2029​\u202f\u205f​\u3000'.split('')
var reservedCharacters = whitesapce.concat('(){}[]|&^=><+-*%/\\!@#\'"~.,?:`'.split(''))
var boundary = whitesapce.concat(['('])
var binaryOperators = {
  '%': 5,
  '/': 5,
  '*': 5,
  '-': 6,
  '+': 6,
  '>>': 7,
  '<<': 7,
  '>>>': 7,
  '<': 8,
  '>': 8,
  '<=': 8,
  '>=': 8,
  instanceof: 8,
  in: 8,
  '!=': 9,
  '==': 9,
  '!==': 9,
  '===': 9,
  '&': 10,
  '|': 11,
  '^': 12,
  '&&': 13,
  '||': 14
}

var sortedBinaryOperators = Object.keys(binaryOperators).sort(function(l, r) {
  return l.length < r.length ? 1 : -1
})

module.exports.parse = parse
module.exports.compile = compile

function parse(str) {
  var ast = trim(str, expression, 0)
  var built = build(ast, [])
  return {
    deps: built.deps,
    raw: str,
    body: built.body,
    compiled: compile(built.body)
  }
}

function expression(str, start, end) {
  if(!str || !str[start]) return null
  for(var i = 0, l = types.length; i < l; ++i) {
    var node = types[i](str, start, end)
    if(node) break
  }

  if(!node) {
    throw new Error(
      'Unexpected token: ' + str[start] + ' in "' + str.slice(start, 20) + '"'
    )
  }

  var cur = node.range[1]
  while(whitesapce.indexOf(str[cur]) !== -1) cur = cur + 1

  return end.indexOf(str[cur]) !== -1 ? node : continueExpression(str, node, end)
}

function continueExpression(str, node, end) {
  var start = node.range[1]
  while(str[start] && end.indexOf(str[start]) === -1) {
    node = trim(str, findContinuation, start, end)
    start = node.range[1]
    while(whitesapce.indexOf(str[start]) !== -1) start = start + 1
  }

  if(end.indexOf(str[start]) === -1) {
    throw new Error(
      'Expected to find token: ' + end
    )
  }

  return node

  function findContinuation(str, start, end) {
    for(var i = 0, l = continuations.length; i < l; ++i) {
      var continuation = continuations[i](node, str, start, end)
      if(continuation) break
    }

    if(!continuation) {
      throw new Error(
        'Unexpected token: ' + str[start] + ' in "' + str.slice(start, start + 20) + '"'
      )
    }

    return continuation
  }
}

function keyword(str, start) {
  for(var i = 0, l = keywords.length; i < l; ++i) {
    var word = keywords[i]
    for(var j = 0, l2 = word.length; j < l2; ++j) {
      if(str[start + j] !== word[j]) break
    }

    if(j === l2) break
  }

  if(i === l) return null

  return {
    type: 'keyword',
    value: word,
    range: [start, start + word.length]
  }
}

function string(str, start) {
  var open = str[start]
  if(open !== '"' && open !== '\'') return null
  var cur = start + 1
  var chr
  while((chr = str[cur]) && chr !== open) {
    if(str === '\\') ++cur
    cur = cur + 1
  }

  if(str[cur++] !== open) throw new Error('Expected string to be closed')
  return {value: str.slice(start, cur), type: 'string', range: [start, cur]}
}

function number(str, start) {
  var decimal = false
  var cur = start
  var chr
  while(chr = str[cur]) {
    if(chr === '.') {
      if(decimal) break
      decimal = true
      cur = cur + 1
      continue
    }
    if(chr < '0' || chr > '9') break
    cur = cur + 1
  }

  return cur - start ?
    {value: str.slice(start, cur), type: 'number', range: [start, cur]} :
    null
}

function label(str, start) {
  var decimal = false
  var chr = str[start]
  if(chr < 0 || chr > 9 || reservedCharacters.indexOf(chr) !== -1) return null
  var cur = start + 1

  while(chr = str[cur]) {
    if(reservedCharacters.indexOf(chr) !== -1) break
    cur = cur + 1
  }

  return {value: str.slice(start, cur), type: 'label', range: [start, cur]}
}

function array(str, start) {
  if(str[start] !== '[') return null
  var cur = start + 1
  var children = []
  var next
  var ends = [',', ']']
  while(next = trim(str, expression, cur, ends)) {
    children.push(next)
    cur = next.range[1]
    while(ends.indexOf(str[cur]) === -1) cur = cur + 1
    if(str[cur] === ']') break
    cur = cur + 1
  }

  return {
    type: 'array',
    children: children,
    range: [start, cur + 1]
  }
}

function group(str, start) {
  if(str[start] !== '(') return null

  var node = trim(str, expression, start + 1, [')'])
  var end = node.range[1]
  while(whitesapce.indexOf(str[end]) !== -1) end = end + 1
  return {
    type: 'group',
    range: [start, end + 1],
    expression: node
  }
}

function helper(left, str, start, end) {
  if(left.type !== 'label' || str[start] !== '(') return
  var cur = start + 1
  var children = []
  var next
  var ends = [',', ')']
  while(next = trim(str, expression, cur, ends)) {
    children.push(next)
    cur = next.range[1]
    while(ends.indexOf(str[cur]) === -1) cur = cur + 1
    if(str[cur] === ')') break
    cur = cur + 1
  }

  cur = cur + 1

  return {
    type: 'helper',
    left: left,
    children: children,
    range: [left.range[0], cur],
    value: str.slice(left.range[0], cur)
  }
}

function member(left, str, start) {
  if(str[start] !== '.') return null
  var node = label(str, start + 1)

  if(!node) throw new Error('Expected Label')
  return {
    type: 'member',
    left: left,
    right: node,
    range: [start, node.range[1]]
  }
}

function index(left, str, start) {
  if(str[start] !== '[') return null
  var node = trim(str, expression, start + 1, [']'])
  var end = node.range[1] + 1
  while(whitesapce.indexOf(str[end]) !== -1) end = end + 1
  return {
    type: 'index',
    left: left,
    right: node,
    range: [start, end]
  }
}

function unary(str, start, end) {
  for(var i = 0, l = unaryOperators.length; i < l; ++i) {
    var op = unaryOperators[i]
    for(var j = 0, l2 = op.length; j < l2; ++j) {
      if(str[start + j] !== op[j]) break
    }

    if(j === l2) break
  }

  if(i === l) return null
  var len = op.length
  var next = str[start + len]
  if(len > 1 && boundary.indexOf(next) === '-1') return null
  var child = trim(str, expression, start + len, end)
  var node = {
    type: 'unary',
    op: op,
    right: child,
    range: [start, child.range[1]],
    presidence: 4
  }

  if(child.presidence && child.presidence > 4) {
    node.right = child.left
    child.left = node
    return child
  }

  return node
}

function binary(left, str, start, end) {
  for(var i = 0, l = sortedBinaryOperators.length; i < l; ++i) {
    var op = sortedBinaryOperators[i]
    for(var j = 0, l2 = op.length; j < l2; ++j) {
      if(str[start + j] !== op[j]) break
    }

    if(j === l2) break
  }

  if(i === l) return null
  if(op === 'in' || op === 'instanceof') {
    var next = str[start + op.length]
    if(boundary.indexOf(next) === -1) return null
  }

  var presidence = binaryOperators[op]
  var right = trim(str, expression, start + op.length, end)
  var node = {
    type: 'binary',
    op: op,
    range: [start, right.range[1]],
    left: left,
    right: right,
    presidence: presidence
  }

  if(right.presidence && right.presidence >= presidence) {
    node.right = right.left
    right.left = node
    return right
  }

  return node
}

function ternary(condition, str, start, end) {
  if(str[start] !== '?') return null
  var ok = trim(str, expression, start + 1, [':'])
  if(!ok) throw new Error('Expected token: ":"')
  var next = ok.range[1] + 1
  while(whitesapce.indexOf(str[next]) !== -1) next = next + 1
  var not = trim(str, expression, next + 1, end)

  return {
    type: 'ternary',
    range: [start, not.range[1]],
    left: condition,
    middle: ok,
    right: not,
    presidence: 15
  }
}

function trim(str, parse, start, end) {
  while(chr = str[start]) {
    if(whitesapce.indexOf(chr) === -1) break
    start = start + 1
  }

  return parse(str, start, end || [undefined])
}

function build(node, deps) {
  if(node.type === 'group') {
    var group = build(node.expression, deps)
    return {
      deps: group.deps,
      body: '(' + group.body + ')'
    }
  }

  if(node.type === 'number' || node.type === 'string' || node.type === 'keyword') {
    return {body: node.value, deps: []}
  }

  if(node.type === 'unary') {
    var child = build(node.right, deps)
    return {body: node.op + '(' + child.body + ')', deps: child.deps}
  }

  if(node.type === 'label' || node.type === 'helper') {
    var newDeps = addDep(node, deps)
    return {body: 'arguments[' + newDeps.index + ']', deps: newDeps.deps}
  }

  if(node.type === 'member') {
    var left = build(node.left, deps)
    'this.lookup(' + left.body + ', "' + node.right.value + '")'
    return {
      body: 'this.lookup(' + left.body + ', "' + node.right.value + '")',
      deps: left.deps
    }
  }

  if(node.type === 'index') {
    var left = build(node.left, deps)
    var right = build(node.right, deps.concat(left.deps))
    return {
      body: 'this.lookup(' + left.body + ', ' + right.body + ')',
      deps: left.deps.concat(right.deps)
    }
  }

  if(node.type === 'binary') {
    var left = build(node.left, deps)
    var right = build(node.right, deps.concat(left.deps))
    return {
      body: left.body + ' ' + node.op + ' ' + right.body,
      deps: left.deps.concat(right.deps)
    }
  }

  if(node.type === 'ternary') {
    var left = build(node.left, deps)
    var middle = build(node.middle, deps)
    var right = build(node.right, deps.concat(left.deps))
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
    for(var i = 0, l = node.children.length - 1; i < l; ++i) {
      child = build(node.children[i], allDeps)
      body += child.body + ', '
      newDeps = newDeps.concat(child.deps)
      allDeps = deps.concat(newDeps)
    }

    child = build(node.children[i], allDeps)

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
