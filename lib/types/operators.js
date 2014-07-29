var ternary_regexp = /^\s*(.+?)\s*\?(.*)\s*$/

module.exports = operator

var updaters = {}
  , types = []

// push in inverse order of operations
types.push({
    test: ternary_regexp
  , create: create_ternary
})

types.push(binary(['|\\|']))
types.push(binary(['&&']))
types.push(binary(['|']))
types.push(binary(['^']))
types.push(binary(['&']))
types.push(binary(['===', '!==', '==', '!=']))
types.push(binary(['>=', '<=', '>', '<', ' in ', ' instanceof ']))
// types.push(binary(['<<', '>>', '>>>'])) //conflics with < and >
types.push(binary(['+', '-']))
types.push(binary(['*', '/', '%']))
types.push(unary(['!', '+', '-', '~']))

updaters['in'] = update_in
updaters['instanceof'] = update_instanceof

function operator(lookup) {
  var parts

  for(var i = 0, l = types.length; i < l; ++i) {
    if(parts = lookup.match(types[i].test)) {
      types[i].create.call(this, parts, lookup)

      return true
    }
  }
}

function create_ternary(parts, lookup) {
  var self = this
    , right
    , left
    , ok

  var rest = self.split(parts[2], ':', [['?', ':'], ['(', ')']])

  if(rest.length !== 2) {
    throw new Error('Unmatched ternary in: ' + lookup)
  }

  self.register(parts[1], function(val) {
    ok = val
    update()
  }, true)
  self.register(rest[0], function(val) {
    left = val
    update()
  }, true)
  self.register(rest[1], function(val) {
    right = val
    update()
  }, true)

  function update() {
    self.updateValue(lookup, ok ? left : right)
  }
}

function binary(list) {
  return {
      test: new RegExp('^(.+?)(\\' + list.join('|\\') + ')(.+)$')
    , create: create_binary
  }
}

function create_binary(parts, lookup) {
  var update = updaters[this.clean(parts[2])]
    , self = this
    , right
    , left

  if(!update) {
    update = Function('lhs, rhs', 'return lhs ' + parts[2] + ' rhs')
  }

  self.register(parts[1], function(val) {
    self.updateValue(lookup, update(left = val, right))
  }, true)

  self.register(parts[3], function(val) {
    self.updateValue(lookup, update(left, right = val))
  }, true)
}

function unary(list) {
  var regex = new RegExp('^(\\' + list.join('|\\') + ')(.+)$')

  return {test: regex, create: create_unary}
}

function create_unary(parts, lookup) {
  var update = Function('val', 'return ' + parts[1] + 'val')
    , self = this

  self.register(parts[2], function(val) {
    self.updateValue(lookup, update(val))
  }, true)
}

function update_in(left, right) {
  return typeof right !== 'undefined' && left in right
}

function update_instanceof(left, right) {
  return typeof right === 'function' && left instanceof right
}
