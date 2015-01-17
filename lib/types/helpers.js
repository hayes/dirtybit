var helper_regexp = /^([^\s(]+)\((.*)\)$/

module.exports = create
module.exports.parse = parse

function parse(lookup) {
  var parts = lookup.match(helper_regexp)

  if(!parts) {
    return false
  }

  return {deps: this.split(parts[2], ',', true), options: parts[1]}
}

function create(change, name) {
  return (this.helpers[name] || function() {
    console.error('could not find helper: ' + name)
    return function() {}
  })(change)
}
