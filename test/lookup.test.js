var DirtyBit = require('../index')
  , test = require('tape')

test('filters', function(t) {
  var val = {}

  val.a = {}
  val.a.b = '100'
  val.a.c = 95

  var instance = DirtyBit(val)

  t.plan(3)

  instance.register('a.b - a.c', function(val) {
    t.strictEqual(val, 5)
  })

  instance.register('a.b.length', function(val) {
    t.strictEqual(val, 3)
  })

  instance.register('((a.c - a.b) + "").length', function(val) {
    t.strictEqual(val, 2)
  })
})
