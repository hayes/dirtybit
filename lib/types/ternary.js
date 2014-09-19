var ternary_regexp = /^\s*(.+?)\s*\?(.*)\s*$/

module.exports = create
module.exports.parse = parse

function parse(lookup) {
  var parts = lookup.match(ternary_regexp)

  if(!parts) {
    return false
  }

  var rest = this.split(parts[2], ':')

  if(rest.length !== 2) {
    console.error('Unmatched ternary in: ' + lookup)
  }

  return {deps: [parts[1], rest[0], rest[1]]}
}

function create(change) {
  return function(ok, left, right) {
    change(ok ? left : right)
  }
}
