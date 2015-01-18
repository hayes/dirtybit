var dirtyBit = require('../lib/index')()
var test = require('tape')

dirtyBit.addHelper('double', double)
dirtyBit.addHelper('pow', pow)

function double(change) {
  return function(n) {
    setTimeout(function() {change(2 * n)}, 100)
  }
}

function pow(change) {
  return function(n, x) {
    change(Math.pow(n, x))
  }
}

test('helpers', function(t) {
  t.plan(3)

  dirtyBit.on('double(5)', function(val) {
    if(typeof val === 'undefined' || isNaN(val)) return
    t.strictEqual(val, 10)
  })

  dirtyBit.on('double(double(5)) + 1', function(val) {
    if(typeof val === 'undefined' || isNaN(val)) return
    t.strictEqual(val, 21)
  })

  dirtyBit.on('pow(2, 3)', function(val) {
    t.strictEqual(val, 8)
  })
})
