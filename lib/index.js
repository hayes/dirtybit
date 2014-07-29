var operators = require('./types/operators')
  , brackets = require('./types/brackets')
  , dot_path = require('./types/dot-path')
  , filters = require('./types/filters')
  , partial = require('./types/partial')
  , EE = require('events').EventEmitter
  , parens = require('./types/parens')
  , values = require('./types/values')
  , split = require('./split')
  , list = require('./list')

module.exports = DirtyBit

function DirtyBit(state, filters) {
  if(!(this instanceof DirtyBit)) {
    return new DirtyBit(state, filters)
  }

  EE.call(this)
  this.state = state || {}
  this.events = new EE
  this.values = Object.create(null)
  this.lookups = Object.create(null)
  this.filters = Object.create(filters || null)
  this.getters = []
  this.updating = false
  this.updates = {}
  this.setMaxListeners(0)
  this.events.setMaxListeners(0)
}

DirtyBit.prototype = Object.create(EE.prototype)
DirtyBit.prototype.updateValue = updateValue
DirtyBit.prototype.constructor = DirtyBit
DirtyBit.prototype.addFilter = addFilter
DirtyBit.prototype.register = register
DirtyBit.prototype.registerList = list
DirtyBit.prototype.update = update
DirtyBit.prototype.on = cleaned_on
DirtyBit.prototype.watch = watch
DirtyBit.prototype.clean = clean
DirtyBit.prototype.split = split
DirtyBit.prototype.types = []

DirtyBit.prototype.types.push(values)
DirtyBit.prototype.types.push(filters)
DirtyBit.prototype.types.push(partial)
DirtyBit.prototype.types.push(parens)
DirtyBit.prototype.types.push(operators)
DirtyBit.prototype.types.push(brackets)
DirtyBit.prototype.types.push(dot_path)

function register(_lookup, callback, internal, _first) {
  var first = _first || typeof first === 'undefined'
    , lookup = this.clean(_lookup)

  if(internal) {
    this.events.on(lookup, callback)
  } else {
    this.on(lookup, callback)
  }

  if((this.lookups[lookup] = ~~this.lookups[lookup] + 1) !== 1) {
    if(first) {
      callback(this.values[lookup])
    }

    return
  }

  if(!this.updating) {
    this.updating = true
    this.watch(lookup)
    this.updating = false
    callback(this.updates[lookup])
    this.updates = {}
  } else {
    this.watch(lookup)
  }

}

function watch(_lookup) {
  var lookup = this.clean(_lookup)

  for(var i = 0, l = this.types.length; i < l; ++i) {
    if(this.types[i].call(this, lookup)) {
      break
    }
  }

  if(i === l) {
    throw new Error('invalid lookup: ' + lookup)
  }
}

function updateValue(lookup, val) {
  if(this.values[lookup] === val && typeof val !== 'object') {
    return
  }

  this.values[lookup] = val
  this.events.emit(lookup, val)

  if(this.updating) {
    return this.updates[lookup] = val
  }

  this.emit(lookup, val)
}

function update(val) {
  this.updating = true
  this.state = val

  for(var i = 0, l = this.getters.length; i < l; ++i) {
    this.getters[i](val)
  }

  this.updating = false

  var updates = Object.keys(this.updates)

  for(var i = 0, l = updates.length; i < l; ++i) {
    this.emit(updates[i], this.updates[updates[i]])
  }

  this.updates = {}
}

function addFilter(name, filter) {
  this.filters[name] = filter
}

function clean(lookup) {
  return lookup.replace(/^\s+|\s+$/g, '')
}

function cleaned_on(lookup, callback) {
  EE.prototype.on.call(this, this.clean(lookup), callback)
}
