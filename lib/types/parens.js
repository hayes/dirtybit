var parens_regexp = /(^|[^0-9a-zA-Z_$])\((.*)$/

module.exports.parse = parse

function parse(lookup) {
  var parts = lookup.match(parens_regexp)

  if(!parts) {
    return false
  }

  var body = this.split(parts[2], ')')[0]
  var key = '{{paren_' + this.hash(body) + '}}'
  var partials = {}

  partials[key] = body

  var patched = lookup.slice(0, lookup.lastIndexOf([parts[2]]) - 1) +
    key + parts[2].slice(body.length + 1)

  return {proxy: patched, partials: partials}
}
