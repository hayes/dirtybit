var dirtyBit = require('../lib/index')()
  , test = require('tape')

dirtyBit.addFilter('double', double)
dirtyBit.addFilter('pow', pow)

function double(change) {
  return function(n) {
    change(2 * n)
  }
}

function pow(change) {
  return function(n, x) {
    change(Math.pow(n, x))
  }
}

test('filters', function(t) {
  t.plan(3)

  dirtyBit.register('double(5)', function(val) {
    t.strictEqual(val, 10)
  })

  dirtyBit.register('double(double(5)) + 1', function(val) {
    t.strictEqual(val, 21)
  })

  dirtyBit.register('pow(2, 3)', function(val) {
    t.strictEqual(val, 8)
  })
})
