module.exports = parse

function parse(lookup) {
  var val

  for(var i = 0, l = this.types.order.length; i < l; ++i) {
    val = this.types.types[this.types.order[i]].parse.call(this, lookup)

    if(val) {
      break
    }
  }

  val.type = this.types.order[i]
  val.lookup = lookup

  return val
}
