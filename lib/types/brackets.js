var has_bracket = /^.+\[.+\]$/

module.exports = dot_path

function dot_path(lookup) {
  if(!has_bracket.test(lookup)) {
    return
  }

  var parts = this.split(
      reverse(lookup.slice(0, -1))
    , '['
    , [[']', '['], [')', '(']]
  ).map(reverse)

  var self = this
    , inner
    , root

  this.register(parts[0], function(val) {
    inner = val
    update()
  }, true)

  this.register(parts[1], function(val) {
    root = val
    update()
  }, true)

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
