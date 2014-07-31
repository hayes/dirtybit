var has_bracket = /^.+\[.+\]$/

module.exports = dot_path

function dot_path(lookup) {
  if(!has_bracket.test(lookup)) {
    return
  }

  var pairs = this.split.pairs.map(function(pair) {
    return [pair[1], pair[0], pair[2]]
  })

  var parts = this.split(reverse(lookup.slice(0, -1)), '[', false, pairs)
    .map(reverse)

  var self = this
    , inner
    , root

  this.register(parts[0], update_inner, false, lookup)
  this.register(parts[1], update_root, false, lookup)

  function update_inner(val) {
    inner = val
    update()
  }

  function update_root(val) {
    root = val
    update()
  }

  return true

  function update() {
    if(root === null || root === undefined) {
      return self.updateValue(lookup, undefined)
    }

    self.updateValue(lookup, root[inner])
  }
}

function reverse(str) {
  return str.split('').reverse().join('')
}
