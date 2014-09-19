var has_bracket = /^.*\S\[.+\]$/

module.exports = brackets
module.exports.parse = parse

function parse(lookup) {
  if(!has_bracket.test(lookup)) {
    return false
  }

  var pairs = this.split.pairs.map(function(pair) {
    return [pair[1], pair[0], pair[2]]
  })

  return {
      deps: this.split(reverse(lookup.slice(0, -1)), '[', false, pairs)
        .map(reverse)
  }
}

function reverse(str) {
  return str.split('').reverse().join('')
}

function brackets(change) {
  return function(inner, root) {
    if(root === null || root === undefined) {
      return change()
    }

    change(root[inner])
  }
}
