var string_regexp = /^(?:'((?:[^'\\]|(?:\\.))*)'|"((?:[^"\\]|(?:\\.))*)")$/
  , number_regexp = /^(\d*(?:\.\d+)?)$/

module.exports.parse = parse

var vals = {
    'true': true
  , 'false': false
  , 'null': null
  , 'undefined': undefined
}

function parse(lookup) {
  if(vals.hasOwnProperty(lookup)) {
    return {value: vals[lookup]}
  }

  if(number_regexp.test(lookup)) {
    return {value: +lookup}
  }

  if(string_regexp.test(lookup)) {
    return {value: lookup.slice(1, -1)}
  }
}
