var filter_regexp = /^([^\s(]+)\((.*)\)$/

module.exports = create_filter

function create_filter(lookup) {
  var parts = lookup.match(filter_regexp)
    , self = this

  if(!parts) {
    return
  }

  var filter = self.filters[parts[1]]

  if(!filter) {
    throw new Error('could not find filter: ' + lookup)
  }

  filter = filter.call(self, update)
  self.register(parts[2], notify, false, lookup)

  return true

  function notify() {
    filter.apply(self, arguments)
  }

  function update(val) {
    self.updateValue(lookup, val)
  }
}
