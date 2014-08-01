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

function DirtyBit(state, _options) {
  if(!(this instanceof DirtyBit)) {
    return new DirtyBit(state, _options)
  }

  var options = _options || {}

  EE.call(this)
  this.state = state || {}
  this.events = new EE
  this.deps = Object.create(null)
  this.values = Object.create(null)
  this.lookups = Object.create(null)
  this.filters = Object.create(options.filters || null)
  this.always = []
  this.getters = []
  this.updating = false
  this.updates = {}
  this.setMaxListeners(0)
  this.events.setMaxListeners(0)
  this.rootKey = options.rootKey
  this.lookups['this'] = Infinity
  this.lookups[this.rootKey] = Infinity
  this.update(this.state)
}

DirtyBit.prototype = Object.create(EE.prototype)
DirtyBit.prototype.updateValue = updateValue
DirtyBit.prototype.deregister = deregister
DirtyBit.prototype.constructor = DirtyBit
DirtyBit.prototype.addFilter = addFilter
DirtyBit.prototype.register = register
DirtyBit.prototype.registerList = list
DirtyBit.prototype.update = update
DirtyBit.prototype.on = cleaned_on
DirtyBit.prototype.watch = watch
DirtyBit.prototype.clean = clean
DirtyBit.prototype.split = split
DirtyBit.prototype.hash = hash
DirtyBit.prototype.types = []

DirtyBit.prototype.types.push(values)
DirtyBit.prototype.types.push(filters)
DirtyBit.prototype.types.push(partial)
DirtyBit.prototype.types.push(parens)
DirtyBit.prototype.types.push(operators)
DirtyBit.prototype.types.push(brackets)
DirtyBit.prototype.types.push(dot_path)

function register(_lookup, callback, all, dep_of, _first) {
  var lookups = this.split(this.clean(_lookup), ',', true)
    , first = _first || typeof first === 'undefined'

  if(lookups.length > 1) {
    return this.registerList(lookups, callback, dep_of, first)
  }

  var lookup = lookups[0]

  if(dep_of) {
    this.events.on(lookup, callback)
    this.deps[dep_of] = this.deps[dep_of] || {}
    this.deps[dep_of][lookup] = callback
  } else if(all) {
    this.always.push({lookup: lookup, callback: callback})
  } else {
    this.on(lookup, callback)
  }

  if((this.lookups[lookup] = (this.lookups[lookup] || 0) + 1) !== 1) {
    if(first) {
      callback.apply(
          this
        , this.values[lookup] ? this.values[lookup].slice(1) : undefined
      )
    }

    return
  }

  if(!this.updating) {
    this.updating = true
    this.watch(lookup)
    this.updating = false
    callback.apply(
        this
      , this.values[lookup] ? this.values[lookup].slice(1) : undefined
    )
    this.updates = {}
  } else {
    this.watch(lookup)
  }

}

function deregister(_lookup, callback) {
  var lookup = this.clean(_lookup)
    , deps = this.deps[lookup]
    , names

  this.removeListener(lookup, callback)
  this.events.removeListener(lookup, callback)
  --this.lookups[lookup]

  if(this.lookups[lookup] > 0 || !deps) {
    return
  }

  this.always = this.always.filter(function(handler) {
    return !(handler.callback === callback && handler.lookup === lookup)
  })

  if(!this._events[lookup] && !this.events._events[lookup]) {
    names = Object.keys(deps)
    delete this.deps[lookup]
    delete this.values[lookup]
    delete this.lookups[lookup]

    for(var i = 0, l = names.length; i < l; ++i) {
      this.deregister(names[i], deps[names[i]])
    }
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

function updateValue(lookup) {
  var args = Array.prototype.slice.call(arguments)

  for(var i = 0, l = args.length; i < l; ++i) {
    if(!this.values[lookup]) {
      break
    }

    if(this.values[lookup][i] === args[i] && typeof args[i] !== 'object') {
      break
    }
  }

  if(i === l) {
    return
  }

  this.values[lookup] = args
  this.events.emit.apply(this.events, args)

  if(this.updating) {
    return this.updates[lookup] = args
  }

  this.emit.apply(this, args)
}

function update(val) {
  this.updating = true
  this.state = val
  this.state

  this.updateValue('this', val)
  this.rootKey && this.updateValue(this.rootKey, val)

  for(var i = 0, l = this.getters.length; i < l; ++i) {
    this.getters[i](val)
  }

  this.updating = false

  var updates = Object.keys(this.updates)

  for(var i = 0, l = updates.length; i < l; ++i) {
    this.emit.apply(this, this.updates[updates[i]])
  }

  for(var i = 0, l = this.always.length; i < l; ++i) {
    this.always[i].callback.apply(
        this
      , this.values[this.always[i].lookup].slice(1)
    )
  }

  this.updates = {}
}

function addFilter(name, filter) {
  this.filters[name] = filter
}

function clean(lookup) {
  return this.split(lookup, ',', true).map(trim).join(',')
}

function trim(str) {
  return str.replace(/^\s+|\s+$/g, '')
}

function cleaned_on(lookup, callback) {
  EE.prototype.on.call(this, this.clean(lookup), callback)
}

function hash(str) {
  var hash = 0

  for(var i = 0, len = str.length; i < len; ++i) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }

  return hash.toString().replace('-', '#')
}
