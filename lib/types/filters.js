var filter_regexp = /^([^\s(]+)\((.*)\)$/

module.exports = create
module.exports.parse = parse

function parse(lookup) {
  var parts = lookup.match(filter_regexp)

  if(!parts) {
    return false
  }

  return {deps: this.split(parts[2], ',', true), options: parts[1]}
}

function create(change, name) {
  return this.filters[name](change) || function() {
    console.error('could not find filter: ' + name)
  }
}
