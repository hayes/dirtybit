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
  parts = self.split(parts[2], ',', null, null, true)
  self.registerList(parts, notify, lookup)

  return true

  function notify(args) {
    filter.apply(self, args)
  }

  function update(val) {
    self.updateValue(lookup, val)
  }
}