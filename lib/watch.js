var Expression = require('./expression')

module.exports = watch

var seen = {}

function watch(lookup) {
  var self = this

  var parsed = seen[lookup] || (seen[lookup] = self.parse(lookup))
  var partials = parsed.partials && Object.keys(parsed.partials)

  var handler = createHandler.call(self, parsed, change)

  if(partials) {
    for(var i = 0, l = partials.length; i < l; ++i) {
      self.partials[partials[i]] = parsed.partials[partials[i]]
      getDep.call(self, self.partials[partials[i]])
    }
  }

  var expression = createExpression.call(self, parsed, handler)

  self.expressions[lookup] = expression

  if(expression.handler) {
    expression.update()
  }

  return expression

  function change(val) {
    if(self.updating) {
      return expression.change(val)
    }

    self.updating = true
    expression.change(val)
    self.updating = false
    self.report()
  }
}

function createHandler(parsed, change) {
  var type = this.types.types[parsed.type]

  if(typeof type === 'function') {
    return type.call(this, change, parsed.options)
  }

  return null
}

function createExpression(parsed, handler) {
  var deps = parsed.deps ? parsed.deps.map(getDep.bind(this)) : []
  var proxy = parsed.proxy && getDep.call(this, parsed.proxy)
  var expression

  if(proxy) {
    return expression = new Expression(parsed, [proxy], proxy.value, echo)
  }

  return new Expression(parsed, deps, parsed.value, handler)

  function echo(val) {
    expression.change(val)
  }
}

function getDep(_lookup) {
  var lookup = this.trim(_lookup)

  return this.expressions[lookup] || this.watch(lookup)
}
