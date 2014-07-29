module.exports = split

function split(parts, key, _pairs, all) {
  var pairs = [['(', ')']]
    , layers = []

  pairs = _pairs || pairs

  for(var i = 0, l = parts.length; i < l; ++i) {
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
      layers.pop()

      continue
    }

    for(var j = 0, l2 = pairs.length; j < l2; ++j) {
      if(parts[i] === pairs[j][0]) {
        layers.push(pairs[j][1])

        break
      }
    }
  }

  if(layers.length) {
    throw new Error(
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

  return [left].concat(split(right, key, pairs, all))
}
