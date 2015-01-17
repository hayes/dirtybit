module.exports = Expression

function Expression(lookup, type, update) {
  this.dependents = []
  this.deps = []
  this.lookup = lookup
  this.type = type
  this.changed = false
  this.update = update
  this.depValues = []
}

Expression.prototype.setValue = setValue
Expression.prototype.addDep = addDep

function setValue(value) {
  if(this.value === value && typeof value !== 'object') return

  this.value = value
  this.changed = true
  for(var i = 0, l = this.dependents.length; i < l; ++i) {
    this.dependents[i](value)
  }
}

function addDep(dep) {
  var i = this.deps.length
  this.deps[i] = dep
  var self = this
  dep.dependents.push(function(val) {
    self.depValues[i] = val
    self.update(self.depValues)
  })
  this.depValues[i] = dep.value
}
