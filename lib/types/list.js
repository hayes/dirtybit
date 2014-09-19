var is_list = /^\[.+\]$/

module.exports = list
module.exports.parse = parse

function parse(lookup) {
  if(!is_list.test(lookup)) {
    return false
  }

  return {deps: this.split(lookup.slice(1, -1), ',', true)}
}

function list(change) {
  return function() {
    change([].slice.call(arguments))
  }
}
