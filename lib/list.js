module.exports = list

function list(_lookups, callback, internal) {
  var values = new Array(_lookups.length)
    , lookups = _lookups.map(this.clean)

  var key = '[' + lookups.join(',') + ']'

  for(var i = 0, l = lookups.length; i < l; ++i) {
    this.register(lookups[i], update.bind(this, i), true)
  }

  if(internal) {
    this.events.on(key, callback)
  } else {
    this.on(key, callback)
  }

  callback(this.values[key])

  function update(i, val) {
    values[i] = val
    this.updateValue(key, values)
  }
}
