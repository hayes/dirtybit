var parens_regexp = /(^|[^0-9a-zA-Z_$])\((.*)$/

module.exports = create_parens

function create_parens(lookup) {
  var parts = lookup.match(parens_regexp)

  if(!parts) {
    return
  }

  var body = parts[2]
    , self = this
    , count = 1
    , inner
    , outer

  for(var i = 0, l = body.length; i < l; ++i) {
    if(body[i] === ')') {
      --count
    } else if(body[i] === '(') {
      ++count
    }

    if(!count) {
      break
    }
  }

  if(!i || i === l) {
    throw new Error('Unmatched parens: ' + lookup)
  }

  var inner = body.slice(0, i)

  var key = '{{paren_' + self.hash(inner) + '}}'

  var patched = lookup.slice(0
    , lookup.lastIndexOf([parts[2]]) - 1
  ) + key + body.slice(i + 1)

  self.register(inner, function(val) {
    self.updateValue(key, val)
  }, false, lookup)

  self.register(patched, update, false, lookup)

  return true

  function update(val) {
    self.updateValue(lookup, val)
  }
}
