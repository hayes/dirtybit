module.exports = create
module.exports.parse = parse

var test = new RegExp('^(\\' + ['!', '+', '-', '~'].join('|\\') + ')(.+)$')

var ops = {}

function parse(lookup) {
  var parts = lookup.match(test)

  if(!parts) {
    return false
  }

  return {deps: [parts[2]], options: parts[1]}
}

function create(change, op) {
  if(!ops[op]) {
    ops[op] = create_op(op)
  }

  return ops[op].bind(null, change)
}

function create_op(op) {
  return Function('change, val', 'change(' + op + 'val)')
}
