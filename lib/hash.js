module.exports = hash

function hash(str) {
  var val = 0

  for(var i = 0, len = str.length; i < len; ++i) {
    val = ((val << 5) - val) + str.charCodeAt(i)
    val |= 0
  }

  return val.toString().replace('-', '_')
}
