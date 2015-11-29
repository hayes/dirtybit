var List = require('./list.js')
var watch = require('./watch')
var remove = require('./remove')

module.exports = ChangeDetector

function ChangeDetector (state, options, scope) {
  if (!(this instanceof ChangeDetector)) {
    return new ChangeDetector(state, options, scope)
  }

  this.expressions = new List()
  this.updating = false
  this.expressions = Object.create(null)
  this.helpers = Object.create(null)
  this.scope = scope || Object.create(null)
  this.state = state
  this.queue = []
  this.helpers = Object.create(null)
  this.root = this.on('this', function () {})
}

ChangeDetector.prototype.on = watch
ChangeDetector.prototype.removeListener = remove

ChangeDetector.prototype.update = function update (value) {
  this.state = value
  this.updating = true
  this.root.setValue(value)
  this.updating = false
  this.processQueue()
}

ChangeDetector.prototype.processQueue = function processQueue () {
  if (this.updating) return
  this.updating = true
  while (this.queue.length) {
    var queue = this.queue
    this.queue = []
    for (var i = 0, len = queue.length; i < len; ++i) {
      queue[i].update(true)
    }
  }

  this.updating = false
}

ChangeDetector.prototype.addHelper = function addHelper (name, fn) {
  if (typeof name !== 'string') throw new Error('Helper name must be a string')
  if (typeof fn !== 'function') throw new Error('Helper must be a function')
  this.helpers[name] = fn
}
