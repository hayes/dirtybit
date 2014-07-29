module.exports = list

function list(_lookups, callback, dep_of) {
  var values = new Array(_lookups.length)
    , lookups = _lookups.map(this.clean)
    , callbacks = []

  var key = '[' + lookups.join(',') + ']'

  for(var i = 0, l = lookups.length; i < l; ++i) {
    callbacks[i] = update.bind(this, i)
    this.register(lookups[i], callbacks[i], true)
  }

  if(dep_of) {
    this.events.on(key, callback)
    this.deps[dep_of] = {}

    for(var i = 0, l = lookups.length; i < l; ++i) {
      this.deps[dep_of][lookups[i]] = callbacks[i]
    }
  } else {
    this.on(key, callback)
  }

  callback(this.values[key])

  function update(i, val) {
    values[i] = val
    this.updateValue(key, values)
  }
}