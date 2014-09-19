module.exports = remove

function remove(_lookup, handler) {
  var lookup = this.trim(_lookup)
  var handlers = this.handlers[lookup]

  if(!handlers) {
    return
  }

  var index = handlers.indexOf(handler)

  if(index < 0) {
    return
  }

  handlers.splice(index, 1)

  if(this.handlers[lookup].length) {
    return
  }

  delete this.handlers[lookup]
  this.handlerList.splice(this.handlerList.indexOf(lookup), 1)
  removeExpression(this, this.expressions[lookup])
}

function removeExpression(self, expression) {
  if(expression.dependents.length || !expression.removable) {
    return
  }

  delete self.expressions[expression.parsed.lookup]

  for(var i = 0, l = expression.deps.length, dep; i < l; ++i) {
    dep = expression.deps[i]
    dep.dependents.splice(dep.dependents.indexOf(expression), 1)
    removeExpression(self, dep)
  }
}
