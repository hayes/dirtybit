var string_regexp = /^(?:'((?:[^'\\]|(?:\\.))*)'|"((?:[^"\\]|(?:\\.))*)")$/
  , number_regexp = /^(\d*(?:\.\d+)?)$/

module.exports = create_value

var vals = {
    'true': true
  , 'false': false
  , 'null': null
  , 'undefined': undefined
}

function create_value(lookup) {
  var parts

  if(vals.hasOwnProperty(lookup)) {
    return this.updateValue(lookup, vals[lookup]) || true
  }

  if(parts = lookup.match(number_regexp)) {
    return this.updateValue(lookup, +parts[1]) || true
  }

  if(parts = lookup.match(string_regexp)) {
    return this.updateValue(lookup, parts[1] || parts[2] || '') || true
  }
}
