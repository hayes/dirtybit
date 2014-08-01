module.exports = list

function list(_lookups, key) {
  var lookups = _lookups.map(this.clean.bind(this))
    , values = new Array(_lookups.length)

  for(var i = 0, l = lookups.length; i < l; ++i) {
    this.register(lookups[i], update.bind(this, i), false, key)
  }

  function update(i, val) {
    values[i] = val
    this.updateValue.apply(this, [key].concat(values))
  }
}
