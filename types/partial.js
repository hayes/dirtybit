var regexp = /^\{\{.+\}\}$/

module.exports = partial

function partial(lookup) {
  var value = this.values[lookup]

  if(regexp.test(lookup)) {
    if(this.lookups[lookup] === 1) {
      this.values[lookup] = {}
      this.updateValue(lookup, value)
    }

    return true
  }
}
