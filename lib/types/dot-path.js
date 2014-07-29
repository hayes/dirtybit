var valid_path = /^(.*)\.([^.\s]+)$/

module.exports = dot_path

function dot_path(lookup) {
  var parts = lookup.match(valid_path)
    , self = this

  if(parts) {
    self.register(parts[1], update, true)

    return true
  }

  update(self.state)

  return self.getters.push(update)

  function update(obj) {
    if(obj === null || obj === undefined) {
      return self.updateValue(lookup, undefined)
    }

    self.updateValue(lookup, obj[parts ? parts[2] : lookup])
  }
}
