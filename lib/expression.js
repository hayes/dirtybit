module.exports = Expression

function Expression(parsed, deps, value, handler) {
  this.dependents = []
  this.deps = deps
  this.parsed = parsed
  this.changed = false
  this.removable = true
  this.value = value
  this.update = update.bind(this)
  this.handler = handler

  for(var i = 0, l = deps.length; i < l; ++i) {
    deps[i].dependents.push(this)
  }
}

Expression.prototype.change = change
Expression.prototype.update = update

function change(val) {
  if(this.value === val && (!this.value || typeof this.value !== 'object')) {
    return
  }

  this.value = val
  this.changed = true

  for(var i = 0, l = this.dependents.length; i < l; ++i) {
    this.dependents[i].update()
  }
}

function update() {
  var args = new Array(this.deps.length)

  for(var i = 0, l = this.deps.length; i < l; ++i) {
    args[i] = this.deps[i].value
  }

  this.handler.apply(null, args)
}
