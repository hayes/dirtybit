module.exports = create
module.exports.parse = parse

var tests = []
var ops = {}

add(['|\\|'])
add(['&&'])
add(['|'])
add(['^'])
add(['&'])
add(['===', '!==', '==', '!='])
add(['>=', '<=', '>', '<', ' in ', ' instanceof '])
// add(['<<', '>>', '>>>']) //conflics with < and >
add(['+', '-'])
add(['*', '/', '%'])

ops['in'] = updateIn
ops['instanceof'] = updateInstanceof

function add(list) {
  tests.push(new RegExp('^(.+?)(\\' + list.join('|\\') + ')(.+)$'))
}

function parse(lookup) {
  var parts

  for(var i = 0, l = tests.length; i < l; ++i) {
    parts = lookup.match(tests[i])

    if(parts) {
      break
    }
  }

  if(!parts) {
    return false
  }

  return {deps: [parts[1], parts[3]], options: parts[2]}
}

function create(change, op) {
  if(!ops[op]) {
    ops[op] = createOp(op)
  }

  return ops[op].bind(null, change)
}

function createOp(op) {
  return Function('change, left, right', 'change(left ' + op + ' right)')
}

function updateIn(left, right) {
  return typeof right !== 'undefined' && left in right
}

function updateInstanceof(left, right) {
  return typeof right === 'function' && left instanceof right
}
