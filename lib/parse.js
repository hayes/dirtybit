var hash = require('./hash')

var types = [group, array, keyword, number, string, label, unary]
var continuations = [helper, member, index, binary, ternary]
var keywords = ['true', 'false', 'null', 'undefined']
var keywordValues = [true, false, null, undefined]
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

var sortedBinaryOperators = Object.keys(binaryOperators).sort(function (l, r) {
  return l.length < r.length ? 1 : -1
})

module.exports = parse

var cache = module.exports.cache = {}

function parse (str) {
  return cache[str] || (cache[str] = trim(str, expression, 0))
}

function expression (str, start, end) {
  if (!str || !str[start]) return null
  for (var i = 0, l = types.length; i < l; ++i) {
    var node = types[i](str, start, end)
    if (node) break
  }

  if (!node) {
    throw new Error(
      'Unexpected token: ' + str[start] + ' in "' + str.slice(start, 20) + '"'
    )
  }

  var cur = node.range[1]
  while (whitesapce.indexOf(str[cur]) !== -1) cur = cur + 1

  return end.indexOf(str[cur]) !== -1 ? node : continueExpression(str, node, end)
}

function continueExpression (str, node, end) {
  var start = node.range[1]
  while (str[start] && end.indexOf(str[start]) === -1) {
    node = trim(str, findContinuation, start, end)
    start = node.range[1]
    while (whitesapce.indexOf(str[start]) !== -1) start = start + 1
  }

  if (end.indexOf(str[start]) === -1) {
    throw new Error(
      'Expected to find token: ' + end
    )
  }

  return node

  function findContinuation (str, start, end) {
    for (var i = 0, l = continuations.length; i < l; ++i) {
      var continuation = continuations[i](node, str, start, end)
      if (continuation) break
    }

    if (!continuation) {
      throw new Error(
        'Unexpected token: ' + str[start] + ' in "' + str.slice(start, start + 20) + '"'
      )
    }

    return continuation
  }
}

function keyword (str, start) {
  for (var i = 0, l = keywords.length; i < l; ++i) {
    var word = keywords[i]
    for (var j = 0, l2 = word.length; j < l2; ++j) {
      if (str[start + j] !== word[j]) break
    }

    if (j === l2) break
  }

  if (i === l) return null

  return new Node(
    'keyword',
    [start, start + word.length],
    str,
    null,
    true,
    keywordValues[word]
  )
}

function string (str, start) {
  var open = str[start]
  if (open !== '"' && open !== '\'') return null
  var cur = start + 1
  var chr = str[cur]
  while ((chr) && chr !== open) {
    if (str === '\\') ++cur
    cur = cur + 1
    chr = str[cur]
  }

  if (str[cur++] !== open) throw new Error('Expected string to be closed')
  return new Node(
    'string',
    [start, cur],
    str,
    null,
    true,
    str.slice(start + 1, cur - 1)
  )
}

function number (str, start) {
  var decimal = false
  var cur = start
  var chr = str[cur]
  while (chr) {
    if (chr === '.') {
      if (decimal) break
      decimal = true
    } else if (chr < '0' || chr > '9') break
    cur = cur + 1
    chr = str[cur]
  }

  return cur - start ? new Node(
    'number',
    [start, cur],
    str,
    null,
    true,
    parseInt(str.slice(start, cur), 10)
  ) : null
}

function label (str, start) {
  var chr = str[start]
  if (chr < 0 || chr > 9 || reservedCharacters.indexOf(chr) !== -1) return null
  var cur = start + 1
  chr = str[cur]

  while (chr) {
    if (reservedCharacters.indexOf(chr) !== -1) break
    cur = cur + 1
    chr = str[cur]
  }

  return new Node('label', [start, cur], str, null)
}

function array (str, start) {
  if (str[start] !== '[') return null
  var cur = start + 1
  var children = []
  var ends = [',', ']']
  var next = trim(str, expression, cur, ends)
  while (next) {
    children.push(next)
    cur = next.range[1]
    while (ends.indexOf(str[cur]) === -1) cur = cur + 1
    if (str[cur] === ']') break
    cur = cur + 1
    next = trim(str, expression, cur, ends)
  }

  return new Node('array', [start, cur + 1], str, {
    children: children
  })
}

