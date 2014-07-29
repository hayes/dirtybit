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

  var key = '{{paren_' + hash(body.slice(0, i)) + '}}'

  self.register(body.slice(0, i), function(val) {
    self.updateValue(key, val)
  }, true)

  self.register(
      lookup.slice(
          0
        , lookup.lastIndexOf([parts[2]]) - 1) + key + body.slice(i + 1
      )
    , update
    , true
  )

  return true

  function update(val) {
    self.updateValue(lookup, val)
  }
}

function hash(str) {
  var hash = 0

  for(var i = 0, len = str.length; i < len; ++i) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }

  return hash.toString().replace('-', '#')
}
