var Expression = require('./expression')
var remove = require('./remove')
var parse = require('./parse')
var watch = require('./watch')

module.exports = DirtyBit

function DirtyBit(state, options) {
  if(!(this instanceof DirtyBit)) {
    return new DirtyBit(state, options)
  }

  this.options = options || {}

  this.state = state || {}
  this.helpers = Object.create(this.options.helpers || null)
  this.values = {}
  this.watched = []
  this.expressions = {
    list: [],
    map: {}
  }

  this.handlers = {}
  this.always = {}
  this.updating = false

  this.rootKey = this.options.rootKey

  this.rootExpression = new Expression('this', 'root', null, this.state)
  this.expressions.map.this = this.rootExpression
  this.rootExpression.removable = false


  if(this.rootKey) {
    this.expressions[this.rootKey] = this.rootExpression
  }
}

DirtyBit.prototype.removeListener = remove
DirtyBit.prototype.addHelper = addHelper
DirtyBit.prototype.update = update
DirtyBit.prototype.report = report
DirtyBit.prototype.parse = parse
DirtyBit.prototype.watch = watch
DirtyBit.prototype.on = on

DirtyBit.parsed = {}

function update(state) {
  this.state = state
  this.updating = true
  for(var i = 0, l = this.watched.length; i < l; ++i) {
    this.watched[i].update()
  }
  this.updating = false
  this.report()
}

function report() {
  var lookups = Object.keys(this.handlers)

  for(var i = 0, l = lookups.length; i < l; ++i) {
    var expression = this.expressions.map[lookups[i]]
    var handlers = this.handlers[lookups[i]].always
    for(var j = 0, l2 = handlers.length; j < l2; ++j) {
      handlers[j](expression.value)
    }
    if(!expression.changed) continue
    handlers = this.handlers[lookups[i]].update
    for(var j = 0, l2 = handlers.length; j < l2; ++j) {
      handlers[j](expression.value)
    }

    expression.changed = false
  }
}

function addHelper(name, helper) {
  this.helpers[name] = helper
}

function on(lookup, handler, always) {
  var exp = this.expressions.map[lookup]
  if(!exp) {
    this.updating = true
    exp = this.watch(lookup)
    this.updating = false
  }

  if(!this.handlers[lookup]) {
    this.handlers[lookup] = {
      always: [],
      update: [],
    }
  }

  if(always) {
    this.handlers[lookup].always.push(handler)
  } else {
    this.handlers[lookup].update.push(handler)
  }
  handler(exp.value)
  return this
}
