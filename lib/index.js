var Expression = require('./expression')
var remove = require('./remove')
var types = require('./types')
var parse = require('./parse')
var split = require('./split')
var watch = require('./watch')
var hash = require('./hash')

module.exports = DirtyBit

function DirtyBit(state, options) {
  if(!(this instanceof DirtyBit)) {
    return new DirtyBit(state, options)
  }

  this.options = options || {}

  this.partials = {}
  this.state = state || {}
  this.filters = Object.create(this.options.filters || null)
  this.rootKey = this.options.rootKey

  this.rootExpression = new Expression('this', [], this.state)

  this.expressions = {}
  this.handlers = {}
  this.handlerList = []

  this.expressions['this'] = this.rootExpression
  this.rootExpression.removable = false

  if(this.rootKey) {
    this.expressions[this.rootKey] = this.rootExpression
  }

  this.updating = false
}

DirtyBit.prototype.removeListener = remove
DirtyBit.prototype.addFilter = addFilter
DirtyBit.prototype.update = update
DirtyBit.prototype.report = report
DirtyBit.prototype.types = types
DirtyBit.prototype.split = split
DirtyBit.prototype.parse = parse
DirtyBit.prototype.watch = watch
DirtyBit.prototype.hash = hash
DirtyBit.prototype.trim = trim
DirtyBit.prototype.on = on

DirtyBit.parsed = {}

function update(state) {
  this.state = state
  this.updating = true
  this.rootExpression.change(state)
  this.updating = false
  this.report()
}

function report() {
  var expression
  var lookup

  for(var i = 0, l = this.handlerList.length; i < l; ++i) {
    lookup = this.handlerList[i]
    expression = this.expressions[lookup]

    if(!expression.changed) {
      continue
    }

    for(var j = 0, l2 = this.handlers[lookup].length; j < l2; ++j) {
      this.handlers[lookup][j](expression.value)
    }

    expression.changed = false
  }
}

function addFilter(name, filter) {
  this.filters[name] = filter
}

function trim(str) {
  return str.replace(/^\s+|\s+$/g, '')
}

function on(_lookup, handler) {
  var lookup = this.trim(_lookup)

  if(this.handlers[lookup]) {
    this.handlers[lookup].push(handler)

    return handler(this.expressions[lookup].value)
  }

  this.updating = true
  this.watch(lookup)
  this.handlerList.push(lookup)
  this.handlers[lookup] = [handler]
  this.updating = false
  handler(this.expressions[lookup].value)
}
