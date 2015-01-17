var Expression = require('./expression')
var Parser = require('../parser')

module.exports = watch

var seen = {}

function watch(lookup) {
  var parsed = seen[lookup] || (seen[lookup] = Parser.parse(lookup))

  var expression = new Expression(
    lookup,
    'expression',
    updateExpression(parsed.compiled)
  )

  this.expressions.map[lookup] = expression
  this.expressions.list.push(expression)
  addDeps.call(this, expression, parsed.deps)
  expression.update()
  expression.changed = false

  return expression
}

function addDeps(parent, deps) {
  for(var i = 0, l = deps.length; i < l; ++i) {
    if(deps[i].type === 'label') {
      addKeyDep.call(this, parent, deps[i])
    } else if(this.expressions.map[deps[i].value]) {
      parent.addDep(this.expressions.map[deps[i].value])
    } else if(deps[i].type === 'helper') {
      addHelperDep.call(this, parent, deps[i])
    }
  }
}

function addHelperDep(parent, dep) {
  var helper = this.helpers[dep.left.value]
  if(!helper) throw new Error('could not find handler: ' + dep.left.value)
  var update = helper(change)
  var exp = new Expression(dep.value, 'helper', function() {
    update(this.args)
  })
  this.expressions.map[dep.value] = exp
  this.expressions.list.push(exp)
  addDeps.call(this, exp, dep.children)
  exp.update()
  parent.addDep(exp)
  exp.changed = false

  function change(val) {
    exp.setValue(val)
  }
}

function addKeyDep(parent, dep) {
  var self = this
  var key = dep.value
  if(this.watched.map[key]) {
    return parent.addDep(this.watched.map[key])
  }
  var exp = new Expression(key, 'key', lookup)
  this.watched.list.push(exp)
  this.watched.map[key] = exp
  exp.update()
  parent.addDep(exp)
  exp.changed = false

  function lookup() {
    this.setValue(
      (self.state === null) || (typeof self.state === 'undefined') ?
      undefined :
      self.state[key]
    )
  }
}

function updateExpression(run) {
  return function() {
    this.setValue(run.apply(null, this.depValues))
  }
}
