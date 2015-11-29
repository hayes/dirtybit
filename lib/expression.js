var List = require('./list')

module.exports = Expression

function Expression (detector, check, node, deps) {
  this.dependents = new List()
  this.detector = detector
  this.check = check || passThrough
  this.value = void 0
  this.shouldUpdate = false
  this.node = node
  this.dependencies = new Array(deps.length)
  this.handlers = []

  for (var i = 0, len = deps.length; i < len; ++i) {
    this.dependencies[i] = deps[i].dependents.add(this)
  }
}

Expression.prototype.update = function update (onlyOnce) {
  if (onlyOnce && !this.shouldUpdate) return
  this.shouldUpdate = false
  this.check()
}

Expression.prototype.setValue = function setValue (value) {
  if (value === this.value && (!value || typeof value !== 'object')) {
    return
  }

  this.value = value
  this.report()

  if (!this.dependents.head) return

  var current = this.dependents.head
  while (current) {
    var expression = current.value
    if (!this.detector.updating) {
      expression.update(false)
    } else {
      expression.shouldUpdate = true
      this.detector.queue.push(expression)
    }

    current = current.next
  }
}

Expression.prototype.report = function report () {
  var handlers = this.handlers
  var len = this.handlers.length
  var val = this.value

  for (var i = 0; i < len; ++i) {
    handlers[i](val)
  }
}

Expression.prototype.lookup = function lookup (obj, key) {
  return obj === null || obj === undefined ? undefined : obj[key]
}

function passThrough (value) {
  return value
}