function group (str, start) {
  if (str[start] !== '(') return null

  var node = trim(str, expression, start + 1, [')'])
  var end = node.range[1]
  while (whitesapce.indexOf(str[end]) !== -1) end = end + 1
  return new Node('group', [start, end + 1], str, {
    expression: node
  })
}

function helper (left, str, start, end) {
  if (left.type !== 'label' || str[start] !== '(') return
  var cur = start + 1
  var children = []
  var ends = [',', ')']
  var next = trim(str, expression, cur, ends)
  while (next) {
    children.push(next)
    cur = next.range[1]
    while (ends.indexOf(str[cur]) === -1) cur = cur + 1
    if (str[cur] === ')') break
    cur = cur + 1
    next = trim(str, expression, cur, ends)
  }

  cur = cur + 1

  return new Node('helper', [left.range[0], cur], str, {
    left: left,
    children: children
  })
}

function member (left, str, start) {
  if (str[start] !== '.') return null
  var node = label(str, start + 1)

  if (!node) throw new Error('Expected Label')
  return new Node('member', [left.range[0], node.range[1]], str, {
    left: left,
    right: node
  })
}

function index (left, str, start) {
  if (str[start] !== '[') return null
  var node = trim(str, expression, start + 1, [']'])
  var end = node.range[1] + 1
  while (whitesapce.indexOf(str[end]) !== -1) end = end + 1
  return new Node('index', [left.range[0], end], str, {
    left: left,
    right: node
  })
}

function unary (str, start, end) {
  for (var i = 0, l = unaryOperators.length; i < l; ++i) {
    var op = unaryOperators[i]
    for (var j = 0, l2 = op.length; j < l2; ++j) {
      if (str[start + j] !== op[j]) break
    }

    if (j === l2) break
  }

  if (i === l) return null
  var len = op.length
  var next = str[start + len]
  if (len > 1 && boundary.indexOf(next) === '-1') return null
  var child = trim(str, expression, start + len, end)
  var node = new Node('unary', [start, child.range[1]], str, {
    op: op,
    right: child,
    presidence: 4
  })

  if (child.presidence && child.presidence > 4) {
    node.right = child.left
    child.left = node
    return child
  }

  return node
}

function binary (left, str, start, end) {
  for (var i = 0, l = sortedBinaryOperators.length; i < l; ++i) {
    var op = sortedBinaryOperators[i]
    for (var j = 0, l2 = op.length; j < l2; ++j) {
      if (str[start + j] !== op[j]) break
    }

    if (j === l2) break
  }

  if (i === l) return null
  if (op === 'in' || op === 'instanceof') {
    var next = str[start + op.length]
    if (boundary.indexOf(next) === -1) return null
  }

  var presidence = binaryOperators[op]
  var right = trim(str, expression, start + op.length, end)
  var node = new Node('binary', [left.range[0], right.range[1]], str, {
    op: op,
    left: left,
    right: right,
    presidence: presidence
  })

  if (right.presidence && right.presidence >= presidence) {
    node.right = right.left
    right.left = node
    return right
  }

  return node
}

function ternary (condition, str, start, end) {
  if (str[start] !== '?') return null
  var ok = trim(str, expression, start + 1, [':'])
  if (!ok) throw new Error('Expected token: ":"')
  var next = ok.range[1] + 1
  while (whitesapce.indexOf(str[next]) !== -1) next = next + 1
  var not = trim(str, expression, next + 1, end)

  return new Node('ternary', [condition.range[0], not.range[1]], str, {
    left: condition,
    middle: ok,
    right: not,
    presidence: 15
  })
}

function trim (str, parse, start, end) {
  var chr = str[start]
  while (chr) {
    if (whitesapce.indexOf(chr) === -1) break
    start = start + 1
    chr = str[start]
  }

  return parse(str, start, end || [undefined])
}

function Node (type, range, str, data, litteral, val) {
  this.type = type
  this.range = range
  this.value = str.slice(range[0], range[1])
  this.id = '_' + hash(this.value)
  this.data = data
  this.litteral = !!litteral
  this.rawValue = val
}
