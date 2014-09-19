var default_pairs = [
    ['(', ')']
  , ['[', ']']
  , ['?', ':']
  , ['"', '"', true]
  , ["'", "'", true]
]

module.exports = split
module.exports.pairs = default_pairs

function split(parts, key, all, _pairs) {
  var pairs = _pairs || default_pairs
    , inString = false
    , layers = []

  for(var i = 0, l = parts.length; i < l; ++i) {
    if(!~parts.indexOf(key)) {
      i = l

      break
    }

    if(!layers.length) {
      for(var j = 0, l2 = key.length; j < l2; ++j) {
        if(parts[i + j] !== key[j]) {
          break
        }
      }

      if(j === key.length) {
        break
      }
    }

    if(layers.length && layers[layers.length - 1] === parts[i]) {
      inString = false
      layers.pop()

      continue
    }

    if(inString) {
      continue
    }

    for(var j = 0, l2 = pairs.length; j < l2; ++j) {
      if(parts[i] === pairs[j][0]) {
        if(pairs[j][2]) {
          inString = true
        }

        layers.push(pairs[j][1])

        break
      }
    }
  }

  if(layers.length) {
    console.error(
        'Unmatched pair in ' + parts + '. expecting: ' + layers.pop()
    )
  }

  if(i === parts.length) {
    return [parts]
  }

  var right = parts.slice(i + key.length)
    , left = parts.slice(0, i)

  if(!all) {
    return [left, right]
  }

  return [left].concat(split(right, key, all, pairs))
}
