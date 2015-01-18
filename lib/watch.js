var Expression = require('./expression')
var Parser = require('./parse')
var build = require('./build')

var seen = {}

module.exports = watch
module.exports.seen = seen

function watch(lookup) {
  var parsed = seen[lookup] || (seen[lookup] = Parser.parse(lookup))

  return watchNode.call(this, parsed)
}

function watchNode(node, parent) {
  var exp

  if(node.type === 'label') {
    exp = addLabel.call(this, node)
  } else if(node.type === 'helper') {
    exp = addHelper.call(this, node)
  } else {
    exp = addExpression.call(this, node)
  }

  if(parent) {
    parent.addDep(exp)
  }

  return exp
}

function addLabel(label, parent) {
  var self = this
  var key = label.value
  if(this.expressions.map[key]) {
    return this.expressions.map[key]
  }
  var exp = new Expression(key, 'label', lookup)
  this.watched.push(exp)
  this.expressions.map[key] = exp
  exp.update()
  if(parent) parent.addDep(exp)
  exp.changed = false

  return exp

  function lookup() {
    this.setValue(
      (self.state === null) || (typeof self.state === 'undefined') ?
      undefined :
      self.state[key]
    )
  }
}

function addExpression(node) {
  var lookup = node.value
  if(this.expressions.map[lookup]) {
    return this.expressions.map[lookup]
  }

  var built = build(node)

  var exp = new Expression(
    lookup,
    'expression',
    updateExpression(built.compiled)
  )

  this.expressions.map[lookup] = exp
  this.expressions.list.push(exp)
  addDeps.call(this, exp, built.deps)
  exp.update()
  exp.changed = false

  return exp
}

function addDeps(parent, deps) {
  for(var i = 0, l = deps.length; i < l; ++i) {
    if(deps[i].litteral) {
      parent.depValues[i] = deps[i].rawValue
      continue
    }

    watchNode.call(this, deps[i], parent)
  }
}

function addHelper(node) {
  var self = this
  var key = node.value
  var name = node.data.left.value
  if(this.expressions.map[key]) {
    return this.expressions.map[key]
  }
  var helper = this.helpers[name]
  if(!helper) throw new Error('could not find handler: ' + name)
  var update = helper(change)
  var exp = new Expression(key, 'helper', function(args) {
    update.apply(null, args)
  })
  this.expressions.map[key] = exp
  this.expressions.list.push(exp)
  addDeps.call(this, exp, node.data.children)
  update.apply(null, exp.depValues)
  exp.changed = false

  return exp

  function change(val) {
    if(self.updating) return exp.setValue(val)
    self.updating = true
    exp.setValue(val)
    self.updating = false
    self.report()
  }
}

function updateExpression(run) {
  return function() {
    this.setValue(run.apply(null, this.depValues))
  }
}
