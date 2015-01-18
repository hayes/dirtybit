module.exports = remove

function remove(_lookup, handler) {
  if(!this.watch.seen[_lookup]) return
  var lookup = this.watch.seen[_lookup].value
  var handlers = this.handlers[lookup]

  if(!handlers) {
    return
  }

  var index
  if((index = handlers.update.indexOf(handler)) !== -1) {
    handlers.update.splice(index, 1)
  }

  if((index = handlers.always.indexOf(handler)) !== -1) {
    handlers.always.splice(index, 1)
  }

  if(handlers.always.length || handlers.update.length) {
    return
  }

  delete this.handlers[lookup]
  removeExpression(this, this.expressions.map[lookup])
}

function removeExpression(self, expression) {
  if(expression.dependents.length || !expression.removable) {
    return
  }


  delete self.expressions.map[expression.lookup]

  var list = expression.type === 'label' ? self.watched : self.expressions.list
  var index = list.indexOf(expression)

  if(index !== -1) {
    list.splice(index, 1)
  }

  for(var i = 0, l = expression.deps.length, dep; i < l; ++i) {
    dep = expression.deps[i]
    dep.dependents.splice(dep.dependents.indexOf(expression), 1)
    if(!self.handlers[dep.lookup]) removeExpression(self, dep)
  }
}
