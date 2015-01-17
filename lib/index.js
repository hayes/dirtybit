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

  this.state = state || {}
  this.helpers = Object.create(this.options.helpers || null)
  this.values = {}
  this.watched = {
    list: [],
    map: {}
  }
  this.expressions = {
    list: [],
    map: {}
  }

  this.handlers = {}
  this.updating = false


  //this.rootKey = this.options.rootKey

  // this.rootExpression = new Expression('this', [], this.state)

  // this.expressions = {}
  // this.handlers = {}
  // this.handlerList = []
  // this.always = []

  // this.expressions['this'] = this.rootExpression
  // this.handlers['this'] = []
  // this.handlerList.push('this')
  // this.rootExpression.removable = false

  // if(this.rootKey) {
  //   this.expressions[this.rootKey] = this.rootExpression
  //   this.handlers[this.rootExpression] = []
  //   this.handlerList.push(this.rootExpression)
  // }

  this.updating = false
}

DirtyBit.prototype.removeListener = remove
DirtyBit.prototype.addHelper = addHelper
DirtyBit.prototype.update = update
DirtyBit.prototype.report = report
DirtyBit.prototype.types = types
DirtyBit.prototype.split = split
DirtyBit.prototype.parse = parse
DirtyBit.prototype.watch = watch
DirtyBit.prototype.hash = hash
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

function addHelper(name, helper) {
  this.helpers[name] = helper
}

function on(lookup, handler) {
  var exp = this.expressions.map[lookup]
  if(!exp) {
    this.updating = true
    exp = this.watch(lookup)
    this.updating = false
  }
  if(!this.handlers[lookup]) this.handlers[lookup] = []
  this.handlers[lookup].push(handler)
  handler(exp.value)
}
