var regexp = /^\{\{[#_\w]+\}\}$/

module.exports.parse = parse

function parse(lookup) {
  return regexp.test(lookup) ? {proxy: this.partials[lookup]} : false
}
